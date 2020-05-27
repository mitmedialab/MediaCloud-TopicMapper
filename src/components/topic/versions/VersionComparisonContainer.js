import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { push } from 'react-router-redux';
import AppButton from '../../common/AppButton';
import { topicSnapshotGenerate } from '../../../actions/topicActions';
import { updateFeedback } from '../../../actions/appActions';
import TopicVersionReadySummary from './TopicVersionReadySummary';
import GenerateVersionAdminDialog, { FIELD_NEW_VERSION, FIELD_SPIDER } from './GenerateVersionAdminDialog';
import Permissioned from '../../common/Permissioned';
import { PERMISSION_ADMIN } from '../../../lib/auth';

const localMessages = {
  title: { id: 'versions.comparison.title', defaultMessage: 'Version {versionNumber}: Summary' },
  createVersionAndStartSpider: { id: 'versions.comparison.generate', defaultMessage: 'Generate New Version' },
  versionDiffTitle: { id: 'versions.comparison.versionDiffTitle', defaultMessage: 'You\'ve Made Changes' },
  applyChanges: { id: 'versions.comparison.applyChanges', defaultMessage: 'apply your changes' },
  failed: { id: 'versions.comparison.failed', defaultMessage: 'Sorry, something went wrong!' },
  worked: { id: 'versions.comparison.worked', defaultMessage: 'We started generating the version' },
  currentVersionComparisonTitle: { id: 'versions.comparison.currentTitle', defaultMessage: 'Version {versionNumber}: Platform Summary' },
  nextVersionComparisonTitle: { id: 'versions.comparison.nextTitle', defaultMessage: 'Next Version: Platform Summary' },
  noPrevious: { id: 'versions.comparison.noneYet', defaultMessage: '(No current version to compare to, because you are setting up your first version)' },
};

/**
 * This wrapper shows the difference between the current topic version and the settings queued up for
 * the next one. This rolls up all the changes into one list so it is easier to think about.
 * Notes:
 * - `current` should be null if this is the first version
 * - Admins get some extra options for how to generate the version.
 */
class VersionComparisonContainer extends React.Component {
  state = {
    submittingVersion: false, // this isn't technically a form so we manually control the button disabled with this
  };

  render() {
    const { topic, topicId, current, next, focalSetDefinitions, handleGenerateVersion } = this.props;
    const submitting = this.state.submittingVersion;
    const currentSnapshotsId = current ? current.snapshots_id : null;
    return (
      <div className="version-comparison">
        <Grid>
          <Row>
            <Col lg={12}>
              <h2><FormattedMessage {...localMessages.versionDiffTitle} /></h2>
            </Col>
          </Row>
          <Row>
            <Col lg={5}>
              <div className="topic-info-sidebar faded">
                {current && (
                  <>
                    <h2><FormattedMessage {...localMessages.title} values={{ versionNumber: current ? current.note : 1 }} /></h2>
                    <TopicVersionReadySummary topic={topic} snapshot={current} startWithDetailsShowing />
                  </>
                )}
                {(current === null) && (
                  <h2><FormattedMessage {...localMessages.noPrevious} /></h2>
                )}
              </div>
            </Col>
            <Col lg={2}>
              <span style={{ display: 'block', fontSize: '56px', marginTop: '120px', textAlign: 'center' }}>➡</span>
            </Col>
            <Col lg={5}>
              <div className="topic-info-sidebar">
                <h2><FormattedMessage {...localMessages.title} values={{ versionNumber: current ? current.note + 1 : 1 }} /></h2>
                <TopicVersionReadySummary
                  snapshot={next}
                  topic={topic}
                  focalSets={focalSetDefinitions}
                  startWithDetailsShowing
                />
              </div>
              <AppButton
                label={localMessages.createVersionAndStartSpider}
                onClick={() => {
                  this.setState({ submittingVersion: true });
                  handleGenerateVersion(topicId, true, true, currentSnapshotsId);
                }}
                primary
                disabled={submitting}
              />
              <Permissioned onlyRole={PERMISSION_ADMIN}>
                <GenerateVersionAdminDialog
                  onGenerate={(values) => {
                    this.setState({ submittingVersion: true });
                    handleGenerateVersion(topicId, values[FIELD_NEW_VERSION] === 1, values[FIELD_SPIDER] === 1, currentSnapshotsId);
                  }}
                  initialValues={{
                    [FIELD_NEW_VERSION]: 1,
                    [FIELD_SPIDER]: 1,
                  }}
                />
              </Permissioned>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

VersionComparisonContainer.propTypes = {
  // from composition
  intl: PropTypes.object.isRequired,
  // from parent
  // from state
  current: PropTypes.object,
  next: PropTypes.object,
  topicId: PropTypes.number.isRequired,
  topic: PropTypes.object.isRequired,
  focalSetDefinitions: PropTypes.array,
  // from dispatch
  handleGenerateVersion: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  topicId: state.topics.selected.id,
  topic: state.topics.selected,
  focalSetDefinitions: state.topics.selected.focalSets.definitions.list,
  current: state.topics.selected.snapshots.selected,
  next: state.topics.selected.info,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleGenerateVersion: (topicId, newVersion, alsoSpider, currentSnapshotsId) => {
    const params = {
      snapshotId: newVersion ? null : currentSnapshotsId,
      spider: alsoSpider ? 1 : 0,
    };
    dispatch(topicSnapshotGenerate(topicId, params))
      .then((results) => {
        if (results && results.topics_id) {
          // let them know it worked
          dispatch(updateFeedback({ classes: 'info-notice', open: true, message: ownProps.intl.formatMessage(localMessages.worked) }));
          return dispatch(push(`/topics/${topicId}/versions`));
        }
        return dispatch(updateFeedback({ open: true, message: ownProps.intl.formatMessage(localMessages.failed) }));
      });
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    VersionComparisonContainer
  )
);
