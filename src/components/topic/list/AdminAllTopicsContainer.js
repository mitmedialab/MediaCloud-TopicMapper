import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import { fetchAdminTopicList } from '../../../actions/topicActions';
import TopicStatusTable from './TopicStatusTable';
import PageTitle from '../../common/PageTitle';

const localMessages = {
  title: { id: 'topics.adminList.title', defaultMessage: 'Admin: Topic Status Dashboard' },
  stateToShow: { id: 'topics.adminList.selectState', defaultMessage: 'State To Show' },
  all: { id: 'topics.adminList.all', defaultMessage: 'all' },
};

class AdminAllTopicsContainer extends React.Component {
  state = {
    selectedTopicState: 'all',
  };

  handleTopicStateSelected = value => this.setState({ selectedTopicState: value });

  render() {
    const { topics } = this.props;
    const { formatMessage } = this.props.intl;
    const uniqueStates = [formatMessage(localMessages.all)].concat(Array.from(new Set(topics.map(t => t.state))));
    const topicsToShow = topics.filter(t => ['all', t.state].includes(this.state.selectedTopicState));
    return (
      <Grid>
        <PageTitle value={localMessages.title} />
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

AdminAllTopicsContainer.propTypes = {
  // from state
  topics: PropTypes.array,
  // from context
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.topics.adminList.fetchStatus,
  topics: state.topics.adminList.topics,
});

const fetchAsyncData = dispatch => dispatch(fetchAdminTopicList());

export default
injectIntl(
  connect(mapStateToProps)(
    withAsyncData(fetchAsyncData)(
      AdminAllTopicsContainer
    )
  )
);
