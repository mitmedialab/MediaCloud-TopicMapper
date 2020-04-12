import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import MenuItem from '@material-ui/core/MenuItem';
import { PAST_DAY, PAST_WEEK, PAST_MONTH } from '../../../lib/dateUtil';

const localMessages = {
  pastDay: { id: 'wordcloud.time.pastDay', defaultMessage: 'Chart by day' },
  pastWeek: { id: 'wordcloud.time.pastWeek', defaultMessage: 'Chart by week' },
  pastMonth: { id: 'wordcloud.time.pastMonth', defaultMessage: 'Chart by month' },
  pastYear: { id: 'wordcloud.time.pastYear', defaultMessage: 'Chart by year' },
};

/**
 * This gives the child:
 * * `attentionAggregationMenuItems` UI elements
 * * `selectedTimePeriod` string for the selected aggregation tme period
 */
const withAttentionAggregation = (ChildComponent, defaultTimePeriod) => {
  class AttentionAggregation extends React.Component {
    state = {
      selectedTimePeriod: defaultTimePeriod || PAST_DAY,
    }

    saveStateAndReorder = (newTimePeriod) => {
      this.setState({ selectedTimePeriod: newTimePeriod });
    }

    render() {
      const attentionAggregationMenuItems = [
        <MenuItem
          key="chartByDay"
          className="action-icon-menu-item"
          disabled={this.state.selectedTimePeriod === PAST_DAY}
          onClick={() => this.saveStateAndReorder(PAST_DAY)}
        >
          <FormattedMessage {...localMessages.pastDay} />
        </MenuItem>,
        <MenuItem
          key="chartByWeek"
          className="action-icon-menu-item"
          disabled={this.state.selectedTimePeriod === PAST_WEEK}
          onClick={() => this.saveStateAndReorder(PAST_WEEK)}
        >
          <FormattedMessage {...localMessages.pastWeek} />
        </MenuItem>,
        <MenuItem
          key="chartByMonth"
          className="action-icon-menu-item"
          disabled={this.state.selectedTimePeriod === PAST_MONTH}
          onClick={() => this.saveStateAndReorder(PAST_MONTH)}
        >
          <FormattedMessage {...localMessages.pastMonth} />
        </MenuItem>,
      ];
      return (
        <span className="periodic-container">
          <ChildComponent
            {...this.props}
            selectedTimePeriod={this.state.selectedTimePeriod}
            attentionAggregationMenuItems={attentionAggregationMenuItems}
          />
        </span>
      );
    }
  }
  AttentionAggregation.propTypes = {
    intl: PropTypes.object.isRequired,
  };
  return injectIntl(
    AttentionAggregation
  );
};

export default withAttentionAggregation;
