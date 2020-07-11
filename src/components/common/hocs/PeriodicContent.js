import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import MenuItem from '@material-ui/core/MenuItem';
import ActionMenu from '../ActionMenu';
import { calculateTimePeriods, PAST_WEEK, PAST_MONTH, PAST_YEAR, PAST_ALL } from '../../../lib/dateUtil';

const localMessages = {
  timePeriodMenuTitle: { id: 'periodic.menuTitle', defaultMessage: 'Change Time Period...' },
  pastWeek: { id: 'periodic.pastWeek', defaultMessage: 'past week' },
  pastMonth: { id: 'periodic.pastMonth', defaultMessage: 'past month' },
  pastYear: { id: 'periodic.pastYear', defaultMessage: 'past year' },
  all: { id: 'periodic.all', defaultMessage: 'all time' },
};

/**
 * Give this:
 * 1. `selectedTimePeriod` string
 * 2. `handleTimePeriodClick` callback handler
 * It gives the child:
 * 1. `timePeriodControls` UI elements
 */
const withTimePeriods = (ChildComponent, hideAllTimeOption = false) => {
  class PeriodicContent extends React.Component {
    saveStateAndTriggerFetch = (timePeriod) => {
      const { handleTimePeriodClick } = this.props;
      handleTimePeriodClick(calculateTimePeriods(timePeriod), timePeriod);
    }

    render() {
      const { selectedTimePeriod } = this.props;
      const timePeriodControls = (
        <div className="periodic-controls">
          <a
            href="#"
            role="button"
            tabIndex="0"
            className={selectedTimePeriod === PAST_WEEK ? 'selected' : ''}
            onClick={e => this.saveStateAndTriggerFetch(PAST_WEEK, e)}
          >
            <FormattedMessage {...localMessages.pastWeek} />
          </a>
          <a
            href="#"
            role="button"
            tabIndex="0"
            className={selectedTimePeriod === PAST_MONTH ? 'selected' : ''}
            onClick={e => this.saveStateAndTriggerFetch(PAST_MONTH, e)}
          >
            <FormattedMessage {...localMessages.pastMonth} />
          </a>
          <a
            href="#"
            role="button"
            tabIndex="0"
            className={selectedTimePeriod === PAST_YEAR ? 'selected' : ''}
            onClick={e => this.saveStateAndTriggerFetch(PAST_YEAR, e)}
          >
            <FormattedMessage {...localMessages.pastYear} />
          </a>
          {!hideAllTimeOption && (
            <a
              href="#"
              role="button"
              tabIndex="0"
              className={selectedTimePeriod === PAST_ALL ? 'selected' : ''}
              onClick={e => this.saveStateAndTriggerFetch(PAST_ALL, e)}
            >
              <FormattedMessage {...localMessages.all} />
            </a>
          )}
        </div>
      );
      const timePeriodMenu = (
        <ActionMenu actionTextMsg={localMessages.timePeriodMenuTitle}>
          <MenuItem
            className="action-icon-menu-item"
            disabled={selectedTimePeriod === PAST_WEEK}
            onClick={e => this.saveStateAndTriggerFetch(PAST_WEEK, e)}
          >
            <FormattedMessage {...localMessages.pastWeek} />
          </MenuItem>
          <MenuItem
            className="action-icon-menu-item"
            disabled={selectedTimePeriod === PAST_MONTH}
            onClick={e => this.saveStateAndTriggerFetch(PAST_MONTH, e)}
          >
            <FormattedMessage {...localMessages.pastMonth} />
          </MenuItem>
          <MenuItem
            className="action-icon-menu-item"
            disabled={selectedTimePeriod === PAST_YEAR} // can only edit in ordered mode
            onClick={e => this.saveStateAndTriggerFetch(PAST_YEAR, e)}
          >
            <FormattedMessage {...localMessages.pastYear} />
          </MenuItem>
          {!hideAllTimeOption && (
            <MenuItem
              className="action-icon-menu-item"
              disabled={selectedTimePeriod === PAST_ALL} // can only edit in ordered mode
              onClick={e => this.saveStateAndTriggerFetch(PAST_ALL, e)}
            >
              <FormattedMessage {...localMessages.all} />
            </MenuItem>
          )}
        </ActionMenu>
      );
      return (
        <span className="periodic-container">
          <ChildComponent
            {...this.props}
            timePeriodControls={timePeriodControls}
            timePeriodMenu={timePeriodMenu}
          />
        </span>
      );
    }
  }
  PeriodicContent.propTypes = {
    intl: PropTypes.object.isRequired,
    selectedTimePeriod: PropTypes.string.isRequired,
    handleTimePeriodClick: PropTypes.func.isRequired,
  };
  return injectIntl(
    PeriodicContent
  );
};

export default withTimePeriods;
