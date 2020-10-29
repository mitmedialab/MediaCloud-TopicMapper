import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import AppButton from '../../../common/AppButton';
import withIntlForm from '../../../common/hocs/IntlForm';
import messages from '../../../../resources/messages';
import PlatformPreview from './preview/PlatformPreview';
import { platformChannelDataFormatter } from '../../../util/topicUtil';
import { PLATFORM_OPEN_WEB, PLATFORM_TWITTER, PLATFORM_GENERIC, MEDIA_CLOUD_SOURCE, CSV_SOURCE, CRIMSON_HEXAGON_SOURCE, BRANDWATCH_SOURCE } from '../../../../lib/platformTypes';
import { emptyString } from '../../../../lib/formValidators';
import { queryAsString } from '../../../../lib/stringUtil';
import EditOpenWebForm from './forms/EditOpenWebForm';
import EditQueryForm from './forms/EditQueryForm';
import EditGenericCsvForm from './forms/EditGenericCsvForm';
import EditProjectQueryForm from './forms/EditProjectQueryForm';
import { platformNameMessage, sourceNameMessage, platformDescriptionMessage } from '../AvailablePlatform';

const formSelector = formValueSelector('platform');

const localMessages = {
  title: { id: 'platform.create.edit.title', defaultMessage: 'Step 1: Configure Your Platform: ' },
  noMediaSpecified: { id: 'platform.web.media', defaultMessage: 'You must select a media source.' },
  noMonitorSpecified: { id: 'platform.twitter.monitor', defaultMessage: 'You must specify a monitor.' },
  noQueryIdSpecified: { id: 'platform.twitter.queryId', defaultMessage: 'You must specify a query ID.' },
  noProjectIdSpecified: { id: 'platform.twitter.projectId', defaultMessage: 'You must specify a project ID.' },
  noChannelSpecified: { id: 'platform.reddit.channel', defaultMessage: 'You must specify a channel.' },
  noQuerySpecified: { id: 'platform.query', defaultMessage: 'You must specify a query.' },
};

const formForPlatformSource = (platform, source) => {
  if ((platform === PLATFORM_OPEN_WEB) && (source === MEDIA_CLOUD_SOURCE)) {
    return EditOpenWebForm;
  }
  if ((platform === PLATFORM_GENERIC) && (source === CSV_SOURCE)) {
    return EditGenericCsvForm;
  }
  if (platform === PLATFORM_TWITTER && source === BRANDWATCH_SOURCE) {
    return EditProjectQueryForm;
  }
  // anything without special seetings gets a generic query text box
  return EditQueryForm;
};

const validationForPlatformSource = (platform, source, formInfo) => {
  if ((platform === PLATFORM_OPEN_WEB) && (source === MEDIA_CLOUD_SOURCE) && ((formInfo.media && formInfo.media.length < 1) || formInfo.media === undefined)) {
    return true; // disabled
  }

  if (formInfo.query !== undefined && emptyString(queryAsString(formInfo.query))) {
    if (platform === PLATFORM_TWITTER && source === BRANDWATCH_SOURCE) {
      if (formInfo.project !== undefined && emptyString(queryAsString(formInfo.project))) {
        return true;
      }
    } else {
      return true;
    }
  }
  return false;
};

class PlatformFormContainer extends React.Component {
  constructor(props) {
    // To catch when they click search we track the time of their click onthe button
    // so we know when to refetch all the data
    super(props);
    this.state = { lastUpdated: null };
  }

  handleSearchClick = () => {
    this.setState({ lastUpdated: Date.now() });
  }

  handleEnterKeyDown = (event) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        break;
      default:
        break;
    }
  }

  render() {
    const { hidePreview, initialValues, handleSubmit, finishStep, currentPlatform, change /* redux form helper */, validationValues } = this.props;
    const FormRenderer = formForPlatformSource(currentPlatform.platform, currentPlatform.source);
    return (
      <Grid>
        <form className="platform-edit-form" name="platform-form" onSubmit={handleSubmit(finishStep.bind(this))}>
          <Row>
            <Col lg={10}>
              <h2>
                <FormattedMessage {...localMessages.title} />
                <FormattedHTMLMessage {...platformNameMessage(currentPlatform.platform, currentPlatform.source)} />
                &nbsp;- <FormattedHTMLMessage {...sourceNameMessage(currentPlatform.source)} />
              </h2>
              <p>
                <FormattedHTMLMessage {...platformDescriptionMessage(currentPlatform.platform, currentPlatform.source)} />
              </p>
            </Col>
          </Row>
          <FormRenderer
            initialValues={initialValues}
            onEnterKey={this.handleEnterKeyDown}
            onFormChange={change}
          />
          {!hidePreview && (
            <Row>
              <Col lg={2} xs={12}>
                <AppButton
                  label={messages.preview}
                  style={{ marginTop: 33 }}
                  onClick={this.handleSearchClick}
                  disabled={validationForPlatformSource(currentPlatform.platform, currentPlatform.source, validationValues)}
                />
              </Col>
            </Row>
          )}
          {this.state.lastUpdated && (
            <PlatformPreview
              lastUpdated={this.state.lastUpdated}
              formatPlatformChannelData={platformChannelDataFormatter(currentPlatform.platform)}
            />
          )}
          <Row>
            <Col lg={8} xs={12}>
              <AppButton
                className="platform-builder-next"
                type="submit"
                label={messages.next}
                primary
                disabled={validationForPlatformSource(currentPlatform.platform, currentPlatform.source, validationValues)}
              />
            </Col>
          </Row>
        </form>
      </Grid>
    );
  }
}

PlatformFormContainer.propTypes = {
  // from parent
  topicId: PropTypes.number.isRequired,
  initialValues: PropTypes.object,
  onNextStep: PropTypes.func.isRequired,
  // from state
  currentPlatform: PropTypes.object,
  change: PropTypes.func.isRequired,
  // from dispatch
  finishStep: PropTypes.func.isRequired,
  // from compositional helper
  location: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  renderTextField: PropTypes.func.isRequired,
  validationValues: PropTypes.object.isRequired,
  hidePreview: PropTypes.bool,
};

const mapStateToProps = state => ({
  currentPlatform: state.topics.selected.platforms.selected,
  validationValues: formSelector(state, 'media', 'query'),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  finishStep: (values) => {
    const customProps = {
      query: values.query,
    };
    ownProps.onNextStep(customProps);
  },
});

/**
 * If the string value for a field is not valid, the error is returned.
 */
function validateString(field, values, errorMessage, formatMessage) {
  if (values[field] === undefined || emptyString(queryAsString(values[field]))) {
    return { _error: formatMessage(errorMessage) };
  }
  return undefined;
}

function validate(values, props) {
  const { formatMessage } = props.intl;
  const errors = {};
  if (!values.media || !values.media.length) {
    errors.media = { _error: formatMessage(localMessages.noMediaSpecified) };
  }
  if (values.platform === PLATFORM_TWITTER && values.source === BRANDWATCH_SOURCE) {
    errors.query = validateString('query', values, localMessages.noQueryIdSpecified, formatMessage);
    errors.project = validateString('project', values, localMessages.noProjectIdSpecified, formatMessage);
  }
  if (values.platform === PLATFORM_TWITTER && values.source === CRIMSON_HEXAGON_SOURCE) {
    errors.query = validateString('query', values, localMessages.noMonitorSpecified, formatMessage);
  }
  return errors;
}

const reduxFormConfig = {
  form: 'platform', // make sure this matches the sub-components and other wizard steps
  destroyOnUnmount: false, // <------ preserve form data
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  validate,
};

export default
injectIntl(
  withIntlForm(
    reduxForm(reduxFormConfig)(
      connect(mapStateToProps, mapDispatchToProps)(
        PlatformFormContainer
      )
    )
  )
);
