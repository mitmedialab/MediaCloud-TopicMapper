import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import SearchStoryCountPreviewContainer from './SearchStoryCountPreviewContainer';
import SearchStoryPreviewContainer from './SearchStoryPreviewContainer';

const localMessages = {
  about: { id: 'focus.create.keyword.results.about',
    defaultMessage: 'Here is a preview of total number of stories we have found that match your query within the overall topic.' },
};

const SearchPreview = (props) => {
  const { topicId, searchValues } = props;
  return (
    <div className="focal-create-boolean-keyword-preview">
      <Row>
        <Col lg={10}>
          <SearchStoryCountPreviewContainer topicId={topicId} searchValues={searchValues} />
        </Col>
        <Col lg={2}>
          <p className="light"><i><FormattedMessage {...localMessages.about} /></i></p>
        </Col>
      </Row>
      <Row>
        <Col lg={10} md={10} xs={12}>
          <SearchStoryPreviewContainer topicId={topicId} searchValues={searchValues} />
        </Col>
      </Row>
    </div>
  );
};

SearchPreview.propTypes = {
  // from context
  intl: PropTypes.object.isRequired,
  // from parent
  searchValues: PropTypes.array.isRequired,
  topicId: PropTypes.number.isRequired,
};

export default injectIntl(SearchPreview);
