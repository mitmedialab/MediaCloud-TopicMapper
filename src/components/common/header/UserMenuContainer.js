import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import Menu from '@material-ui/core/Menu';
import Divider from '@material-ui/core/Divider';
// import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import { PERMISSION_LOGGED_IN, logout } from '../../../lib/auth';
import Permissioned from '../Permissioned';
import messages from '../../../resources/messages';
import { PersonButton } from '../IconButton';
import { defaultMenuOriginProps } from '../../util/uiUtil';

/*
const styles = {
  root: {
    borderColor: 'white',
  },
  label: {
    color: 'white',
  },
};
*/

const localMessages = {
  apiConsole: { id: 'userMenu.apiConsole', defaultMessage: 'Api Console' },
};

// A permissioned menu of user-related activities, for display on a nav bar or something.
class UserMenuContainer extends React.Component {
  state = {
    anchorEl: null,
  };

  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const { user, routeToUrl } = this.props;
    // gotta show login or logout correctly based on the user state
    let content;
    if (user.isLoggedIn) {
      content = (
        <Permissioned onlyRole={PERMISSION_LOGGED_IN}>
          <PersonButton color="#FFFFFF" onClick={this.handleClick} />
          <Menu
            id="user-menu"
            open={Boolean(this.state.anchorEl)}
            anchorEl={this.state.anchorEl}
            onClose={this.handleClose}
            {...defaultMenuOriginProps}
          >
            <MenuItem onClick={() => { this.handleClose(); routeToUrl('/user/profile'); }}>
              <FormattedMessage {...messages.userProfile} />
            </MenuItem>
            <MenuItem onClick={() => { this.handleClose(); routeToUrl('/user/change-password'); }}>
              <FormattedMessage {...messages.userChangePassword} />
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { this.handleClose(); routeToUrl('/api-console'); }}>
              <FormattedMessage {...localMessages.apiConsole} />
            </MenuItem>
            <Divider />
            <MenuItem id="user-logout" onClick={logout}>
              <FormattedMessage {...messages.userLogout} />
            </MenuItem>
          </Menu>
        </Permissioned>
      );
    } else {
      content = (
        <Button
          variant="outlined"
          className="user-login"
          onClick={() => routeToUrl('/login')}
        >
          <FormattedMessage {...messages.userLogin} />
        </Button>
      );
    }
    return (
      <div className="user-menu">
        {content}
      </div>
    );
  }
}

UserMenuContainer.propTypes = {
  // from state
  user: PropTypes.object.isRequired,
  // from HOC chain
  intl: PropTypes.object.isRequired,
  // from dispatch
  routeToUrl: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  user: state.user,
});

const mapDispatchToProps = dispatch => ({
  routeToUrl: (url) => {
    dispatch(push(url));
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    UserMenuContainer
  )
);
