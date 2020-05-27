import PropTypes from 'prop-types';
import React from 'react';
import Icon from '@material-ui/core/Icon';
import { FormattedMessage, injectIntl } from 'react-intl';
import { intlIfObject } from '../../lib/stringUtil';

export const LEVEL_INFO = 'info';
export const LEVEL_WARNING = 'warning';
export const LEVEL_ERROR = 'error';
export const LEVEL_DETAIL = 'info_outline';

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
          smallContent = <div><small>{intlIfObject(formatMessage, details)}</small></div>;
        }
        detailsContent = (
          <span>
            &nbsp;
            <a
              href={`#${formatMessage(localMessages.details)}`}
              onClick={(evt) => {
                evt.preventDefault();
                this.setState(prevState => ({ showDetails: !prevState.showDetails }));
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
          <Icon className="material-icons">{fontIconName}</Icon>
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

export const DetailNotice = composeNotice(LEVEL_DETAIL);

export const WarningNotice = composeNotice(LEVEL_WARNING);

export const ErrorNotice = composeNotice(LEVEL_ERROR);
