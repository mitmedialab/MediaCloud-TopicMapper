import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import MetadataPickerContainer from '../../../common/MetadataPickerContainer';
import { TAG_SET_PUBLICATION_COUNTRY, TAG_SET_PUBLICATION_STATE, TAG_SET_PRIMARY_LANGUAGE, TAG_SET_COUNTRY_OF_FOCUS, TAG_SET_MEDIA_TYPE } from '../../../../lib/tagUtil';

const localMessages = {
  title: { id: 'source.add.metadata.title', defaultMessage: 'Source Metadata' },
};

const SourceMetadataForm = props => (
  <div className="form-section source-metadata-form">
    <Row>
      <Col lg={12}>
        <h2><FormattedMessage {...localMessages.title} /></h2>
      </Col>
    </Row>
    <Row>
      <Col lg={3} xs={12}>
        <MetadataPickerContainer
          autocomplete
          id={TAG_SET_PUBLICATION_COUNTRY}
          name={'publicationCountry'}
          form="sourceForm"
          initialValues={props.initialValues}
        />
      </Col>
      <Col lg={3} xs={12}>
        <MetadataPickerContainer
          autocomplete
          id={TAG_SET_PUBLICATION_STATE}
          name={'publicationState'}
          form="sourceForm"
          initialValues={props.initialValues}
        />
      </Col>
      <Col lg={3} xs={12}>
        <MetadataPickerContainer
          autocomplete
          id={TAG_SET_PRIMARY_LANGUAGE}
          name={'primaryLanguage'}
          form="sourceForm"
          disabled
          initialValues={props.initialValues}
        />
      </Col>
      <Col lg={3} xs={12}>
        <MetadataPickerContainer
          autocomplete
          id={TAG_SET_COUNTRY_OF_FOCUS}
          name={'countryOfFocus'}
          form="sourceForm"
          disabled
          initialValues={props.initialValues}
        />
      </Col>
    </Row>
    <Row>
      <Col lg={3} xs={12}>
        <MetadataPickerContainer
          autocomplete
          id={TAG_SET_MEDIA_TYPE}
          name={'mediaType'}
          form="sourceForm"
          showDescription
          initialValues={props.initialValues}
        />
      </Col>
    </Row>
  </div>
);

SourceMetadataForm.propTypes = {
  // from compositional chain
  initialValues: PropTypes.object,
  intl: PropTypes.object.isRequired,
};

export default
  injectIntl(
    SourceMetadataForm
  );
