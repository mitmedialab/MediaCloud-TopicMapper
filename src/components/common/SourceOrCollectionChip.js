import PropTypes from 'prop-types';
import React from 'react';
import Chip from '@material-ui/core/Chip';
import CollectionIcon from './icons/CollectionIcon';
import MediaSourceIcon from './icons/MediaSourceIcon';
import { urlToCollection, urlToSource } from '../../lib/urlUtil';

const SourceOrCollectionChip = (props) => {
  const { object, onDelete, onClick, autoLink } = props;
  const isCollection = object.tags_id !== undefined;
  let icon;
  if (isCollection) {
    icon = <CollectionIcon height={15} />;
  } else {
    icon = <MediaSourceIcon height={15} />;
  }
  let defaultOnClick = null;
  const objectId = object.id || (isCollection ? object.tags_id : object.media_id);
  if (autoLink) {
    defaultOnClick = () => (
     isCollection ? window.open(urlToCollection(objectId), '_blank') : window.open(urlToSource(objectId), '_blank')
    );
  }
  const typeClass = isCollection ? 'chip-collection' : 'chip-media-source';
  const name = isCollection ? (object.name || object.label || object.tag) : (object.name || object.url);
  return (
    <Chip
      className={`chip ${typeClass}`}
      key={`chip${objectId}`}
      onDelete={onDelete}
      onClick={autoLink ? defaultOnClick : onClick}
      style={{ border: '1px solid rgb(204,204,204)' }}
      avatar={icon}
      label={name}
    />
  );
};

SourceOrCollectionChip.propTypes = {
  object: PropTypes.object.isRequired,
  onDelete: PropTypes.func,
  onClick: PropTypes.func,
  autoLink: PropTypes.bool,
};

export default SourceOrCollectionChip;
