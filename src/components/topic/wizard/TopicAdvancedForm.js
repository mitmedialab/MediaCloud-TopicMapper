import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, propTypes, formValueSelector } from 'redux-form';
import { FormattedHTMLMessage } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import MenuItem from '@material-ui/core/MenuItem';
import withIntlForm from '../../common/hocs/IntlForm';
import Permissioned from '../../common/Permissioned';
import CollapsingPanel from '../../common/CollapsingPanel';
import { PERMISSION_ADMIN } from '../../../lib/auth';
import { ADMIN_MAX_RECOMMENDED_STORIES } from '../../../lib/formValidators';

const localMessages = {
  advancedSettings: { id: 'topic.form.detail.advancedSettings', defaultMessage: 'Advanced Settings' },
  seedQuery: { id: 'topic.form.detail.seedQuery', defaultMessage: 'Relevance Query' },
  maxStories: { id: 'topic.form.detail.maxStories', defaultMessage: 'Maximum # of Stories' },
  maxSeedStoriesHelp: { id: 'topic.form.detail.maxStories', defaultMessage: '<b>Admin only</b>. Public users can make topics with up to 100,000 total stories by default. Admins can tweak this default for each user. Here admins can change this max if you want to allow a special case exception.<br/>&nbsp;<br/>' },
  maxIterations: { id: 'topic.form.detail.maxIterations', defaultMessage: 'Max Spider Iterations' },
  maxIterationsHelp: { id: 'topic.form.detail.maxIterations.help', defaultMessage: 'Any news stories discovered will be checked for links. Any links found will be followed via a process called "spidering". Media Cloud defaults to 15 rounds of spidering. You can customize this here.<br/>&nbsp;<br/>' },
};

const selector = formValueSelector('topicForm');

const TopicAdvancedForm = (props) => {
  const { renderTextField, renderSelect, topicMode } = props;
  const { formatMessage } = props.intl;
  const iterations = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  return (
    <CollapsingPanel titleMsg={localMessages.advancedSettings}>
      <Permissioned onlyRole={PERMISSION_ADMIN}>
        <Row>
          <Col lg={3}>
            <Field
              name="max_topic_stories"
              component={renderTextField}
              type="inline"
              fullWidth
              // defaultValue="100000"
              label={formatMessage(localMessages.maxStories)}
              helpertext={ADMIN_MAX_RECOMMENDED_STORIES}
            />
          </Col>
        </Row>
        <Row>
          <Col lg={8}>
            <small><FormattedHTMLMessage {...localMessages.maxSeedStoriesHelp} /></small>
          </Col>
        </Row>
      </Permissioned>
      <Row>
        <Col lg={3}>
          <Field
            name="max_iterations"
            disabled={topicMode !== 'web'}
            component={renderSelect}
            fullWidth
            defaultValue={0}
            label={formatMessage(localMessages.maxIterations)}
          >
            {iterations.map(t => <MenuItem key={t} value={t}>{t === 0 ? `${t} - no spidering` : t}</MenuItem>)}
          </Field>
        </Col>
      </Row>
      <Row>
        <Col lg={8}>
          <small><FormattedHTMLMessage {...localMessages.maxIterationsHelp} /></small>
        </Col>
      </Row>
    </CollapsingPanel>
  );
};

TopicAdvancedForm.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  renderTextField: PropTypes.func.isRequired,
  renderCheckbox: PropTypes.func.isRequired,
  renderSelect: PropTypes.func.isRequired,
  // from parent
  initialValues: PropTypes.object,
  pristine: PropTypes.bool.isRequired,
  error: PropTypes.string,
  asyncValidating: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
  ]).isRequired,
  submitting: PropTypes.bool.isRequired,
  // from state
  topicMode: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  topicMode: selector(state, 'mode'),
});

export default
connect(mapStateToProps)(
  withIntlForm(
    reduxForm({ propTypes })(
      TopicAdvancedForm
    )
  )
);
