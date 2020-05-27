import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { platformNameMessage, sourceNameMessage } from '../platforms/AvailablePlatform';
import messages from '../../../resources/messages';
import { POSTGRES_SOURCE } from '../../../lib/platformTypes';

const localMessages = {
  completedDetails: { id: 'topic.version.completedDetails', defaultMessage: 'Includes {total} stories ({discoveredPct} discovered), {platformCount, plural,\n =0 {no platforms}\n =1 {1 platform}\n other {# platforms}}, and {fociCount, plural,\n =0 {no subtopics}\n =1 {1 subtopic}\n other {# subtopics}}.' },
  snapshotDetails: { id: 'topic.version.snapshotDetails', defaultMessage: 'details' },
  dates: { id: 'topic.version.dates', defaultMessage: 'Stories between {start} and {end}' },
  spidering: { id: 'topic.version.spidering', defaultMessage: '{rounds} rounds of spidering' },
};

class TopicVersionReadySummary extends React.Component {
  constructor(props) {
    super(props);
    // yes, we init state with props here, but this is the exception to the anti-pattern
    // we are just seeding the state here; this coponent is in control from now on
    // this just lets us re-use this component in multiple places
    this.state = {
      showDetails: props.startWithDetailsShowing || false,
    };
  }

  render() {
    const { topic, storyCounts, snapshot, intl, focalSets, startWithDetailsShowing } = this.props;
    const { formatNumber } = intl;
    const total = storyCounts ? formatNumber(storyCounts.total) : '?';
    let discoveredPct = 'unknown';
    if (storyCounts) {
      discoveredPct = storyCounts.total === 0 ? '0%' : formatNumber(storyCounts.spidered / storyCounts.total, { style: 'percent', maximumFractionDigits: 0 });
    }
    const seedQueries = snapshot.topic_seed_queries || snapshot.platform_seed_queries;
    const fociCount = snapshot.foci_count || (focalSets && focalSets.length) || 0;
    return (
      <>
        {!startWithDetailsShowing && (
          <>
            <FormattedMessage
              {...localMessages.completedDetails}
              values={{
                total,
                discoveredPct,
                platformCount: seedQueries.length,
                fociCount,
              }}
            />
            &nbsp;
            <a
              href="#version-details"
              onClick={(evt) => {
                evt.preventDefault();
                this.setState(state => ({ showDetails: !state.showDetails }));
              }}
            >
              <FormattedMessage {...localMessages.snapshotDetails} />
            </a>
          </>
        )}
        <span>
          {this.state.showDetails && (
            <ul>
              <li>
                <FormattedMessage
                  {...localMessages.dates}
                  values={{
                    start: snapshot.start_date || ((snapshot.seed_queries) ? snapshot.seed_queries.topic.start_date : null) || topic.start_date,
                    end: snapshot.end_date || ((snapshot.seed_queries) ? snapshot.seed_queries.topic.end_date : null) || topic.end_date,
                  }}
                />
              </li>
              <li><FormattedMessage {...localMessages.spidering} values={{ rounds: snapshot.max_iterations || ((snapshot.seed_queries) ? snapshot.seed_queries.topic.max_iterations : null) || topic.max_iterations }} /></li>
              <li><FormattedMessage {...messages.platformHeader} />:
                <ul>
                  {seedQueries && seedQueries
                    .filter(p => p.source !== POSTGRES_SOURCE)
                    .map((p, idx) => (
                      <li key={idx}>
                        <FormattedMessage {...platformNameMessage(p.platform, p.source)} />
                        &nbsp;
                        (<FormattedMessage {...sourceNameMessage(p.source)} />)
                      </li>
                    ))}
                </ul>
              </li>
              <li><FormattedMessage {...messages.focusHeader} />:
                <ul>
                  {focalSets && focalSets.map((fs, idx) => (
                    <li key={idx}>{fs.name}: {fs.focus_definitions.map(fd => fd.name).join(', ')}</li>
                  ))}
                  {snapshot.foci_names && snapshot.foci_names.map((fs, idx) => (
                    <li key={idx}>{fs.focal_set_name}: {fs.foci_names.join(', ')}</li>
                  ))}
                </ul>
              </li>
            </ul>
          )}
        </span>
      </>
    );
  }
}

TopicVersionReadySummary.propTypes = {
  // from parent
  snapshot: PropTypes.object.isRequired,
  topic: PropTypes.object.isRequired,
  storyCounts: PropTypes.object,
  startWithDetailsShowing: PropTypes.bool,
  focalSets: PropTypes.array, // for the current version, the focal sets need to be passed in because they aren't part of the topic siummary object
  // from compositional chain
  intl: PropTypes.object.isRequired,
};

export default
injectIntl(
  TopicVersionReadySummary
);
