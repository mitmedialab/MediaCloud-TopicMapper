import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Row, Col } from 'react-flexbox-grid/lib';
import withAsyncFetch from '../../common/hocs/AsyncContainer';
import DataCard from '../../common/DataCard';
import { fetchTopicWord2VecTimespans } from '../../../actions/topicActions';
import Word2VecTimespanPlayer from '../../vis/Word2VecTimespanPlayer';

const localMessages = {
  title: { id: 'topic.timespanPlayer.title', defaultMessage: 'Topic Word Space Over Time' },
  intro: { id: 'topic.timespanPlayer.intro', defaultMessage: 'TODO: Description' },
};

class Word2VecTimespanPlayerContainer extends React.Component {

  componentWillReceiveProps(nextProps) {
    const { fetchData, filters } = this.props;
    if ((nextProps.filters.snapshotId !== filters.snapshotId) ||
        (nextProps.filters.focusId !== filters.focusId) ||
        (nextProps.filters.q !== filters.q)) {
      fetchData(nextProps);
    }
  }

  render() {
    const { selectedTimespan, timespanEmbeddings } = this.props;
    if ((selectedTimespan === undefined) || (selectedTimespan === null)) {
      return (<div />);
    }
    return (
      <Row>
        <Col lg={12}>
          <DataCard>
            <h2><FormattedMessage {...localMessages.title} /></h2>
            <Word2VecTimespanPlayer
              xProperty={'w2v_x'}
              yProperty={'w2v_y'}
              initialTimespan={selectedTimespan}
              timespanEmbeddings={timespanEmbeddings}
            />
          </DataCard>
        </Col>
      </Row>
    );
  }
}

Word2VecTimespanPlayerContainer.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  // from state
  topicId: PropTypes.number.isRequired,
  filters: PropTypes.object.isRequired,
  fetchStatus: PropTypes.string.isRequired,
  selectedTimespan: PropTypes.object,
  timespanEmbeddings: PropTypes.array.isRequired,
  // from dispatch
  fetchData: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  selectedTimespan: state.topics.selected.timespans.selected,
  filters: state.topics.selected.filters,
  topicId: state.topics.selected.id,
  fetchStatus: state.topics.selected.summary.word2vecTimespans.fetchStatus,
  timespanEmbeddings: state.topics.selected.summary.word2vecTimespans.list,
});

const mapDispatchToProps = dispatch => ({
  fetchData: (props) => {
    dispatch(fetchTopicWord2VecTimespans(props.topicId, props.filters));
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    asyncFetch: () => {
      dispatchProps.fetchData({
        filters: stateProps.filters,
        topicId: stateProps.topicId,
      });
    },
  });
}

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps, mergeProps)(
      withAsyncFetch(
        Word2VecTimespanPlayerContainer
      )
    )
  );
