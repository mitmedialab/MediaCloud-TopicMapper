import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage, FormattedNumber, FormattedDate } from 'react-intl';
import React from 'react';
import { AddButton, DeleteButton } from '../../IconButton';
import { urlToSource } from '../../../../lib/urlUtil';
import { parseSolrShortDate } from '../../../../lib/dateUtil';
import messages from '../../../../resources/messages';

const localMessages = {
  name: { id: 'mediaPicker.searchResults.name', defaultMessage: 'Name' },
  url: { id: 'mediaPicker.searchResults.url', defaultMessage: 'URL' },
  noResults: { id: 'mediaPicker.searchResults.noResults', defaultMessage: 'No matching sources' },
};

const SourceResultsTable = (props) => {
  const { title, sources, handleToggleAndSelectMedia } = props;
  let content = null;
  if (sources.length > 0) {
    content = (
      <table>
        <tbody>
          <tr>
            <th><FormattedMessage {...localMessages.name} /></th>
            <th><FormattedMessage {...localMessages.url} /></th>
            <th className="numeric"><FormattedMessage {...messages.storiesPerDay} /></th>
            <th className="numeric"><FormattedMessage {...messages.sourceStartDate} /></th>
            <th />
          </tr>
          {sources.map((s, idx) => {
            const ActionButton = s.selected ? DeleteButton : AddButton;
            const actionContent = <ActionButton onClick={() => handleToggleAndSelectMedia(s)} />;
            return (
              <tr key={`${s.media_id}`} className={(idx % 2 === 0) ? 'even' : 'odd'}>
                <td><a href={urlToSource(s)} target="new">{s.name}</a></td>
                <td>{s.url}</td>
                <td className="numeric"><FormattedNumber value={Math.round(s.num_stories_90)} /></td>
                <td className="numeric"><FormattedDate value={parseSolrShortDate(s.start_date)} /></td>
                <td>{actionContent}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  } else {
    content = <FormattedMessage {...localMessages.noResults} />;
  }
  return (
    <div>
      <h2>{title}</h2>
      {content}
    </div>
  );
};

SourceResultsTable.propTypes = {
  // from content
  intl: PropTypes.object,
  // from parent
  title: PropTypes.string,
  sources: PropTypes.array,
  handleToggleAndSelectMedia: PropTypes.func,
};

export default
  injectIntl(
    SourceResultsTable
  );

