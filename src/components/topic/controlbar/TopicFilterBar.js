import PropTypes from 'prop-types';
import React from 'react';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import ActiveFiltersContainer from './ActiveFiltersContainer';
import FilterSelectorContainer from './FilterSelectorContainer';
import { FilterButton } from '../../common/IconButton';
import { toggleFilterControls, filterByFocus, filterByQuery } from '../../../actions/topicActions';
import TimespanSelectorContainer from './timespans/TimespanSelectorContainer';
import { REMOVE_FOCUS } from './FocusSelector';

const localMessages = {
  permissions: { id: 'topic.changePermissions', defaultMessage: 'Permissions' },
  changePermissionsDetails: { id: 'topic.changePermissions.details', defaultMessage: 'Control who else can see and/or change this topic' },
  settings: { id: 'topic.changeSettings', defaultMessage: 'Settings' },
  changeSettingsDetails: { id: 'topic.changeSettings.details', defaultMessage: 'Edit this topic\'s configuration and visibility' },

  filterTopic: { id: 'topic.filter', defaultMessage: 'Filter this Topic' },
  startedSpider: { id: 'topic.startedSpider', defaultMessage: 'Started a new spidering job for this topic' },
  summaryMessage: { id: 'snapshot.required', defaultMessage: 'You have made some changes that you can only see if you generate a new Snapshot. <a href="{url}">Generate one now</a>.' },
  topicHomepage: { id: 'topic.homepage', defaultMessage: 'Topic Summary' },
};

class TopicFilterBar extends React.Component {
  UNSAFE_componentWillMount() {
    const { setSideBarContent, handleFilterToggle, handleFocusSelected, handleQuerySelected } = this.props;
    const { formatMessage } = this.props.intl;

    const content = (
      <>
        <FilterButton onClick={handleFilterToggle} tooltip={formatMessage(localMessages.filterTopic)} />
        <ActiveFiltersContainer
          onRemoveFocus={() => handleFocusSelected(REMOVE_FOCUS)}
          onRemoveQuery={() => handleQuerySelected(null)}
        />
      </>
    );
    if (setSideBarContent) {
      setSideBarContent(content);
    }
  }

  render() {
    const { topicId, filters, location, handleFocusSelected, handleQuerySelected } = this.props;
    let timespanControls = null;
    // use HOC components to render in the filter control in control bar
    // both the focus and timespans selectors need the snapshot to be selected first

    if ((filters.snapshotId !== null) && (filters.snapshotId !== undefined)) {
      timespanControls = <TimespanSelectorContainer topicId={topicId} location={location} filters={filters} />;
    }
    return (
      <div className="controlbar controlbar-topic">
        <div className="main">
          <FilterSelectorContainer
            location={location}
            onFocusSelected={handleFocusSelected}
            onQuerySelected={handleQuerySelected}
          />
          {timespanControls}
        </div>
      </div>
    );
  }
}

TopicFilterBar.propTypes = {
  // from context
  intl: PropTypes.object.isRequired,
  // from parent
  topicId: PropTypes.number,
  topic: PropTypes.object,
  location: PropTypes.object,
  filters: PropTypes.object.isRequired,
  setSideBarContent: PropTypes.func,
  goToUrl: PropTypes.func,
  handleFilterToggle: PropTypes.func.isRequired,
  handleFocusSelected: PropTypes.func.isRequired,
  handleQuerySelected: PropTypes.func.isRequired,
};


const mapStateToProps = (state, ownProps) => ({
  filters: state.topics.selected.filters,
  topicInfo: state.topics.selected.info,
  topicId: parseInt(ownProps.topicId, 10),
});

const mapDispatchToProps = dispatch => ({
  goToUrl: (url) => {
    dispatch(push(url));
  },
  handleFilterToggle: () => {
    dispatch(toggleFilterControls());
  },
  handleFocusSelected: (focus) => {
    const selectedFocusId = (focus.foci_id === REMOVE_FOCUS) ? null : focus.foci_id;
    dispatch(filterByFocus(selectedFocusId));
  },
  handleQuerySelected: (query) => {
    const queryToApply = ((query === null) || (query.length === 0)) ? null : query; // treat empty query as removal of query string, using null because '' != *
    dispatch(filterByQuery(queryToApply));
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    TopicFilterBar
  )
);
