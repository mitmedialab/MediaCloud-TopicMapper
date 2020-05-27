import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import PlatformTotalContentPreviewContainer from './PlatformTotalContentPreviewContainer';
import PlatformAttentionPreviewContainer from './PlatformAttentionPreviewContainer';
import PlatformWordsPreviewContainer from './PlatformWordsPreviewContainer';
import PlatformContentPreviewContainer from './PlatformContentPreviewContainer';

const PlatformPreview = ({ formatPlatformChannelData, lastUpdated }) => (
  <div className="platform-create-open-web-preview">
    <Row>
      <Col lg={12}>
        <PlatformTotalContentPreviewContainer
          lastUpdated={lastUpdated}
          formatPlatformChannelData={formatPlatformChannelData}
        />
      </Col>
    </Row>
    <Row>
      <Col lg={12}>
        <PlatformAttentionPreviewContainer
          lastUpdated={lastUpdated}
          formatPlatformChannelData={formatPlatformChannelData}
        />
      </Col>
    </Row>
    <Row>
      <Col lg={12}>
        <PlatformWordsPreviewContainer
          lastUpdated={lastUpdated}
          formatPlatformChannelData={formatPlatformChannelData}
        />
      </Col>
    </Row>
    <Row>
      <Col lg={12}>
        <PlatformContentPreviewContainer
          lastUpdated={lastUpdated}
          formatPlatformChannelData={formatPlatformChannelData}
        />
      </Col>
    </Row>
  </div>
);

PlatformPreview.propTypes = {
  // from context
  intl: PropTypes.object.isRequired,
  // from parent
  lastUpdated: PropTypes.number,
  formatPlatformChannelData: PropTypes.func,
};

export default injectIntl(PlatformPreview);
