import logging
from flask import request, jsonify, render_template
import flask_login
from datetime import datetime

from server import app
from server.auth import user_admin_mediacloud_client, user_name
from server.util.mail import send_html_email
from server.util.request import form_fields_required, api_error_handler, json_error_response
from server.views.sources.source import tag_ids_from_collections_param

logger = logging.getLogger(__name__)


@app.route('/api/sources/suggestions', methods=['GET'])
@flask_login.login_required
@api_error_handler
def source_suggestions():
    user_mc = user_admin_mediacloud_client()
    show_all = request.args['all'] == '1' if 'all' in request.args else False
    suggestions = user_mc.mediaSuggestionsList(all=show_all)
    return jsonify({'list': suggestions})


def _media_suggestion(user_mc, suggestion_id):
    pending = user_mc.mediaSuggestionsList(all=True)
    for suggestion in pending:
        if int(suggestion['media_suggestions_id']) == int(suggestion_id):
            return suggestion
    return None


@app.route('/api/sources/suggestions/<suggestion_id>/update', methods=['POST'])
@form_fields_required('status', 'reason')
@flask_login.login_required
@api_error_handler
def source_suggestion_update(suggestion_id):
    user_mc = user_admin_mediacloud_client()
    suggestion = _media_suggestion(user_mc, suggestion_id)
    if suggestion is None:
        return json_error_response("Unknown suggestion id {}".format(suggestion_id))
    status = request.form['status']
    reason = request.form['reason']
    results = None
    email_note = ""
    if status == "approved":
        # if approved, we have to create it
        flattend_tags = [t['tags_id'] for t in suggestion['tags_ids']]

        media_source_to_create = {
            'url': suggestion['url'],
            'name': suggestion['name'],
            'feeds': [suggestion['feed_url']],
            'tags_ids': flattend_tags,
            'editor_notes': 'Suggested approved by {name} on {date} because {reason}. Suggested by {email} on '
                            '{submitted} because {suggestion_reason}'
                            '(id #{suggestion_id}).'.format(name=user_name(),
                                                            date=datetime.now().strftime("%I:%M%p on %B %d, %Y"),
                                                            reason=reason, email=suggestion['email'],
                                                            submitted=suggestion['date_submitted'],
                                                            suggestion_reason=suggestion['reason'],
                                                            suggestion_id=suggestion['media_suggestions_id']
                                                            )
        }
        creation_results = user_mc.mediaCreate([media_source_to_create])[0]
        if creation_results['status'] == 'error':
            status = "pending"  # so the email update looks good.
            email_note = creation_results['error']+".  "
        else:
            email_note = "This source is "+str(creation_results['status'])+". "
            results = user_mc.mediaSuggestionsMark(suggestion_id, status, reason, creation_results['media_id'])
    else:
        # if rejected just mark it as such
        results = user_mc.mediaSuggestionsMark(suggestion_id, status, reason)
    # send an email to the person that suggested it
    url = suggestion['url']
    email_title = "Source Suggestion {}: {}".format(status, url)
    content_title = "We {} {}".format(status, url)
    content_body = "Thanks for the suggestion. {}{}".format(email_note, reason)
    action_text = "Login to Media Cloud"
    action_url = "https://sources.mediacloud.org/#/login"
    # send an email confirmation
    send_html_email(email_title,
                    [user_name(), 'source-suggestion@mediacloud.org'],
                    render_template("emails/generic.txt", content_title=content_title, content_body=content_body,
                                    action_text=action_text, action_url=action_url),
                    render_template("emails/generic.html", email_title=email_title, content_title=content_title,
                                    content_body=content_body, action_text=action_text, action_url=action_url)
                    )
    # and return that it worked or not
    if status == "pending":
        return json_error_response(email_note)
    return jsonify(results)


@app.route('/api/sources/suggestions/submit', methods=['POST'])
@form_fields_required('url')
@flask_login.login_required
@api_error_handler
def source_suggest():
    user_mc = user_admin_mediacloud_client()
    url = request.form['url']
    feed_url = request.form['feedurl'] if 'feedurl' in request.form else None
    name = request.form['name'] if 'name' in request.form else None
    reason = request.form['reason'] if 'reason' in request.form else None
    tag_ids_to_add = tag_ids_from_collections_param()
    new_suggestion = user_mc.mediaSuggest(url=url, name=name, feed_url=feed_url, reason=reason,
                                          tags_ids=tag_ids_to_add)
    # send an email confirmation
    email_title = "Thanks for Suggesting " + url
    send_html_email(email_title,
                    [user_name(), 'source-suggestion@mediacloud.org'],
                    render_template("emails/source_suggestion_ack.txt", username=user_name(), name=name, url=url,
                                    feed_url=feed_url, reason=reason),
                    render_template("emails/source_suggestion_ack.html", username=user_name(), name=name, url=url,
                                    feed_url=feed_url, reason=reason)
                    )
    # and return that it worked
    return jsonify(new_suggestion)
