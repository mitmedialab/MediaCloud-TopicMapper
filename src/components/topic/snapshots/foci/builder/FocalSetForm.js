import PropTypes from 'prop-types';
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import withIntlForm from '../../../../common/hocs/IntlForm';
import { FOCAL_TECHNIQUE_TWEET_PARTISANSHIP_2020, FOCAL_TECHNIQUE_RETWEET_PARTISANSHIP_2016, FOCAL_TECHNIQUE_TOP_COUNTRIES, FOCAL_TECHNIQUE_NYT_THEME, FOCAL_TECHNIQUE_MEDIA_TYPE } from '../../../../../lib/focalTechniques';
import { notEmptyString } from '../../../../../lib/formValidators';

const localMessages = {
  focalSetName: { id: 'focalSet.name', defaultMessage: 'Set Name' },
  focalSetDescription: { id: 'focalSet.description', defaultMessage: 'Set Description' },
  focalSetWhy: { id: 'focalSet.why', defaultMessage: 'Give your new Set a name and description so others can recognize what it is for.' },
  errorNoName: { id: 'focalSet.name.error', defaultMessage: 'You need to name this.' },
  errorNoDescription: { id: 'focalSet.description.error', defaultMessage: 'You need a description.' },
  defaultSetName: { id: 'focalSet.default.setName', defaultMessage: 'Conversations' },
  defaultSetDescription: { id: 'focalSet.default.setDescription', defaultMessage: 'A set of different conversations within this topic.' },
  defaultSetNamePartisanship: { id: 'focalSet.default.setName.partisanship', defaultMessage: '{analysis} Partisanship {year}' },
  defaultSetDescriptionPartisanship2020: { id: 'focalSet.default.setDescription.partisanship2020', defaultMessage: 'TODO: TBD' },
  defaultSetDescriptionPartisanship2016: { id: 'focalSet.default.setDescription.partisanship2016', defaultMessage: 'Subtopics driven by our analysis of Twitter followers of Trump and Clinton during the 2016 election season.  Each media source is scored based on the ratio of retweets of their stories in those two groups.' },
  defaultSetNameTopCountries: { id: 'focalSet.default.setName.retweet', defaultMessage: 'Top Countries' },
  defaultSetDescriptionTopCountries: { id: 'focalSet.default.setDescription.countries', defaultMessage: 'Subtopics for the countries stories are most often about.' },
  defaultSetNameNytTheme: { id: 'focalSet.default.setName.nyt', defaultMessage: 'Nyt Theme' },
  defaultSetDescriptionNytTheme: { id: 'focalSet.default.setDescription.nyt', defaultMessage: 'Subtopics for the themes stories are most often related to.' },
  defaultSetNameMediaType: { id: 'focalSet.default.setName.mediaType', defaultMessage: 'Media Type' },
  defaultSetDescriptionMediaType: { id: 'focalSet.default.setDescription.mediaType', defaultMessage: 'Automatically generated subtopics that group together stories by the type of media source that published them.' },
};

class FocalSetForm extends React.Component {
  UNSAFE_componentWillMount() {
    const { change, focalTechnique } = this.props;
    const { formatMessage } = this.props.intl;
    // set smart-looking default set name/description based on the focal technique currently selected
    let setName;
    let setDescription;
    switch (focalTechnique) {
      case FOCAL_TECHNIQUE_TWEET_PARTISANSHIP_2020:
        setName = formatMessage(localMessages.defaultSetNamePartisanship, { analysis: 'Tweet', year: 2020 });
        setDescription = formatMessage(localMessages.defaultSetDescriptionPartisanship2020);
        break;
      case FOCAL_TECHNIQUE_RETWEET_PARTISANSHIP_2016:
        setName = formatMessage(localMessages.defaultSetNamePartisanship, { analysis: 'Retweet', year: 2016 });
        setDescription = formatMessage(localMessages.defaultSetDescriptionPartisanship2016);
        break;
      case FOCAL_TECHNIQUE_TOP_COUNTRIES:
        setName = formatMessage(localMessages.defaultSetNameTopCountries);
        setDescription = formatMessage(localMessages.defaultSetDescriptionTopCountries);
        break;
      case FOCAL_TECHNIQUE_NYT_THEME:
        setName = formatMessage(localMessages.defaultSetNameNytTheme);
        setDescription = formatMessage(localMessages.defaultSetDescriptionNytTheme);
        break;
      case FOCAL_TECHNIQUE_MEDIA_TYPE:
        setName = formatMessage(localMessages.defaultSetNameMediaType);
        setDescription = formatMessage(localMessages.defaultSetDescriptionMediaType);
        break;
      default:
        setName = formatMessage(localMessages.defaultSetName);
        setDescription = formatMessage(localMessages.defaultSetDescription);
        break;
    }
    change('focalSetName', setName);
    change('focalSetDescription', setDescription);
  }

  render() {
    const { renderTextField, introContent, fullWidth } = this.props;
    const defaultIntroContent = (<p className="light"><i><FormattedMessage {...localMessages.focalSetWhy} /></i></p>);
    const fullWidthFields = fullWidth || false;
    const intro = introContent || defaultIntroContent;
    return (
      <div className="new-focal-set">
        {intro}
        <Field
          name="focalSetName"
          component={renderTextField}
          fullWidth={fullWidthFields}
        />
        <br />
        <Field
          name="focalSetDescription"
          component={renderTextField}
          fullWidth={fullWidthFields}
        />
      </div>
    );
  }
}

FocalSetForm.propTypes = {
  // form compositinal chain
  intl: PropTypes.object.isRequired,
  renderTextField: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  // from parent
  initialValues: PropTypes.object,
  introContent: PropTypes.object,
  fullWidth: PropTypes.bool,
  focalTechnique: PropTypes.string.isRequired,
};

function validate(values) {
  const errors = {};
  if (!notEmptyString(values.focalSetName)) {
    errors.focalSetName = localMessages.errorNoName;
  }
  if (!notEmptyString(values.focalSetDescription)) {
    errors.focalSetDescription = localMessages.errorNoDescription;
  }
  return errors;
}

const reduxFormConfig = {
  form: 'snapshotFocus', // make sure this matches the sub-components and other wizard steps
  destroyOnUnmount: false, // so the wizard works
  validate,
};

export default
withIntlForm(
  reduxForm(reduxFormConfig)(
    injectIntl(
      FocalSetForm
    )
  )
);
