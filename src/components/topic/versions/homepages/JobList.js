import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage, FormattedDate, FormattedTime } from 'react-intl';
import { postgresDateToMoment } from '../../../../lib/dateUtil';
import { trimToMaxLength } from '../../../../lib/stringUtil';

const localMessages = {
  title: { id: 'topic.jobs.list', defaultMessage: 'Detailed Job List (Admin only)' },
  versionNumber: { id: 'topic.jobs.versionNumber', defaultMessage: 'Version' },
  id: { id: 'topic.jobs.id', defaultMessage: 'Id' },
  class: { id: 'topic.jobs.class', defaultMessage: 'Class' },
  status: { id: 'topic.jobs.status', defaultMessage: 'State' },
  noJobs: { id: 'topic.jobs.none', defaultMessage: 'No jobs yet.' },
  lastUpdated: { id: 'topic.jobs.lastUpdated', defaultMessage: 'Last Updated' },
  message: { id: 'topic.jobs.message', defaultMessage: 'Message' },
};

function classNameFromPackage(packagePath) { return (packagePath) ? packagePath.split('::').pop() : '?'; }

const JobList = ({ jobs, highlightSnapshotId }) => (
  <React.Fragment>
    <h2><FormattedMessage {...localMessages.title} /></h2>
    { jobs.length === 0 && (<p><FormattedMessage {...localMessages.noJobs} /></p>)}
    { jobs.length > 0 && (
      <table>
        <thead>
          <tr>
            <th><FormattedMessage {...localMessages.versionNumber} /></th>
            <th><FormattedMessage {...localMessages.id} /></th>
            <th><FormattedMessage {...localMessages.class} /></th>
            <th><FormattedMessage {...localMessages.status} /></th>
            <th><FormattedMessage {...localMessages.lastUpdated} /></th>
            <th><FormattedMessage {...localMessages.message} /></th>
          </tr>
        </thead>
        <tbody className="job-list">
          {jobs
            .sort((a, b) => postgresDateToMoment(b.last_updated) - postgresDateToMoment(a.last_updated))
            .map(job => (
              <tr
                key={job.job_states_id}
                className={(highlightSnapshotId === job.snapshots_id) ? 'highlight' : ''}
              >
                <td>{job.versionNumber}</td>
                <td>{job.job_states_id}</td>
                <td>{classNameFromPackage(job.class)}</td>
                <td><span className={(job.state === 'error') ? 'warning' : ''}>{job.state}</span></td>
                <td>
                  <FormattedDate value={postgresDateToMoment(job.last_updated, false)} />
                  &nbsp;
                  <FormattedTime value={postgresDateToMoment(job.last_updated, false)} />
                </td>
                <td>{trimToMaxLength(job.message, 500)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    )}
  </React.Fragment>
);

JobList.propTypes = {
  // from state
  jobs: PropTypes.array.isRequired,
  highlightSnapshotId: PropTypes.number,
  // from context
  intl: PropTypes.object.isRequired,
};

export default
injectIntl(
  JobList
);
