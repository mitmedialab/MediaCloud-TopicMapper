import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';

const localMessages = {
  intro: { id: 'focus.create.confirm.retweet.intro', defaultMessage: 'We will create 5 subtopics:' },
  left: { id: 'focus.create.confirm.retweet.center', defaultMessage: 'Left' },
  centerLeft: { id: 'focus.create.confirm.retweet.centerLeft', defaultMessage: 'Center Left' },
  center: { id: 'focus.create.confirm.retweet.center', defaultMessage: 'Center' },
  centerRight: { id: 'focus.create.confirm.retweet.centerRight', defaultMessage: 'Center Right' },
  right: { id: 'focus.create.confirm.retweet.right', defaultMessage: 'Right' },
};

const RetweetPartisanshipSummary = (props) => {
  const { formValues } = props;
  return (
    <div className="focus-create-cofirm-retweet-partisanship">
      <p><FormattedMessage {...localMessages.intro} /></p>
      <ul>
        <li>{formValues.focalSetName}: <FormattedMessage {...localMessages.left} /></li>
        <li>{formValues.focalSetName}: <FormattedMessage {...localMessages.centerLeft} /></li>
        <li>{formValues.focalSetName}: <FormattedMessage {...localMessages.center} /></li>
        <li>{formValues.focalSetName}: <FormattedMessage {...localMessages.centerRight} /></li>
        <li>{formValues.focalSetName}: <FormattedMessage {...localMessages.right} /></li>
      </ul>
    </div>
  );
};

RetweetPartisanshipSummary.propTypes = {
  // from parent
  topicId: PropTypes.number.isRequired,
  year: PropTypes.number.isRequired,
  formValues: PropTypes.object.isRequired,
  // form context
  intl: PropTypes.object.isRequired,
};

export default
injectIntl(
  RetweetPartisanshipSummary
);
