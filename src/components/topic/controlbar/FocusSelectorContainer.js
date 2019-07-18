import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import withHelp from '../../common/hocs/HelpfulContainer';
import FocusSelector from './FocusSelector';

const localMessages = {
  set: { id: 'focus.set', defaultMessage: '<b>Set</b>: {set}' },
  type: { id: 'focus.type', defaultMessage: '<b>Set Description</b>: {type}' },
  name: { id: 'focus.name', defaultMessage: '<b>Definition Name</b>: {name}' },
  description: { id: 'focus.description', defaultMessage: '<b>Description</b>: {description}' },
  helpDefault: { id: 'focus.help', defaultMessage: 'Select a subtopic to scope the data to that particular set and technique.' },
};

class FocusSelectorContainer extends React.Component {
  componentWillMount() {
    const { setCustomContent, selectedFocus } = this.props;
    if (setCustomContent && selectedFocus) {
      setCustomContent(
        <div>
          <FormattedHTMLMessage {...localMessages.set} values={{ set: selectedFocus.focalSet.name }} />
          <br />
          <FormattedHTMLMessage {...localMessages.type} values={{ type: selectedFocus.focalSet.description }} />
          <br />
          <FormattedHTMLMessage {...localMessages.name} values={{ name: selectedFocus.name }} />
          <br />
          <FormattedHTMLMessage {...localMessages.description} values={{ description: selectedFocus.description }} />
        </div>
      );
    } else if (setCustomContent) {
      setCustomContent(
        <FormattedHTMLMessage {...localMessages.helpDefault} />
      );
    }
  }

  render() {
    const { foci, selectedFocus, onFocusSelected, helpButton } = this.props;
    return (
      <span>
        <FocusSelector
          selectedId={(selectedFocus) ? selectedFocus.foci_id : null}
          foci={foci}
          onFocusSelected={onFocusSelected}
        />
        {helpButton}
      </span>
    );
  }
}

FocusSelectorContainer.propTypes = {
  // from parent
  topicId: PropTypes.number.isRequired,
  location: PropTypes.object.isRequired,
  snapshotId: PropTypes.number,
  onFocusSelected: PropTypes.func.isRequired,
  // from composition
  intl: PropTypes.object.isRequired,
  // from state
  // from context
  setCustomContent: PropTypes.func.isRequired,
  helpButton: PropTypes.node.isRequired,
  foci: PropTypes.array.isRequired,
  selectedFocus: PropTypes.object,
};

const mapStateToProps = state => ({
  foci: state.topics.selected.focalSets.foci.list,
  selectedFocus: state.topics.selected.focalSets.foci.selected,
});

export default
connect(mapStateToProps)(
  injectIntl(
    withHelp()(
      FocusSelectorContainer
    )
  )
);
