import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import SeedQuerySummary from '../SeedQuerySummary';
import JobDate from './JobDate';
import JobList from './JobList';
import VersionGenerationProcess from './VersionGenerationProcess';
import { PERMISSION_ADMIN } from '../../../../lib/auth';
import Permissioned from '../../../common/Permissioned';

const localMessages = {
  title: { id: 'version.running.title', defaultMessage: 'Version {number} - ' },
};

const TopicVersionStatus = ({ topic, snapshot, subtitle, children, focalSets }) => (
  <Grid>
    <div className="topic-version-status">
      <Row>
        <Col lg={12}>
          <h1>
            <FormattedMessage {...localMessages.title} values={{ number: snapshot.note }} />
            <FormattedHTMLMessage {...subtitle} />
          </h1>
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <VersionGenerationProcess snapshot={snapshot} />
        </Col>
      </Row>
      <Row>
        <Col lg={6}>
          <JobDate snapshot={snapshot} job={snapshot.job_states[0]} />
          {children}
          <Permissioned onlyRole={PERMISSION_ADMIN}>
            <JobList jobs={[...topic.job_states]} highlightSnapshotId={snapshot.snapshots_id} />
          </Permissioned>
        </Col>
        <Col lg={1} />
        <Col lg={5}>
          <SeedQuerySummary topic={topic} snapshot={snapshot} focalSets={focalSets} />
        </Col>
      </Row>
    </div>
  </Grid>
);

TopicVersionStatus.propTypes = {
  // from state
  subtitle: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  topic: PropTypes.object.isRequired,
  snapshot: PropTypes.object,
  focalSets: PropTypes.array,
  // from context
  intl: PropTypes.object.isRequired,
};

export default
injectIntl(
  TopicVersionStatus
);
