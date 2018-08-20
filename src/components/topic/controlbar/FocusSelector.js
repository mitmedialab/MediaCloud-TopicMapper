import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import { REMOVE_FOCUS } from './TopicFilterControlBar';
import messages from '../../../resources/messages';

class FocusSelector extends React.Component {

  handleFocusChange = (evt, index, value) => {
    const { foci, onFocusSelected } = this.props;
    const { formatMessage } = this.props.intl;
    let selected;
    if (value === REMOVE_FOCUS) {
      selected = { foci_id: REMOVE_FOCUS, name: formatMessage(messages.noFocus) };
    } else {
      selected = foci.find(focus => (focus.foci_id === value));
    }
    onFocusSelected(selected);
  }

  render() {
    const { foci, selectedId } = this.props;
    const { formatMessage } = this.props.intl;
    const focusName = focus => `${focus.focalSet.name}: ${focus.name}`;
    foci.sort((f1, f2) => { // alphabetical
      const f1Name = focusName(f1).toUpperCase();
      const f2Name = focusName(f2).toUpperCase();
      if (f1Name < f2Name) return -1;
      if (f1Name > f2Name) return 1;
      return 0;
    });
    let detailsContent;
    /* if ((selectedId) && (selectedId !== REMOVE_FOCUS)) {
      detailsContent = (
        <div className="selected-focus-details">
          details
        </div>
      );
    }*/
    // default to none
    return (
      <div className="focus-selector-wrapper">
        <InputLabel htmlFor="name-readonly">Name</InputLabel>
        <Select
          label={formatMessage(messages.focusPick)}
          style={{ color: 'rgb(224,224,224)', opacity: 0.8 }}
          className="focus-selector"
          value={selectedId || ''}
          fullWidth
          onChange={this.handleFocusChange}
        >
          {foci.map(focus =>
            <MenuItem
              key={focus.foci_id}
              value={focus.foci_id}
            >
              <ListItemText>{focusName(focus)}</ListItemText>
            </MenuItem>
          )}
          <MenuItem
            value={REMOVE_FOCUS}
          >
            <ListItemText>{formatMessage(messages.removeFocus)}</ListItemText>
          </MenuItem>
        </Select>
        {detailsContent}
      </div>
    );
  }

}

FocusSelector.propTypes = {
  foci: PropTypes.array.isRequired,
  selectedId: PropTypes.number,
  intl: PropTypes.object.isRequired,
  onFocusSelected: PropTypes.func,
};

export default
  injectIntl(
    FocusSelector
  );
