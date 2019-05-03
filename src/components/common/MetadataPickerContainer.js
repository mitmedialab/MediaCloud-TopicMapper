import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import { FETCH_SUCCEEDED } from '../../lib/fetchConstants';
import withAsyncData from './hocs/AsyncDataContainer';
import { fetchMetadataValuesForCountry, fetchMetadataValuesForState, fetchMetadataValuesForPrimaryLanguage,
  fetchMetadataValuesForCountryOfFocus, fetchMetadataValuesForMediaType, searchMetadataValues }
  from '../../actions/systemActions';
import withIntlForm from './hocs/IntlForm';
import { TAG_SET_PUBLICATION_COUNTRY, TAG_SET_PUBLICATION_STATE, TAG_SET_PRIMARY_LANGUAGE, TAG_SET_COUNTRY_OF_FOCUS, TAG_SET_MEDIA_TYPE } from '../../lib/tagUtil';

const MAX_SUGGESTIONS = 15;

const localMessages = {
  hintText: { id: 'metadata.pick.hint', defaultMessage: 'Pick a {label}' },
};

const MetadataPickerContainer = (props) => {
  const { initialValues, label, name, tags, onChange, handleLoadOptions, renderAsyncAutocomplete, renderAutocomplete,
    async, disabled } = props;
  const { formatMessage } = props.intl;
  let properties;
  // set up default
  let defaultValue;
  if (initialValues && initialValues.tags_id) {
    defaultValue = {
      ...initialValues,
      value: initialValues.tags_id,
    };
  }
  // manage async or not
  if (async) {
    properties = {
      component: renderAsyncAutocomplete,
      onLoadOptions: handleLoadOptions,
    };
  } else {
    properties = {
      component: renderAutocomplete,
      options: tags.map(t => ({ ...t, value: t.tags_id, label: t.label })),
    };
  }
  return (
    <div className={`metadata-picker metadata-picker-${name}`}>
      <React.Fragment>
        <label>{label}</label>
        <Field
          name={name}
          fullWidth
          isDisabled={disabled}
          defaultValue={defaultValue}
          isClearable
          placeholder={formatMessage(localMessages.hintText, { label })}
          onChange={onChange}
          {...properties}
        />
      </React.Fragment>
    </div>
  );
};

MetadataPickerContainer.propTypes = {
  // from parent
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  initialValues: PropTypes.object,
  disabled: PropTypes.bool,
  async: PropTypes.bool,
  onChange: PropTypes.func,
  // from compositional chain
  intl: PropTypes.object.isRequired,
  renderAutocomplete: PropTypes.func.isRequired,
  renderAsyncAutocomplete: PropTypes.func.isRequired,
  // from state
  fetchStatus: PropTypes.string,
  tags: PropTypes.array,
  label: PropTypes.string,
  // from dispatch
  handleLoadOptions: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  fetchStatus: state.system.metadata[ownProps.name].fetchStatus,
  label: state.system.metadata[ownProps.name].label,
  tags: state.system.metadata[ownProps.name].tags,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleLoadOptions: (searchString, callback) => {
    if (searchString && (searchString.length > 0)) {
      dispatch(searchMetadataValues(ownProps.id, { name: searchString }))
        .then((results) => {
          const options = results.map(t => ({ ...t, value: t.tags_id, label: t.label })).slice(0, MAX_SUGGESTIONS);
          callback(options);
        });
    }
  },
});

const fetchAsyncData = (dispatch, props) => {
  const alreadyLoadedTags = ((props.fetchStatus === FETCH_SUCCEEDED) && (props.tags.length > 0));
  if (!alreadyLoadedTags) {
    let fetcher;
    switch (props.id) {
      case TAG_SET_PUBLICATION_COUNTRY:
        fetcher = fetchMetadataValuesForCountry;
        break;
      case TAG_SET_PUBLICATION_STATE:
        fetcher = fetchMetadataValuesForState;
        break;
      case TAG_SET_PRIMARY_LANGUAGE:
        fetcher = fetchMetadataValuesForPrimaryLanguage;
        break;
      case TAG_SET_COUNTRY_OF_FOCUS:
        fetcher = fetchMetadataValuesForCountryOfFocus;
        break;
      case TAG_SET_MEDIA_TYPE:
        fetcher = fetchMetadataValuesForMediaType;
        break;
      default:
        break;
    }
    if (fetcher) {
      return dispatch(fetcher(props.id));
    }
  }
  return null;
};

export default
connect(mapStateToProps, mapDispatchToProps)(
  withIntlForm(
    withAsyncData(fetchAsyncData)(
      MetadataPickerContainer
    )
  )
);
