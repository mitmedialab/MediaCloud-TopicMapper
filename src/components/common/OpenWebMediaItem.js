import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedHTMLMessage } from 'react-intl';
import { DeleteButton } from './IconButton';
import { stringifyTags } from '../../lib/explorerUtil';
import { emptyString } from '../../lib/formValidators';
import { urlToSource, urlToCollection } from '../../lib/urlUtil';

const localMessages = {
  searchFull: { id: 'explorer.mediaPicker.search', defaultMessage: 'Custom Collection<br /> &nbsp;Name: "{keyword}" <br /> {values}' },
  searchWithKeyword: { id: 'explorer.mediaPicker.search', defaultMessage: 'Custom Collection<br /> &nbsp;Name: "{keyword}"' },
  searchWithTags: { id: 'explorer.mediaPicker.search', defaultMessage: 'Custom Collection: <br /> {values} ' },

};

const OpenWebMediaItem = ({ object, onDelete, intl, justText }) => {
  const isSearch = object.customColl === true;
  const isCollection = object.tags_id !== undefined;
  // if (!isSearch && !object.selected) return null;

  let typeClass = 'source';
  let objectId = object.media_id;
  let name = (object.name || object.label || object.url);
  let metadataSearch = '';
  if (isCollection) {
    typeClass = 'collection';
    objectId = object.tags_id;
    name = (object.name || object.label || object.tag);
  } else if (isSearch) {
    typeClass = 'search';
    objectId = 'custom'; //  maybe create a unique id
    metadataSearch = stringifyTags(object.tags, intl.formatMessage);
    if (metadataSearch.length > 0 && object.mediaKeyword) {
      metadataSearch = <FormattedHTMLMessage {...localMessages.searchFull} values={{ keyword: object.mediaKeyword, values: metadataSearch }} />;
    } else if (emptyString(object.mediaKeyword) || object.mediaKeyword === '*') {
      metadataSearch = <FormattedHTMLMessage {...localMessages.searchWithTags} values={{ values: metadataSearch }} />;
    } else {
      metadataSearch = <FormattedHTMLMessage {...localMessages.searchWithKeyword} values={{ keyword: object.mediaKeyword }} />;
    }
  }
  // link the text if there is a click handler defined
  let url = null;
  if (object.tags_id) {
    url = urlToCollection(object.tags_id);
  } else if (object.media_id) {
    url = urlToSource(object.media_id);
  } else { // it is a search, no link for now (TODO: link to saved search in sources advanced search results
    url = null;
  }
  let text;
  if (url) {
    text = (<a href={url} target="_blank" rel="noopener noreferrer">{name}</a>);
  } else {
    text = name;
  }
  if (justText) {
    return text;
  }
  return (
    <span
      className={`media-widget ${typeClass}`}
      key={`media-widget${objectId}`}
    >
      {text}
      {onDelete && <DeleteButton onClick={onDelete} />}
      {metadataSearch}
    </span>
  );
};

OpenWebMediaItem.propTypes = {
  object: PropTypes.object.isRequired,
  onDelete: PropTypes.func,
  intl: PropTypes.object,
  justText: PropTypes.bool,
};

export default injectIntl(OpenWebMediaItem);
