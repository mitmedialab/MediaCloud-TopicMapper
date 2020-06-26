# pylint: disable=import-outside-toplevel

import click
from flask.cli import with_appcontext


def _fetch_backend_emails():
    from server import mc
    first = True
    link_id = None
    backend_emails = []
    while first or link_id:
        first = False
        page = mc.userList(link_id=link_id)
        link_id = page["link_ids"].get("next")
        backend_emails = backend_emails + [user["email"] for user in page["users"]]
    return backend_emails


@click.command("sync-frontend-db")
@click.option('--test', required=False, type=bool, default=False,
              help="Fetches and display number of users to delete only. Doesn't perform delete.")
@with_appcontext
def sync_frontend_db(test):
    """
    Synchronize the frontend user database with the backend. Users in the frontend database not found in the backend
    will be deleted.
    """
    from server import user_db
    backend_emails = _fetch_backend_emails()
    print("'{}' backend users".format(len(backend_emails)))

    users_to_remove = user_db.get_users({
        "$and":
            [{"username": {"$ne": email}} for email in backend_emails]
    })
    print("'{}' users to remove".format(users_to_remove.count()))

    if test:
        print("Testing only! No users deleted.")
    elif users_to_remove.count() > 0:
        user_db.delete_users({
            "$or":
                [{"username": {"$eq": user["username"]}} for user in users_to_remove]
        })
        print("Successfully deleted users")
    else:
        print("No users to delete")
