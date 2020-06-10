import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import React from 'react';
import { AddButton, DeleteButton } from '../../IconButton';
import { urlToCollection } from '../../../../lib/urlUtil';

const localMessages = {
  name: { id: 'mediaPicker.searchResults.name', defaultMessage: 'Name' },
  tagSetLabel: { id: 'mediaPicker.searchResults.tagSetLabel', defaultMessage: 'Category' },
  description: { id: 'mediaPicker.searchResults.description', defaultMessage: 'Description' },
  mediaSources: { id: 'mediaPicker.searchResults.mediaSources', defaultMessage: 'Media Sources' },
  noResults: { id: 'mediaPicker.searchResults.noResults', defaultMessage: 'No matching collections' },
};

const INCLUDE_SOURCE_COUNTS = false;

const CollectionResultsTable = (props) => {
  const { title, collections, onToggleSelected, viewOnly } = props;
  let content = null;
  let mediaCountHeader;
  if (INCLUDE_SOURCE_COUNTS) {
    mediaCountHeader = <th className="numeric"><FormattedMessage {...localMessages.mediaSources} /></th>;
  }
  if (collections.length > 0) {
    content = (
      <table>
        <tbody>
          <tr>
            <th><FormattedMessage {...localMessages.name} /></th>
            <th><FormattedMessage {...localMessages.tagSetLabel} /></th>
            <th><FormattedMessage {...localMessages.description} /></th>
            {mediaCountHeader}
            <th />
          </tr>
          {collections.map((c, idx) => {
            const ActionButton = c.selected ? DeleteButton : AddButton;
            const actionContent = <ActionButton onClick={() => onToggleSelected(c)} />;
            let mediaCountValue;
            if (INCLUDE_SOURCE_COUNTS) {
              mediaCountValue = <td className="numeric">{(c.media_count === 100) ? `${c.media_count}+` : c.media_count}</td>;
            }
            return (
              <tr key={`${c.tags_id}`} className={(idx % 2 === 0) ? 'even' : 'odd'}>
                <td><a href={urlToCollection(c.tags_id)} target="new">{c.name !== "undefined" ? c.name : c.label}</a></td>
                <td>{c.tag_set_label}</td>
                <td>{c.description}</td>
                {mediaCountValue}
                <td>{ !viewOnly && actionContent}</td>
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

CollectionResultsTable.propTypes = {
  // from content
  intl: PropTypes.object,
  // from parent
  title: PropTypes.string,
  collections: PropTypes.array,
  onToggleSelected: PropTypes.func,
  viewOnly: PropTypes.bool,
};

export default
injectIntl(
  CollectionResultsTable
);
