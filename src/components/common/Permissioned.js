import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PERMISSION_TOPIC_READ, PERMISSION_TOPIC_WRITE, PERMISSION_TOPIC_ADMIN, hasPermissions, getUserRoles,
         PERMISSION_ADMIN, PERMISSION_MEDIA_EDIT, PERMISSION_STORY_EDIT, PERMISSION_LOGGED_IN,
         PERMISSION_NOT_LOGGED_IN } from '../../lib/auth';

/**
 * Use this to restrict who is allowed to see what.
 **/
const Permissioned = (props) => {
  const { children, onlyTopic, onlyRole, userTopicPermission, user } = props;
  const userRolePermissions = getUserRoles(user);

  let allowed = false;
  if (onlyTopic) {
    // check topic-level permissions
    if (![PERMISSION_TOPIC_READ, PERMISSION_TOPIC_WRITE, PERMISSION_TOPIC_ADMIN].includes(onlyTopic)) {
      const error = { message: `Invalid topic permission (${onlyTopic})` };
      throw error;
    }
    switch (onlyTopic) {
      case PERMISSION_TOPIC_READ:
        allowed = [PERMISSION_TOPIC_READ, PERMISSION_TOPIC_WRITE, PERMISSION_TOPIC_ADMIN].includes(userTopicPermission);
        break;
      case PERMISSION_TOPIC_WRITE:
        allowed = [PERMISSION_TOPIC_WRITE, PERMISSION_TOPIC_ADMIN].includes(userTopicPermission);
        break;
      case PERMISSION_TOPIC_ADMIN:
        allowed = (PERMISSION_TOPIC_ADMIN === userTopicPermission);
        break;
      default:
        allowed = false;
    }
  } else if (onlyRole) {
    // check role-level permissions
    if (![PERMISSION_ADMIN, PERMISSION_MEDIA_EDIT, PERMISSION_STORY_EDIT,
      PERMISSION_LOGGED_IN, PERMISSION_NOT_LOGGED_IN].includes(onlyRole)) {
      const error = { message: `Invalid permission (${onlyRole})` };
      throw error;
    }
    allowed = hasPermissions(userRolePermissions, onlyRole);
  }
  let content = null;
  if (allowed) {
    content = children;
  }
  /*
  let cssClasses = 'permissioned';
  if (onlyTopic) cssClasses += ` topic-${onlyTopic}`;
  if (onlyRole) cssClasses += ` role-${onlyRole}`;
  return (
    <span className={cssClasses}>
      {content}
    </span>
  );
  */
  return content;
};

Permissioned.propTypes = {
  // from parent
  children: PropTypes.node, // not required, because the content passed in could be null (if some property isn't filled in on an object)
  onlyTopic: PropTypes.string,
  onlyRole: PropTypes.string,
  // from state
  userTopicPermission: PropTypes.string,
  user: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  userTopicPermission: state.topics ? state.topics.selected.info.user_permission : null,  // do this to support other apps (ie. NOT topic mapper)
  user: state.user,
});

export default
  connect(mapStateToProps)(
    Permissioned
  );
