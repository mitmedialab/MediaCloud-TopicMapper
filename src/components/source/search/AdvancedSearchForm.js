import PropTypes from 'prop-types';
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import withIntlForm from '../../common/hocs/IntlForm';
import MetadataPickerContainer from '../../common/MetadataPickerContainer';
import AppButton from '../../common/AppButton';
import { TAG_SET_PUBLICATION_COUNTRY, TAG_SET_PUBLICATION_STATE, TAG_SET_PRIMARY_LANGUAGE, TAG_SET_COUNTRY_OF_FOCUS, TAG_SET_MEDIA_TYPE } from '../../../lib/tagUtil';

const localMessages = {
  searchSuggestion: { id: 'search.advanced.searchTip', defaultMessage: 'match these words' },
  pubCountrySuggestion: { id: 'search.advanced.pubCountryTip', defaultMessage: 'published in' },
  pubStateSuggestion: { id: 'search.advanced.pubStateTip', defaultMessage: 'state published in' },
  pLanguageSuggestion: { id: 'search.advanced.pLanguageTip', defaultMessage: 'primary language' },
  pCountryOfFocusSuggestion: { id: 'search.advanced.pCountryOfFocusTip', defaultMessage: 'country of focus' },
  pMediaType: { id: 'search.advanced.pMediaType', defaultMessage: 'media type' },
};
const AdvancedSearchForm = (props) => {
  const { initialValues, renderTextField, handleSubmit, buttonLabel, pristine, submitting, onSearch } = props;
  const { formatMessage } = props.intl;
  return (
    <form className="advanced-search-form" onSubmit={handleSubmit(onSearch.bind(this))}>
      <Row>
        <Col lg={10}>
          <Field
            name={'advancedSearchQueryString'}
            value={initialValues}
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
            type="submit"
            style={{ marginTop: 30 }}
            label={buttonLabel}
            disabled={pristine || submitting}
            primary
          />
        </Col>
      </Row>
    </form>
  );
};

AdvancedSearchForm.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  // from form healper
  initialValues: PropTypes.object,
  buttonLabel: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  renderTextField: PropTypes.func.isRequired,
  // from parent
  onSearch: PropTypes.func.isRequired,
  searchString: PropTypes.string,
};

const reduxFormConfig = {
  form: 'advancedQueryForm',
};

export default
  injectIntl(
    withIntlForm(
      reduxForm(reduxFormConfig)(
        AdvancedSearchForm
      )
    )
  );
