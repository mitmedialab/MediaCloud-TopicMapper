import PropTypes from 'prop-types';
import React from 'react';
import { Sigma, LoadGEXF } from 'react-sigma';
import { urlToMediaMap } from '../summary/DownloadMapContainer';

const GexfLinkMap = ({ topicId, timespanId, mediaMapFile }) => (
  <Sigma style={{ border: '1px sold #ccc', width: '1100px', height: '800px' }}>
    <LoadGEXF path={urlToMediaMap(topicId, timespanId, mediaMapFile)} />
  </Sigma>
);

GexfLinkMap.propTypes = {
  // from compositional chain
  // from state
  // from dispatch
  // from parent
  topicId: PropTypes.number.isRequired,
  mediaMapFile: PropTypes.object.isRequired,
  timespanId: PropTypes.number.isRequired,
};

export default GexfLinkMap;
