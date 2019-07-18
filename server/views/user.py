import logging
from flask import jsonify, request, redirect, send_file
import flask_login
from mediacloud.error import MCException
import tempfile
import json
import os
import csv
import io
import zipfile

from server import app, auth, mc, user_db
from server.auth import user_mediacloud_client, user_name
from server.util.request import api_error_handler, form_fields_required, arguments_required, json_error_response
from server.views.topics.topiclist import topics_user_owns

logger = logging.getLogger(__name__)

AUTH_MANAGEMENT_DOMAIN = 'https://tools.mediacloud.org'  # because it is too hard to tell which site you are on
ACTIVATION_URL = AUTH_MANAGEMENT_DOMAIN + "/api/user/activate/confirm"
PASSWORD_RESET_URL = AUTH_MANAGEMENT_DOMAIN + "/api/user/reset-password-request-receive"


def merged_user_profile(user_results):
    if not isinstance(user_results,dict):
        user_results = user_results.get_properties()

    user_email = user_results['profile']['email']
    user_results["user"] = mc.userList(search=user_email)['users'][0]

    merged_user_info = user_results['profile'].copy()  # start with x's keys and values
    merged_user_info.update(user_results["user"])
    if 'error' in user_results:
        return json_error_response(user_results['error'], 401)
    user = auth.create_and_cache_user(merged_user_info)
    return user


@app.route('/api/login', methods=['POST'])
@form_fields_required('email', 'password')
@api_error_handler
def login_with_password():
    username = request.form["email"]
    logger.debug("login request from %s", username)
    password = request.form["password"]
    # try to log them in
    results = mc.authLogin(username, password)
    user = merged_user_profile(results)
    logger.debug("  succeeded - got a key (user.is_anonymous=%s)", user.is_anonymous)
    auth.login_user(user)
    return jsonify(user.get_properties())


@app.route('/api/login-with-cookie')
@api_error_handler
def login_with_cookie():
    cached_user = flask_login.current_user
    if cached_user.is_anonymous:   # no user session
        logger.debug("  login failed (%s)", cached_user.is_anonymous)
        return json_error_response("Login failed", 401)
    user = merged_user_profile(cached_user)
    return jsonify(user.get_properties())


@app.route('/api/user/signup', methods=['POST'])
@form_fields_required('email', 'password', 'fullName', 'notes', 'has_consented')
@api_error_handler
def signup():
    logger.debug("reg request from %s", request.form['email'])
    results = mc.authRegister(request.form['email'],
                              request.form['password'],
                              request.form['fullName'],
                              request.form['notes'],
                              False,
                              ACTIVATION_URL,
                              bool(request.form['has_consented'] == 'true') if 'has_consented' in request.form else False,
                              )
    return jsonify(results)


@app.route('/api/user/activate/confirm', methods=['GET'])
@arguments_required('email', 'activation_token')
def activation_confirm():
    logger.debug("activation request from %s", request.args['email'])
    try:
        results = mc.authActivate(request.args['email'], request.args['activation_token'])
        if results['success'] is 1:
            redirect_to_return = redirect(AUTH_MANAGEMENT_DOMAIN + '/#/user/activated?success=1')
        else:
            redirect_to_return = redirect(AUTH_MANAGEMENT_DOMAIN + '/#/user/activated?success=0&msg=' +
                                          results['error'])
    except MCException as mce:
        # this is long stack trace so we have to trim it for url length support
        redirect_to_return = redirect(AUTH_MANAGEMENT_DOMAIN + '/#/user/activated?success=0&msg=' + str(mce[:300]))
    return redirect_to_return


@app.route('/api/user/activation/resend', methods=['POST'])
@form_fields_required('email')
@api_error_handler
def activation_resend():
    email = request.form['email']
    logger.debug("activation request from %s", email)
    results = mc.authResendActivationLink(email, ACTIVATION_URL)
    return jsonify(results)


@app.route('/api/user/reset-password-request', methods=['POST'])
@form_fields_required('email')
@api_error_handler
def request_password_reset():
    logger.debug("request password reset from %s", request.form['email'])
    results = mc.authSendPasswordResetLink(request.form["email"], PASSWORD_RESET_URL)
    return jsonify(results)


# crazy redirect workaround becasue the backend isn't handling the #-based URL part we want to use
@app.route('/api/user/reset-password-request-receive', methods=['GET'])
@arguments_required('email', 'password_reset_token')
@api_error_handler
def request_password_reset_receive():
    redirect_to_return = redirect(AUTH_MANAGEMENT_DOMAIN +
                                  '/#/user/reset-password?email={}&password_reset_token={}'.format(
                                      request.args['email'], request.args['password_reset_token']))
    return redirect_to_return


@app.route('/api/user/reset-password', methods=['POST'])
@form_fields_required('email', 'password_reset_token', 'new_password')
@api_error_handler
def reset_password():
    logger.debug("reset password for %s", request.form['email'])
    results = mc.authResetPassword(request.form["email"], request.form['password_reset_token'],
                                   request.form['new_password'])
    return jsonify(results)


@app.route('/api/user/change-password', methods=['POST'])
@form_fields_required('old_password', 'new_password')
@flask_login.login_required
@api_error_handler
def change_password():
    user_mc = user_mediacloud_client()
    results = {}
    try:
        results = user_mc.authChangePassword(request.form['old_password'], request.form['new_password'])
    except MCException as e:
        logger.exception(e)
        if 'Unable to change password' in e.message:
            if 'Old password is incorrect' in e.message or 'Unable to log in with old password' in e.message:
                return json_error_response('Unable to change password - old password is incorrect')
            if 'not found or password is incorrect' in e.message:
                return json_error_response('Unable to change password - user not found or password is incorrect')
        else:
            return json_error_response('Unable to change password - see log for more details')

    return jsonify(results)


@app.route('/api/user/reset-api-key', methods=['POST'])
@flask_login.login_required
@api_error_handler
def reset_api_key():
    user_mc = user_mediacloud_client()
    results = user_mc.authResetApiKey()
    flask_login.current_user.profile = results['profile']   # update server api key too
    return jsonify(results)


@app.route('/api/user/logout')
def logout():
    flask_login.logout_user()
    return redirect("/")


@app.route('/api/user/delete', methods=['POST'])
@form_fields_required('email')
@api_error_handler
@flask_login.login_required
def api_user_delete():
    email = request.form['email']
    user = flask_login.current_user
    if email == user.name:  # double-check confirmation they typed in
        # delete them from the front-end system database
        user_db.delete_user(user.name)
        # delete them from the back-end system
        results = mc.userDelete(user.profile['auth_users_id'])  # need to do this with the tool's admin account
        try:
            if ('success' in results) and (results['success'] is 1):
                return logout()
            else:
                return json_error_response("We failed to delete your account, sorry!", 400)
        except MCException as mce:
            logger.exception(mce)
            return json_error_response("We failed to delete your account, sorry!", 400)
    else:
        return json_error_response("Your email confirmation didn't match.", 400)


@app.route('/api/user/update', methods=['POST'])
@form_fields_required('full_name', 'notes', 'has_consented')
@api_error_handler
@flask_login.login_required
def api_user_update():
    has_consented = request.form['has_consented'] == 'true'
    valid_params = {
        'full_name': request.form['full_name'],
        'notes': request.form['notes'],
        'has_consented': has_consented
    }
    cached_user = flask_login.current_user
    results = mc.userUpdate(cached_user.profile['auth_users_id'], **valid_params)  # need to do this with the tool admin client
    user = merged_user_profile(cached_user)
    return jsonify(user.get_properties())


@app.route('/api/user/download-data')
@api_error_handler
@flask_login.login_required
def api_user_data_download():
    user_mc = user_mediacloud_client()
    temp_user_data_dir = _save_user_data_dir(flask_login.current_user, user_mc)
    data = _zip_in_memory(temp_user_data_dir)  # do this in memory to be extra safe on security
    return send_file(data, mimetype='application/zip', as_attachment=True, attachment_filename='mediacloud-data.zip')


def _zip_in_memory(dir_to_zip):
    # remember our home dir
    old_path = os.getcwd()
    os.chdir(dir_to_zip)
    # send
    data = io.BytesIO()
    with zipfile.ZipFile(data, mode='w') as z:
        for f_name in os.listdir("."):  # doing the whole path switch to make sure the zip folder structure is right
            z.write(f_name)
            os.unlink(f_name)
    data.seek(0)  # to make sure the file starts at teh begging again, *not* where the zip commands left it
    # put us back in the home dir
    os.chdir(old_path)
    os.rmdir(dir_to_zip)
    return data


def _save_user_data_dir(u, user_mc):
    # make a dir first (prefix with user_id for extra security)
    temp_dir = tempfile.mkdtemp(prefix='user{}'.format(u.profile['auth_users_id']))
    # user profile
    with open(os.path.join(temp_dir, 'profile.json'), 'w') as outfile:
        profile = u.profile
        json.dump(profile, outfile)
    # topic-level permissions
    with open(os.path.join(temp_dir, 'topic-permissions.csv'), 'w') as outfile:
        topics = user_mc.topicList(limit=1000)['topics']
        user_owned_topics = topics_user_owns(topics, u.profile['email'])
        topic_permission_list = [{
            'topics_id': t['topics_id'],
            'topic_name': t['name'],
            'permission': t['user_permission'],
        } for t in user_owned_topics]
        writer = csv.DictWriter(outfile, ['topics_id', 'topic_name', 'permission'])
        writer.writeheader()
        writer.writerows(topic_permission_list)
    # saved searches
    with open(os.path.join(temp_dir, 'saved-searches.json'), 'w') as outfile:
        search_list = user_db.get_users_lists(u.name, 'searches')
        json.dump(search_list, outfile)
    # starred sources
    with open(os.path.join(temp_dir, 'starred-sources.csv'), 'w') as outfile:
        user_favorited = user_db.get_users_lists(user_name(), 'favoriteSources')
        media_sources = [user_mc.media(media_id) for media_id in user_favorited]
        media_sources = [{
            'media_id': m['media_id'],
            'name': m['name'],
            'url': m['url']
        } for m in media_sources]
        writer = csv.DictWriter(outfile, ['media_id', 'name', 'url'])
        writer.writeheader()
        writer.writerows(media_sources)
    # starred collections
    with open(os.path.join(temp_dir, 'starred-collections.csv'), 'w') as outfile:
        user_favorited = user_db.get_users_lists(user_name(), 'favoriteCollections')
        collections = [user_mc.tag(tags_id) for tags_id in user_favorited]
        collections = [{
            'tags_id': c['tags_id'],
            'label': c['label'],
            'description': c['description']
        } for c in collections]
        writer = csv.DictWriter(outfile, ['tags_id', 'label', 'description'])
        writer.writeheader()
        writer.writerows(collections)
    # starred topics
    with open(os.path.join(temp_dir, 'starred-topics.csv'), 'w') as outfile:
        user_favorited = user_db.get_users_lists(user_name(), 'favoriteTopics')
        topics = [user_mc.topic(topics_id) for topics_id in user_favorited]
        topics = [{
            'topics_id': t['topics_id'],
            'name': t['name'],
            'description': t['description']
        } for t in topics]
        writer = csv.DictWriter(outfile, ['topics_id', 'name', 'description'])
        writer.writeheader()
        writer.writerows(topics)
    return temp_dir
