import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import EditableWordCloudDataCard from './EditableWordCloudDataCard';
import withTimePeriods from './hocs/PeriodicContent';
import { calculateTimePeriods } from '../../lib/dateUtil';

const PeriodicEditableWordCloudDataCard = props => (
  <EditableWordCloudDataCard
    words={props.words}
    downloadUrl={(props.downloadUrl) ? `${props.downloadUrl}?q=${calculateTimePeriods(props.selectedTimePeriod)}` : null}
    onDownload={props.onDownload}
    onViewModeClick={props.onViewModeClick}
    domId={props.domId}
    width={props.width || 520}
    title={props.title}
    helpButton={props.helpButton}
    extraActionMenu={props.timePeriodMenu}
    actionsAsLinksUnderneath
  />
);

PeriodicEditableWordCloudDataCard.propTypes = {
  // from parent
  width: PropTypes.number,
  height: PropTypes.number,
  maxFontSize: PropTypes.number,
  minFontSize: PropTypes.number,
  title: PropTypes.string.isRequired,
  words: PropTypes.array.isRequired,
  itemId: PropTypes.string,
  downloadUrl: PropTypes.string,
  onDownload: PropTypes.func,
  explore: PropTypes.object,
  download: PropTypes.func,
  helpButton: PropTypes.node,
  handleTimePeriodClick: PropTypes.func.isRequired,
  selectedTimePeriod: PropTypes.string.isRequired,
  // from dispatch
  onViewModeClick: PropTypes.func.isRequired,
  domId: PropTypes.string.isRequired,
  // from compositional chain
  timePeriodMenu: PropTypes.node.isRequired,
  intl: PropTypes.object.isRequired,
};

export default
injectIntl(
  withTimePeriods(
    PeriodicEditableWordCloudDataCard
  )
);
