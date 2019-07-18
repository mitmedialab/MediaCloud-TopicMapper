import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';

const localMessages = {
  completedDetails: { id: 'topic.state.completedDetails', defaultMessage: 'Includes {total} stories ({discoveredPct} discovered) and {fociCount, plural,\n =0 {no subtopics}\n =1 {one subtopic}\n other {# subtopics}}.' },
  subtopicDetails: { id: 'topic.state.subtopicDetails', defaultMessage: 'details' },
};

class TopicVersionReadySummary extends React.Component {
  state = {
    showDetails: false,
  };

  render() {
    const { storyCounts, snapshot } = this.props;
    const { formatNumber } = this.props.intl;
    return (
      <React.Fragment>
        <FormattedMessage
          {...localMessages.completedDetails}
          values={{
            total: formatNumber(storyCounts.total),
            discoveredPct: storyCounts.total === 0 ? '0%' : formatNumber(storyCounts.spidered / storyCounts.total, { style: 'percent', maximumFractionDigits: 0 }),
            fociCount: snapshot.foci_count,
          }}
        />
        &nbsp;
        <a
          href="#subtopic-details"
          onClick={(evt) => {
            evt.preventDefault();
            this.setState(state => ({ showDetails: !state.showDetails }));
          }}
        >
          <FormattedMessage {...localMessages.subtopicDetails} />
        </a>
        <span>
          {this.state.showDetails && (
            <ul>
              {snapshot.foci_names.map((fs, idx) => (
                <li key={idx}><b>{fs.focal_set_name}</b>: {fs.foci_names.join(', ')}</li>
              ))}
            </ul>
          )}
        </span>
      </React.Fragment>
    );
  }
}


TopicVersionReadySummary.propTypes = {
  // from parent
  snapshot: PropTypes.object.isRequired,
  storyCounts: PropTypes.object.isRequired,
  // from compositional chain
  intl: PropTypes.object.isRequired,
};

export default
injectIntl(
  TopicVersionReadySummary
);
