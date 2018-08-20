import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import withAsyncFetch from '../../common/hocs/AsyncContainer';
import { fetchAdminTopicList } from '../../../actions/topicActions';
import TopicStatusTable from './TopicStatusTable';

const localMessages = {
  title: { id: 'topics.adminList.title', defaultMessage: 'Admin: Topic Status Dashboard' },
  stateToShow: { id: 'topics.adminList.selectState', defaultMessage: 'State To Show' },
};

class TopicStatusDashboardContainer extends React.Component {

  state = {
    selectedTopicState: 'error',
  };

  handleTopicStateSelected = value => this.setState({ selectedTopicState: value });

  render() {
    const { topics } = this.props;
    const { formatMessage } = this.props.intl;
    const uniqueStates = Array.from(new Set(topics.map(t => t.state)));
    const topicsToShow = topics.filter(t => t.state === this.state.selectedTopicState);
    return (
      <Grid>
        <Row>
          <Col lg={12}>
            <h1><FormattedMessage {...localMessages.title} /></h1>
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <Select
              label={formatMessage(localMessages.stateToShow)}
              value={this.state.selectedTopicState || ''}
            >
              {uniqueStates.map((state, index) => <MenuItem key={index} value={state}><ListItemText onClick={() => this.handleTopicStateSelected(state)}>{state}</ListItemText></MenuItem>)}
            </Select>
          </Col>
        </Row>
        <Row>
          <TopicStatusTable topics={topicsToShow} />
        </Row>
      </Grid>
    );
  }

}

TopicStatusDashboardContainer.propTypes = {
  // from state
  topics: PropTypes.array,
  // from context
  intl: PropTypes.object.isRequired,
  // from dispatch
  asyncFetch: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.topics.adminList.fetchStatus,
  topics: state.topics.adminList.topics,
});

const mapDispatchToProps = dispatch => ({
  asyncFetch: () => {
    dispatch(fetchAdminTopicList());
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      withAsyncFetch(
        TopicStatusDashboardContainer
      )
    )
  );
