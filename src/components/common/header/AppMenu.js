import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import Menu from '@material-ui/core/Menu';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import AppButton from '../AppButton';

class AppMenu extends React.Component {

  constructor(props) {
    super(props);
    this.state = { open: false, iconDown: true };
  }

  toggleMenu = (event) => {
    this.setState({
      open: !this.state.open,
      anchorEl: event.currentTarget,
      iconDown: !this.state.iconDown,
    });
  };

  close = () => this.setState({ open: false, iconDown: true });

  // ES6
  flatten = list => list.reduce(
    (a, b) => a.concat(Array.isArray(b) ? this.flatten(b) : b), []
  );
  render() {
    const { titleMsg, showMenu, onTitleClick, menuComponent } = this.props;
    const { formatMessage } = this.props.intl;
    // const closeFxn = this.close;
    let newItems;
    if (menuComponent && menuComponent.props) {
      const flattenedMenu = this.flatten(menuComponent.props.children);
      newItems = flattenedMenu.map((m) => {
        const info = { // for each MenuItem, update the onClick event
          ...m,
          props: {
            ...m.props,
            onClick: () => {
              this.setState({ open: false, iconDown: true });
              m.props.onClick();
            },
          },
        };
        delete info.props.icon;
        return info;
      });
    }
    let menuHeader;
    if (showMenu) {
      const whichIcon = (this.state.iconDown) ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />;
      menuHeader = (
        <div>
          <AppButton
            variant="text"
            onClick={this.toggleMenu}
            label={formatMessage(titleMsg)}
            icon={whichIcon}
          />
        </div>
      );
    } else {
      menuHeader = (
        <AppButton
          variant="text"
          onClick={event => onTitleClick(event)}
          label={formatMessage(titleMsg)}
        />
      );
    }
    return (
      <div className="app-menu">
        {menuHeader}
        <Menu
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          onClose={this.close}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          getContentAnchorEl={null}
        >
          {newItems}
        </Menu>
      </div>
    );
  }
}

AppMenu.propTypes = {
  // parent
  titleMsg: PropTypes.object.isRequired,
  showMenu: PropTypes.bool,
  onTitleClick: PropTypes.func.isRequired,
  menuComponent: PropTypes.object,
  // from dispatch
  children: PropTypes.node,
  // from context
  intl: PropTypes.object.isRequired,
};

export default
  injectIntl(
    AppMenu
  );
