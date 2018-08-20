import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import Menu from '@material-ui/core/Menu';
import AppButton from './AppButton';
import { MoreOptionsButton, CloseButton } from './IconButton';
import { getBrandDarkColor, getBrandDarkerColor } from '../../styles/colors';
import { defaultMenuOriginProps } from '../util/uiUtil';

class ActionMenu extends React.Component {
  state = {
    backgroundColor: getBrandDarkColor(),
    anchorEl: null,
  };

  handlePopupOpenClick = (event) => {
    if (event) {
      this.handlePopupOpen(event);
    } else {
      this.handlePopupClose(event);
    }
  }
  handlePopupOpen = (event) => {
    event.preventDefault(); // don't go anywhere on anchor click
    this.setState({ anchorEl: event.currentTarget.parentElement.parentElement });
  }
  handlePopupClose = () => {
    this.setState({ anchorEl: null });
  }
  handleMouseEnter = () => {
    this.setState({ backgroundColor: getBrandDarkerColor() });
  }
  handleMouseLeave = () => {
    this.setState({ backgroundColor: getBrandDarkColor() });
  }

  render() {
    const { color, openButton, closeButton, children, actionTextMsg } = this.props;
    const { formatMessage } = this.props.intl;
    const otherProps = {};
    const { anchorEl } = this.state;
    otherProps.backgroundColor = this.state.backgroundColor;
    let closeIconButton = (
      <CloseButton onClick={this.handlePopupClose} color={color} {...otherProps} aria-controls="action-menu" />
    );
    let openIconButton = (
      <MoreOptionsButton
        className="action-menu-icon"
        onClick={this.handlePopupOpenClick}
        aria-haspopup="true"
        aria-owns="action-menu"
        aria-controls="action-menu"
      />
    );

    if (openButton) {
      openIconButton = open;
    }
    if (closeButton) {
      closeIconButton = close;
    }

    const icon = (this.state.anchorEl) ? closeIconButton : openIconButton;

    // support text or icon-driven menus
    let buttonContent;
    if (actionTextMsg) {
      buttonContent = (
        <AppButton
          variant="text"
          className="action-menu-text"
          onClick={this.handlePopupOpenClick}
          aria-controls="action-menu"
          aria-haspopup="true"
          aria-owns="action-menu"
          label={formatMessage(actionTextMsg)}
          size="small"
        />
      );
    } else {
      buttonContent = icon;
    }

    return (
      <div className="action-icon-menu">
        {buttonContent}
        <Menu
          id="action-menu"
          anchorEl={anchorEl}
          onClose={this.handlePopupClose}
          {...defaultMenuOriginProps}
          open={Boolean(this.state.anchorEl)}
        >
          {children}
        </Menu>
      </div>
    );
  }
}
ActionMenu.propTypes = {
  onClick: PropTypes.func,
  topLevelButton: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.node,
  ]).isRequired,
  openButton: PropTypes.object,
  closeButton: PropTypes.object,
  tooltip: PropTypes.string,
  intl: PropTypes.object.isRequired,
  color: PropTypes.string,
  iconStyle: PropTypes.object,
  actionTextMsg: PropTypes.object,
};

export default injectIntl(ActionMenu);
