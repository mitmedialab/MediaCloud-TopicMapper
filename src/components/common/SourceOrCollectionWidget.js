import PropTypes from 'prop-types';
import React from 'react';
import { Col } from 'react-flexbox-grid/lib';
import { DeleteButton } from './IconButton';

const SourceOrCollectionWidget = (props) => {
  const { object, onDelete, onClick, children } = props;
  const isCollection = object.tags_id !== undefined;

  const typeClass = isCollection ? 'collection' : 'source';
  const objectId = object.id || (isCollection ? object.tags_id : object.media_id);
  const name = isCollection ? (object.name || object.label || object.tag) : (object.name || object.label || object.url);
  return (
    <div
      className={`media-widget ${typeClass}`}
      key={`media-widget${objectId}`}
    >
      <Col>
        <a role="button" tabIndex="0" onClick={onClick}>{name}</a>
        {children}
      </Col>
      <Col>
        <DeleteButton onClick={onDelete} />
      </Col>
    </div>
  );
};

SourceOrCollectionWidget.propTypes = {
  object: PropTypes.object.isRequired,
  onDelete: PropTypes.func,
  onClick: PropTypes.func,
  children: PropTypes.node,
};

export default SourceOrCollectionWidget;
