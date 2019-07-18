import PropTypes from 'prop-types';
import React from 'react';
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import withFilteredAsyncData from '../FilteredAsyncDataContainer';
import { fetchTopicFocalSetsList } from '../../../actions/topicActions';

const localMessages = {
  title: { id: 'topic.info.title', defaultMessage: 'Subtopic Details' },
  set: { id: 'topic.info.set', defaultMessage: 'Name' },
  type: { id: 'topic.info.type', defaultMessage: 'Class' },
  search: { id: 'topic.info.search', defaultMessage: 'Search Terms' },
};

const SubtopicQuerySummary = ({ focalSets, snapshot }) => (
  // the form has them grouped together, but the topic object has them separate
  <div className="">
    <h2>
      {snapshot && <FormattedHTMLMessage {...localMessages.title} values={{ versionNumber: snapshot.note }} />}
    </h2>
    <table className="table">
      <tbody>
        <tr>
          <th><FormattedMessage {...localMessages.set} /></th>
          <th><FormattedMessage {...localMessages.type} /></th>
          <th><FormattedMessage {...localMessages.search} /></th>
        </tr>
        {focalSets.sort((a, b) => a.name.localeCompare(b.name)).map(fs => (
          <div className="subtopic-table">
            <tr key={fs.name}>
              <td>{fs.name}</td>
              {fs.foci && fs.foci.map(f => (
                <span>
                  <td>{f.name}</td>
                  <td>{f.query}</td>
                </span>
              ))}
            </tr>
          </div>
        ))}
      </tbody>
    </table>
  </div>
);

SubtopicQuerySummary.propTypes = {
  topicId: PropTypes.number.isRequired,
  snapshot: PropTypes.object,
  focalSets: PropTypes.array,
  filters: PropTypes.object.isRequired,
  // intl: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.topics.selected.focalSets.all.fetchStatus,
  focalSets: state.topics.selected.focalSets.all.list,
  timespanStoryCount: state.topics.selected.timespans.selected.story_count,
});

const fetchAsyncData = (dispatch, { topicId, filters }) => {
  dispatch(fetchTopicFocalSetsList(topicId, { ...filters, includeStoryCounts: 1 }));
};

export default
injectIntl(
  connect(mapStateToProps)(
    withFilteredAsyncData(fetchAsyncData)(
      SubtopicQuerySummary
    )
  )
);
