import PropTypes from 'prop-types';
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import MenuItem from '@material-ui/core/MenuItem';
import withIntlForm from '../../../../common/hocs/IntlForm';
import FocalSetForm from './FocalSetForm';
import { emptyString, nullOrUndefined } from '../../../../../lib/formValidators';
import { FOCAL_TECHNIQUE_BOOLEAN_QUERY } from '../../../../../lib/focalTechniques';
import { trimToMaxLength } from '../../../../../lib/stringUtil';

export const NEW_FOCAL_SET_PLACEHOLDER_ID = -1;

const localMessages = {
  describeFocusAbout: { id: 'focus.create.describe.about', defaultMessage: 'Give your Subtopic a useful name and description so other people understand what it is for. You can change these later.' },
  describeFocalSet: { id: 'focus.create.describeSet.about', defaultMessage: 'Your Subtopic has to be part of a Set, which lets you compare it to other Subtopics in the same Set.' },
  focusName: { id: 'focus.name', defaultMessage: 'Subtopic Name' },
  focusDescription: { id: 'focus.description', defaultMessage: 'Subtopic Description' },
  pickFocalSet: { id: 'focus.pickFocalSet', defaultMessage: 'Pick a Set' },
  newFocalSetName: { id: 'focus.techniquePicker.new.name', defaultMessage: 'Create a New Set' },
  newFocalSetDescription: { id: 'focus.techniquePicker.new.description', defaultMessage: 'Pick this if you want to make a new Set for this Subtopic.  Any Subtopics you add to it will be based on keyword searches.' },
  errorNameYourFocus: { id: 'focus.error.noName', defaultMessage: 'You need to name your Subtopic.' },
  errorPickASet: { id: 'focus.error.noSet', defaultMessage: 'You need to pick or create a Set.' },
  cannotChangeFocalSet: { id: 'focus.cannotChangeSet', defaultMessage: 'You can\'t change which set an existing Subtopic is in.' },
  defaultDescriptionKeywords: { id: 'focus.create.setup3.defualtNameKeywords', defaultMessage: 'Stories containing "{keywords}"' },
};

class FocusDescriptionForm extends React.Component {

  componentWillMount() {
    const { change, focalTechnique, keywords } = this.props;
    const { formatMessage } = this.props.intl;
    // set smart-looking default focus name/description based on the focal technique currently selected
    if (focalTechnique === FOCAL_TECHNIQUE_BOOLEAN_QUERY) {
      const trimmedKeywordsForTitles = trimToMaxLength(keywords, 25);
      const focusName = trimmedKeywordsForTitles;
      const focusDescription = formatMessage(localMessages.defaultDescriptionKeywords, { keywords: trimmedKeywordsForTitles });
      change('focusName', focusName);
      change('focusDescription', focusDescription);
    }
  }

  render() {
    const { renderTextField, renderSelect, focalSetDefinitions, initialValues, currentFocalSetDefinitionId, focalTechnique } = this.props;
    // only show focal set selection for editing mode
    let focalSetContent;
    if (initialValues.focusDefinitionId === undefined) {
      // if they pick "make a new focal set" then let them enter name and description
      let focalSetDetailedContent = null;
      if (currentFocalSetDefinitionId === NEW_FOCAL_SET_PLACEHOLDER_ID) {
        focalSetDetailedContent = <FocalSetForm initialValues={initialValues} focalTechnique={focalTechnique} />;
      }
      focalSetContent = (
        <div className="focal-set-details">
          <Field
            name="focalSetDefinitionId"
            component={renderSelect}
            helpertext={localMessages.pickFocalSet}
          >
            {focalSetDefinitions.map(focalSetDef =>
              <MenuItem
                key={focalSetDef.focal_set_definitions_id}
                value={focalSetDef.focal_set_definitions_id}
              >
                {focalSetDef.name}
              </MenuItem>
            )}
            <MenuItem
              key={NEW_FOCAL_SET_PLACEHOLDER_ID}
              value={NEW_FOCAL_SET_PLACEHOLDER_ID}
            >
              <FormattedMessage {...localMessages.newFocalSetName} />
            </MenuItem>
          </Field>
          {focalSetDetailedContent}
        </div>
      );
    } else {
      focalSetContent = (
        <p>
          <i><FormattedMessage {...localMessages.cannotChangeFocalSet} /></i>
        </p>
      );
    }
    return (
      <div className="focus-create-details-form">
        <Row>
          <Col lg={3} xs={12}>
            <Field
              name="focusName"
              component={renderTextField}
              helpertext={localMessages.focusName}
            />
          </Col>
          <Col lg={3} xs={12}>
            <Field
              name="focusDescription"
              component={renderTextField}
              multiline
              helpertext={localMessages.focusDescription}
            />
          </Col>
          <Col lg={3} xs={12}>
            {focalSetContent}
          </Col>
          <Col lg={1} sm={0} />
          <Col lg={2} sm={12}>
            <p className="light"><i><FormattedMessage {...localMessages.describeFocusAbout} /></i></p>
            <p className="light"><i><FormattedMessage {...localMessages.describeFocalSet} /></i></p>
          </Col>
        </Row>
      </div>
    );
  }

}

FocusDescriptionForm.propTypes = {
  // from parent
  topicId: PropTypes.number.isRequired,
  initialValues: PropTypes.object.isRequired,
  focalSetDefinitions: PropTypes.array.isRequired,
  focalTechnique: PropTypes.string.isRequired,
  currentFocalSetDefinitionId: PropTypes.number,
  keywords: PropTypes.string,
  // form composition
  intl: PropTypes.object.isRequired,
  renderTextField: PropTypes.func.isRequired,
  renderSelect: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  // from state
};

function validate(values) {
  const errors = {};
  if (emptyString(values.focusName)) {
    errors.focusName = localMessages.errorNameYourFocus;
  }
  if (nullOrUndefined(values.focalSetId)) {
    errors.focalSetId = localMessages.errorPickASet;
  }
  return errors;
}

const reduxFormConfig = {
  form: 'snapshotFocus', // make sure this matches the sub-components and other wizard steps
  destroyOnUnmount: false,  // so the wizard works
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  validate,
};

export default
  injectIntl(
    withIntlForm(
      reduxForm(reduxFormConfig)(
        FocusDescriptionForm
      )
    )
  );
