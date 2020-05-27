import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { Row, Col } from 'react-flexbox-grid/lib';
import withIntlForm from '../../common/hocs/IntlForm';
import AppButton from '../../common/AppButton';
import messages from '../../../resources/messages';

const localMessages = {
  buttonLabel: { id: 'topic.version.generate.trigger', defaultMessage: 'Advanced Options...' },
  title: { id: 'topic.version.generate.dialog.title', defaultMessage: 'Generate Version: Admin Options' },
  intro: { id: 'topic.version.generate.dialog.intro', defaultMessage: 'As an admin you have a few helpful shortcuts you can use. You can decided to generate a new version (like normal),  or you can regenerate in the current version. This can be helpful if you just want to add a new subtopic or something. In additon, you can decided whether you want to respider or not. Thi can be helpful on big topics that perhaps need new subtopics or settings, but don\'t need to be respidered (because that would take a long time).' },
  newVersion: { id: 'topic.version.generate.newVersion.label', defaultMessage: 'Version:' },
  newVersionYes: { id: 'topic.version.generate.newVersion.yes', defaultMessage: 'Make a new version (like normal)' },
  newVersionNo: { id: 'topic.version.generate.newVersion.no', defaultMessage: 'Use the current (it will go back to queued status)' },
  spider: { id: 'topic.version.generate.respider.label', defaultMessage: 'Spidering' },
  spiderYes: { id: 'topic.version.generate.respider.yes', defaultMessage: 'Spider (like normal)' },
  spiderNo: { id: 'topic.version.generate.respider.no', defaultMessage: 'Don\'t spider (faster, no new stories)' },
};

export const FIELD_NEW_VERSION = 'newVersion';
export const FIELD_SPIDER = 'spider';

class GenerateVersionAdminDialog extends React.Component {
  state = {
    open: false,
  }

  handleGenerateRequest(values) {
    const { onGenerate } = this.props;
    this.setState({ open: false });
    onGenerate(values);
  }

  render() {
    const { intl, handleSubmit, renderSelect } = this.props;
    let content;
    if (!this.state.open) {
      content = <AppButton label={localMessages.buttonLabel} onClick={() => this.setState({ open: true })} />;
    } else {
      content = (
        <form
          className="app-form topic-generate-verison-admin-form"
          id="topicGenerateVersionAdminForm"
          name="topicGenerateVersionAdminForm"
          onSubmit={handleSubmit(this.handleGenerateRequest.bind(this))}
        >
          <Dialog
            className="app-dialog"
            open={this.state.open}
            onClose={() => this.setState({ open: false })}
          >
            <DialogTitle>{intl.formatMessage(localMessages.title)}</DialogTitle>
            <DialogContent>
              <p><FormattedMessage {...localMessages.intro} /></p>
              <Row>
                <Col lg={12}>
                  <h4><FormattedMessage {...localMessages.newVersion} /></h4>
                  <Field name={FIELD_NEW_VERSION} component={renderSelect} type="inline" fullWidth>
                    <MenuItem value={1}><FormattedMessage {...localMessages.newVersionYes} /></MenuItem>
                    <MenuItem value={0}><FormattedMessage {...localMessages.newVersionNo} /></MenuItem>
                  </Field>
                </Col>
              </Row>
              <Row>
                <Col lg={12}>
                  <h4><FormattedMessage {...localMessages.spider} /></h4>
                  <Field name={FIELD_SPIDER} component={renderSelect} type="inline" fullWidth>
                    <MenuItem value={1}><FormattedMessage {...localMessages.spiderYes} /></MenuItem>
                    <MenuItem value={0}><FormattedMessage {...localMessages.spiderNo} /></MenuItem>
                  </Field>
                </Col>
              </Row>
            </DialogContent>
            <DialogActions>
              <AppButton
                label={messages.cancel}
                onClick={() => this.setState({ open: false })}
              />
              <AppButton
                label={messages.runThisVersion}
                primary
                type="submit"
                form="topicGenerateVersionAdminForm"
              />
            </DialogActions>
          </Dialog>
        </form>
      );
    }
    return content;
  }
}

GenerateVersionAdminDialog.propTypes = {
  // from parent
  onGenerate: PropTypes.func.isRequired,
  initialValues: PropTypes.object,
  // from context
  intl: PropTypes.object.isRequired,
  renderSelect: PropTypes.func.isRequired,
  // from form healper
  handleSubmit: PropTypes.func,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
};

const reduxFormConfig = {
  form: 'topicGenerateVersionAdminForm',
};

export default
withIntlForm(
  reduxForm(reduxFormConfig)(
    GenerateVersionAdminDialog
  ),
);
