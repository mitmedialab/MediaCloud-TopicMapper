import PropTypes from 'prop-types';
import React from 'react';
import { Field, reduxForm, FormSection } from 'redux-form';
import { injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import withIntlForm from '../../common/hocs/IntlForm';
import MetadataPickerContainer from '../../common/MetadataPickerContainer';
import MediaPickerSearchForm from './MediaPickerSearchForm';
import AppButton from '../../common/AppButton';
import { TAG_SET_PUBLICATION_COUNTRY, TAG_SET_PUBLICATION_STATE, TAG_SET_PRIMARY_LANGUAGE, TAG_SET_COUNTRY_OF_FOCUS, TAG_SET_MEDIA_TYPE } from '../../../lib/tagUtil';

const localMessages = {
  searchSuggestion: { id: 'search.advanced.searchTip', defaultMessage: 'match these words' },
  pubCountrySuggestion: { id: 'search.advanced.pubCountryTip', defaultMessage: 'published in' },
  pubStateSuggestion: { id: 'search.advanced.pubStateTip', defaultMessage: 'state published in' },
  pLanguageSuggestion: { id: 'search.advanced.pLanguageTip', defaultMessage: 'primary language' },
  pCountryOfFocusSuggestion: { id: 'search.advanced.pCountryOfFocusTip', defaultMessage: 'country of focus' },
  pMediaType: { id: 'search.advanced.pMediaType', defaultMessage: 'media type' },
  search: { id: 'system.mediaPicker.select.search', defaultMessage: 'Search' },
};

class AdvancedMediaPickerSearchForm extends React.Component {
  handleSearchButtonClick = (evt) => {
    const { onSearch } = this.props;
    evt.preventDefault();
    const searchStr = document.getElementsByTagName('input')[0].value;  // note: this is a brittle hack
    onSearch({ mediaKeyword: searchStr });
  }
  render() {
    const { initValues, renderTextField, hintText } = this.props;
    const { formatMessage } = this.props.intl;

    const content = (
      <FormSection name="advanced-media-picker-search">
        <Row>
          <Col lg={10}>
            <Field
              name={'advancedSearchQueryString'}
              value={initValues}
              component={renderTextField}
              label={formatMessage(localMessages.searchSuggestion)}
              fullWidth
            />
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            <MetadataPickerContainer
              autocomplete
              id={TAG_SET_PUBLICATION_COUNTRY}
              name={'publicationCountry'}
              form="advancedQueryForm"
              label={formatMessage(localMessages.pubCountrySuggestion)}
            />
          </Col>
          <Col lg={6}>
            <MetadataPickerContainer
              autocomplete
              id={TAG_SET_PUBLICATION_STATE}
              name={'publicationState'}
              form="advancedQueryForm"
              label={formatMessage(localMessages.pubStateSuggestion)}
            />
          </Col>
          <Col lg={6}>
            <MetadataPickerContainer
              autocomplete
              id={TAG_SET_PRIMARY_LANGUAGE}
              name={'primaryLanguage'}
              form="advancedQueryForm"
              label={formatMessage(localMessages.pLanguageSuggestion)}
            />
          </Col>
          <Col lg={6}>
            <MetadataPickerContainer
              autocomplete
              id={TAG_SET_COUNTRY_OF_FOCUS}
              name={'countryOfFocus'}
              form="advancedQueryForm"
              label={formatMessage(localMessages.pCountryOfFocusSuggestion)}
            />
          </Col>
          <Col lg={6}>
            <MetadataPickerContainer
              autocomplete
              id={TAG_SET_MEDIA_TYPE}
              showDescription
              name="mediaType"
              form="advancedQueryForm"
              label={formatMessage(localMessages.pMediaType)}
            />
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <AppButton
              style={{ marginTop: 30 }}
              label={formatMessage(localMessages.search)}
              onClick={this.handleSearchButtonClick}
              color="primary"
            />
          </Col>
        </Row>
      </FormSection>
    );
    return (
      <MediaPickerSearchForm
        initValues={{ storedKeyword: { mediaKeyword: initValues.mediaKeyword } }}
        onSearch={val => this.updateMediaQuery(val)}
        hintText={hintText}
      >
        {content}
      </MediaPickerSearchForm>
    );
  }
}

AdvancedMediaPickerSearchForm.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  // from form healper
  initValues: PropTypes.object,
  handleSubmit: PropTypes.func,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  renderTextField: PropTypes.func.isRequired,
  hintText: PropTypes.string,
  // from parent
  onSearch: PropTypes.func.isRequired,
  searchString: PropTypes.string,
};

const reduxFormConfig = {
  form: 'advanced-media-picker-search',
};

export default
  injectIntl(
    withIntlForm(
      reduxForm(reduxFormConfig)(
        AdvancedMediaPickerSearchForm
      )
    )
  );
