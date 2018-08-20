import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { Field } from 'redux-form';
import { Row, Col } from 'react-flexbox-grid/lib';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MenuItem from '@material-ui/core/MenuItem';
import withIntlForm from '../../common/hocs/IntlForm';
import { TOPIC_FORM_MODE_EDIT } from './TopicForm';
import { WarningNotice } from '../../common/Notice';
import Permissioned from '../../common/Permissioned';
import { PERMISSION_MEDIA_EDIT, PERMISSION_ADMIN } from '../../../lib/auth';
import QueryHelpDialog from '../../common/help/QueryHelpDialog';

const localMessages = {
  basics: { id: 'topic.form.section.basics', defaultMessage: 'Basics' },
  name: { id: 'topic.form.detail.name', defaultMessage: 'Topic Name (what is this about?)' },
  nameError: { id: 'topic.form.detail.name.error', defaultMessage: 'Your topic needs a short dsecriptive name.' },
  advancedSettings: { id: 'topic.form.detail.advancedSettings', defaultMessage: 'Advanced Settings' },
  description: { id: 'topic.form.detail.description', defaultMessage: 'Description (why are you making this?)' },
  descriptionError: { id: 'topic.form.detail.desciption.error', defaultMessage: 'Your topic need a description.' },
  seedQuery: { id: 'topic.form.detail.seedQuery', defaultMessage: 'Seed Query' },
  seedQueryError: { id: 'topic.form.detail.seedQuery.error', defaultMessage: 'You must give us a seed query to start this topic from.' },
  seedQueryDescription: { id: 'topic.form.detail.seedQuery.about', defaultMessage: 'Enter a boolean query to select stories that will seed the Topic.  Links in stories already in our database that match this query will be followed to find more stories that might not be in our database already.' },
  queryEditWarning: { id: 'topic.form.detal.query.edit.warning', defaultMessage: '<b>Be careful!</b> If you plan to edit the query and make a new snapshot make sure you only increase the scope of the query.  If you reduce the scope there will be stories from previous snapshots included that don\'t match your new reduced query.' },
  startDate: { id: 'topic.form.detail.startDate', defaultMessage: 'Start Date' },
  endDate: { id: 'topic.form.detail.endDate', defaultMessage: 'End Date' },
  maxStories: { id: 'topic.form.detail.maxStories', defaultMessage: 'Maximum # of Stories' },
  maxSeedStoriesHelp: { id: 'topic.form.detail.maxStories', defaultMessage: 'Public users can make topics with up to 100,000 total stories.  Change this if you want to allow a special case exception.' },
  public: { id: 'topic.form.detail.public', defaultMessage: 'Public?' },
  logogram: { id: 'topic.form.detail.logogram', defaultMessage: 'Content in a Logographic Language? (ie. Chinese or Japanese Kanji?)' },
  crimsonHexagon: { id: 'topic.form.detail.crimsonHexagon', defaultMessage: 'Crimson Hexagon Id' },
  crimsonHexagonHelp: { id: 'topic.form.detail.crimsonHexagon.help', defaultMessage: 'If you have set up a Crimson Hexagon monitor on our associated account, enter it\'s numeric ID here and we will automatically pull in all the stories linked to by tweets in your monitor.' },
  maxIterations: { id: 'topic.form.detail.maxIterations', defaultMessage: 'Max Spider Iterations' },
  maxIterationsHelp: { id: 'topic.form.detail.maxIterations.help', defaultMessage: 'You can change how many rounds of spidering you want to do.  If you expect this topic to explode with lots and lots of linked-to stories about the same topic, then keep this small.  Otherwise leave it with the default of 15.' },
  createTopic: { id: 'topic.form.detail.create', defaultMessage: 'Create' },
  dateError: { id: 'topic.form.detail.date.error', defaultMessage: 'Please provide a date in YYYY-MM-DD format.' },
};

const TopicDetailForm = (props) => {
  const { renderTextField, renderCheckbox, renderSelect, mode } = props;
  const { formatMessage } = props.intl;
  const iterations = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  let queryWarning = null;
  if (mode === TOPIC_FORM_MODE_EDIT) {
    queryWarning = (
      <WarningNotice>
        <FormattedHTMLMessage {...localMessages.queryEditWarning} />
      </WarningNotice>
    );
  }
  return (
    <div>
      <Row>
        <Col lg={12}>
          <h2><FormattedMessage {...localMessages.basics} /></h2>
        </Col>
      </Row>
      <Row>
        <Col lg={6}>
          <Field
            name="name"
            component={renderTextField}
            fullWidth
            label={formatMessage(localMessages.name)}
          />
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <Field
            name="description"
            component={renderTextField}
            fullWidth
            label={formatMessage(localMessages.description)}
          />
        </Col>
      </Row>
      <Row>
        <Col lg={6}>
          <Field
            name="start_date"
            component={renderTextField}
            type="inline"
            fullWidth
            label={formatMessage(localMessages.startDate)}
          />
        </Col>
        <Col lg={6}>
          <Field
            name="end_date"
            component={renderTextField}
            type="inline"
            fullWidth
            label={formatMessage(localMessages.endDate)}
            helpertext={formatMessage(localMessages.endDate)}
          />
        </Col>
      </Row>
      <Row>
        <Col lg={8}>
          <Field
            name="is_public"
            component={renderCheckbox}
            fullWidth
            label={formatMessage(localMessages.public)}
          />
        </Col>
      </Row>
      <Row>
        <Col lg={8}>
          <Field
            name="is_logogram"
            component={renderCheckbox}
            fullWidth
            label={formatMessage(localMessages.logogram)}
          />
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <Field
            name="solr_seed_query"
            component={renderTextField}
            multiline
            rows={2}
            rowsMax={4}
            fullWidth
            label={formatMessage(localMessages.seedQuery)}
            helpertext={formatMessage(localMessages.seedQueryError)}
          />
          <small><b><QueryHelpDialog /></b> <FormattedMessage {...localMessages.seedQueryDescription} /></small>
          {queryWarning}
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <br />
          <ExpansionPanel>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{formatMessage(localMessages.advancedSettings)}</Typography>
            </ExpansionPanelSummary>
            <Permissioned onlyRole={PERMISSION_ADMIN}>
              <ExpansionPanelDetails>
                <Field
                  name="max_stories"
                  component={renderTextField}
                  type="inline"
                  fullWidth
                  // defaultValue="100000"
                  label={formatMessage(localMessages.maxStories)}
                  helpertext={100000}
                />
                <Typography><small><FormattedMessage {...localMessages.maxSeedStoriesHelp} /></small></Typography>
              </ExpansionPanelDetails>
            </Permissioned>
            <Permissioned onlyRole={PERMISSION_MEDIA_EDIT}>
              <ExpansionPanelDetails>
                <Field
                  name="ch_monitor_id"
                  component={renderTextField}
                  fullWidth
                />
                <Typography><small><FormattedMessage {...localMessages.crimsonHexagonHelp} /></small></Typography>
              </ExpansionPanelDetails>
            </Permissioned>
            <ExpansionPanelDetails>
              <Field
                name="max_iterations"
                component={renderSelect}
                fullWidth
              >
                {iterations.map(t => <MenuItem key={t} value={t}>{t === 0 ? `${t} - no spidering` : t}</MenuItem>)}
              </Field>
              <Typography><small><FormattedMessage {...localMessages.maxIterationsHelp} /></small></Typography>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </Col>
      </Row>
    </div>
  );
};

TopicDetailForm.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  renderTextField: PropTypes.func.isRequired,
  renderCheckbox: PropTypes.func.isRequired,
  renderSelect: PropTypes.func.isRequired,
  // from parent
  mode: PropTypes.string.isRequired,
  initialValues: PropTypes.object,
};

export default
  withIntlForm(
    TopicDetailForm
  );
