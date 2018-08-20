import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import messages from '../../../resources/messages';
import AppMenu from '../../common/header/AppMenu';
import { urlToTopicMapper } from '../../../lib/urlUtil';
import { getAppName } from '../../../config';
import { getUserRoles, hasPermissions, PERMISSION_MEDIA_EDIT } from '../../../lib/auth';


const localMessages = {
  menuTitle: { id: 'topics.menu.title', defaultMessage: 'Topic Mapper' },
  home: { id: 'topics.menu.items.home', defaultMessage: 'Home' },
  listTopics: { id: 'topics.menu.items.listTopics', defaultMessage: 'Admin: Topic Status Dashboard' },
};


const TopicsAppMenu = (props) => {
  let menu;
  if (props.isLoggedIn && hasPermissions(getUserRoles(props.user), PERMISSION_MEDIA_EDIT)) {
    menu = (
      <Menu>
        <MenuItem onClick={() => { props.handleItemClick('home', true); }}>
          <FormattedMessage {...localMessages.home} />
        </MenuItem>
        <MenuItem onClick={() => { props.handleItemClick('topics/create', true); }}>
          <FormattedMessage {...messages.createNewTopic} />
        </MenuItem>
        <MenuItem onClick={() => { props.handleItemClick('topics/status', true); }}>
          <FormattedMessage {...localMessages.listTopics} />
        </MenuItem>
      </Menu>
    );
  } else {
    menu = (
      <Menu>
        <MenuItem onClick={() => { props.handleItemClick('home', true); }}>
          <FormattedMessage {...localMessages.home} />
        </MenuItem>
        <MenuItem onClick={() => { props.handleItemClick('topics/create', true); }}>
          <FormattedMessage {...messages.createNewTopic} />
        </MenuItem>
      </Menu>
    );
  }
  return (
    <AppMenu
      color="primary"
      titleMsg={localMessages.menuTitle}
      showMenu={getAppName() === 'topics' && props.isLoggedIn}
      onTitleClick={() => { props.handleItemClick('', getAppName() === 'topics'); }}
      menuComponent={menu}
    />
  );
};

TopicsAppMenu.propTypes = {
  // state
  isLoggedIn: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
  // from dispatch
  handleItemClick: PropTypes.func.isRequired,
  // from context
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  isLoggedIn: state.user.isLoggedIn,
  user: state.user,
});

const mapDispatchToProps = dispatch => ({
  handleItemClick: (path, isLocal) => {
    if (isLocal) {
      dispatch(push(path));
    } else {
      window.location.href = urlToTopicMapper(path);
    }
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      TopicsAppMenu
    )
  );
