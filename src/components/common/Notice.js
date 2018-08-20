import PropTypes from 'prop-types';
import React from 'react';
import Icon from '@material-ui/core/Icon';
import { FormattedMessage, injectIntl } from 'react-intl';

export const LEVEL_INFO = 'info';
export const LEVEL_WARNING = 'warning';
export const LEVEL_ERROR = 'error';

const localMessages = {
  details: { id: 'errors.internal.details', defaultMessage: 'details' },
};

function composeNotice(level) {
  const fontIconName = level;

  class Notice extends React.Component {
    state = {
      showDetails: false,
    };
    render() {
      const { children, details } = this.props;
      const { formatMessage } = this.props.intl;
      let detailsContent = null;
      if (details) {
        let smallContent = null;
        if (this.state.showDetails) {
          smallContent = <div><small>{details}</small></div>;
        }
        detailsContent = (
          <span>
            &nbsp;
            <a
              href={`#${formatMessage(localMessages.details)}`}
              onClick={(evt) => {
                evt.preventDefault();
                this.setState({ showDetails: !this.state.showDetails });
              }}
            >
              <FormattedMessage {...localMessages.details} />
            </a>
            {smallContent}
          </span>
        );
      }
      return (
        <div className={`notice ${level}-notice`}>
          <Icon className="material-icons" color="disabled">{fontIconName}</Icon>
          {children}
          {detailsContent}
        </div>
      );
    }
  }
  Notice.propTypes = {
    intl: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired,
    details: PropTypes.string,
  };
  return injectIntl(Notice);
}

export const InfoNotice = composeNotice(LEVEL_INFO);

export const WarningNotice = composeNotice(LEVEL_WARNING);

export const ErrorNotice = composeNotice(LEVEL_ERROR);
