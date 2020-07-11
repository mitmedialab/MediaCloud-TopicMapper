import PropTypes from 'prop-types';
import React from 'react';
import SanitizedHTML from 'react-sanitized-html';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';
import { LEVEL_INFO, LEVEL_WARNING, LEVEL_ERROR, ErrorNotice, InfoNotice, WarningNotice } from '../Notice';

const localMessages = {
  internalError: { id: 'errors.internal', defaultMessage: 'Internal Error' },
  notLoggedIn: { id: 'errors.notLoggedIn', defaultMessage: 'You need to login' },
  badLoginAttempt: { id: 'errors.badLoginAttempt', defaultMessage: 'Your email or password was wrong' },
  details: { id: 'errors.internal.details', defaultMessage: 'details' },
  quotaExceeded: { id: 'errors.quotaExceeded', defaultMessage: 'You have exceeded your weekly search or story quota. This means you won\'t be able to use any Media Cloud tools until next week. Please email us at support@mediacloud.org if you want a higher quota.' },
  querySyntaxError: { id: 'errors.internal.syntax', defaultMessage: 'Your boolean query has a problem - <a target=_new href="https://mediacloud.org/support/query-guide">see our query guide</a> for tips.' },
  solrDownError: { id: 'errors.internal.solr', defaultMessage: 'Can\'t connect to our database; it is probably being updated.  Please wait a few minutes and try again.' },
};

const AppNotice = (props) => {
  const { message, htmlMessage, level, details } = props.info;
  const { formatMessage } = props.intl;
  let messageContent;
  let detailsContent = details;
  // handle normal string messages, or intl objects
  if (message) {
    // set a string, or parse an intl message object
    let stringMessage;
    if (typeof message === 'object') {
      stringMessage = formatMessage(message);
    } else {
      stringMessage = message;
    }
    messageContent = stringMessage;
    // set the stack trace as the expandable details if it is a low-level message
    const isLowLevelError = (stringMessage.includes('.pm')) || (stringMessage.includes('.py')); // ie. does it include a stack trace
    if ((details === undefined) || (details === null)) {
      if (isLowLevelError) {
        detailsContent = stringMessage;
        if (stringMessage.includes('Invalid API key or authentication cookie')) {
          messageContent = <FormattedMessage {...localMessages.notLoggedIn} />;
        } else if (stringMessage.includes('was not found or password is incorrect.')) {
          messageContent = <FormattedMessage {...localMessages.badLoginAttempt} />;
          detailsContent = null; // don't show them the gnarly details if they just got their password wrong
        } else if (stringMessage.includes('You have exceeded your quota of requests or stories')) {
          messageContent = <FormattedMessage {...localMessages.quotaExceeded} />;
        } else if (stringMessage.includes('503 Service Unavailable')) {
          messageContent = <FormattedHTMLMessage {...localMessages.solrDownError} />;
        } else if (stringMessage.includes('org.apache.solr.search.SyntaxError')) {
          messageContent = <FormattedHTMLMessage {...localMessages.querySyntaxError} />;
        } else {
          messageContent = <FormattedMessage {...localMessages.internalError} />;
        }
      }
    }
  // handle html messages
  } else if (htmlMessage) {
    messageContent = (<SanitizedHTML html={htmlMessage} />);
  }
  // each level will render differently
  let content = null;
  switch (level) {
    case LEVEL_INFO:
      content = (
        <InfoNotice details={detailsContent}>
          {messageContent}
        </InfoNotice>
      );
      break;
    case LEVEL_WARNING:
      content = (
        <WarningNotice details={detailsContent}>
          {messageContent}
        </WarningNotice>
      );
      break;
    case LEVEL_ERROR:
    default:
      content = (
        <ErrorNotice details={detailsContent}>
          {messageContent}
        </ErrorNotice>
      );
      break;
  }
  return (content);
};

AppNotice.propTypes = {
  intl: PropTypes.object.isRequired,
  info: PropTypes.object.isRequired,
};

export default
injectIntl(
  AppNotice
);
