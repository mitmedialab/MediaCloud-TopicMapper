import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import React from 'react';
import Button from '@material-ui/core/Button';

/**
 * Simple wrapper so we can style all the button the same.  Use this instead of
 * material-ui's RaisedButton.
 * @see http://stackoverflow.com/questions/39458150/is-it-possible-to-add-a-custom-hover-color-to-raised-buttons
 */
class AppButton extends React.Component {

  state = {
    hoverClass: '',
  };

  handleMouseEnter = () => {
    const { disabled } = this.props;
    if ((disabled === false) || (disabled === undefined)) {
      this.setState({ hoverClass: 'hovering' });
    }
  }

  handleMouseLeave = () => {
    this.setState({ hoverClass: '' });
  }

  render() {
    const { variant, className, children, icon } = this.props;
    const { formatMessage } = this.props.intl;
    const customClassName = className || '';
    const buttonProps = {
      onMouseEnter: this.handleMouseEnter,
      onMouseLeave: this.handleMouseLeave,
      ...this.props,
      className: `app-button ${this.state.hoverClass} ${customClassName}`,
    };
    delete buttonProps.intl;
    // automatically localize the label if it is a message object
    if ((buttonProps.label) && (typeof buttonProps.label === 'object')) {
      buttonProps.label = formatMessage(buttonProps.label);
    }
    let textLabel = children;
    if (children === undefined) {
      textLabel = buttonProps.label;
    }
    // material-ui shim
    if (buttonProps.primary) {
      buttonProps.color = 'primary';
      buttonProps.variant = 'contained';
      delete buttonProps.primary;
    } else if (buttonProps.secondary) {
      buttonProps.color = 'secondary';
      buttonProps.variant = 'outlined';
      delete buttonProps.secondary;
    }
    let content = null;

    content = (
      <Button variant={variant || 'outlined'} {...buttonProps}>
        {textLabel}
        {icon}
      </Button>
    );

    return content;
  }

}

AppButton.propTypes = {
  // from parent
  disabled: PropTypes.bool,
  variant: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
  icon: PropTypes.node,
  // from composition chain
  intl: PropTypes.object.isRequired,
};

export default
  injectIntl(
    AppButton
  );
