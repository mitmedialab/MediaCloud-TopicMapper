import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import withHelp from '../../common/hocs/HelpfulContainer';
import FocusSelector from './FocusSelector';
import messages from '../../../resources/messages';

const localMessages = {
  title: { id: 'title', defaultMessage: 'About this Subtopic' },
  set: { id: 'focus.set', defaultMessage: '<b>Subtopic Set</b>: {set}' },
  type: { id: 'focus.type', defaultMessage: '<b>Subtopic Set Description</b>: {type}' },
  description: { id: 'focus.description', defaultMessage: '<b>Description</b>: {description}' },
};

class FocusSelectorContainer extends React.Component {
  UNSAFE_componentWillMount() {
    const { setCustomContent, selectedFocus } = this.props;
    if (setCustomContent && selectedFocus) {
      setCustomContent(
        <div>
          <b><FormattedHTMLMessage {...messages.focus} /></b>: {selectedFocus.name}
          <br />
          <FormattedHTMLMessage {...localMessages.description} values={{ description: selectedFocus.description }} />
          <br />
          <b><FormattedHTMLMessage {...messages.query} /></b>: <code>{selectedFocus.query}</code>
          <br />
          <br />
          <FormattedHTMLMessage {...localMessages.set} values={{ set: selectedFocus.focalSet.name }} />
          <br />
          <FormattedHTMLMessage {...localMessages.type} values={{ type: selectedFocus.focalSet.description }} />
          <br /><br />
        </div>
      );
    }
  }

  render() {
    const { foci, selectedFocus, onFocusSelected } = this.props;
    return (
      <span>
        <FocusSelector
          selectedId={(selectedFocus) ? selectedFocus.foci_id : null}
          foci={foci}
          onFocusSelected={onFocusSelected}
        />
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
    withHelp(localMessages.title)(
      FocusSelectorContainer
    )
  )
);
