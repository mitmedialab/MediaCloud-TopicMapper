import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, FieldArray, Field, propTypes } from 'redux-form';
import { injectIntl } from 'react-intl';
import { FETCH_SUCCEEDED } from '../../lib/fetchConstants';
import withIntlForm from './hocs/IntlForm';
import withAsyncData from './hocs/AsyncDataContainer';
import { fetchMetadataValuesForCountry, fetchMetadataValuesForState, fetchMetadataValuesForPrimaryLanguage, fetchMetadataValuesForCountryOfFocus } from '../../actions/systemActions';
import { TAG_SET_PUBLICATION_COUNTRY, TAG_SET_PUBLICATION_STATE, TAG_SET_PRIMARY_LANGUAGE, TAG_SET_COUNTRY_OF_FOCUS } from '../../lib/tagUtil';
import messages from '../../resources/messages';

const localMessages = {
  label: { id: 'system.mediaPicker.sources.label', defaultMessage: '{label}' },
};

const MetadataCheckboxSelector = ({ filter, initialValues, renderCheckbox, onChange, intl: { formatMessage }, fields }) => (
  <ul>
    {fields.map((name, index, thisFieldArray) => { // redux-form overrides map, and converts name to a string instead of an object!
      const fieldObject = thisFieldArray.get(index);
      const content = (
        <li key={index}>
          <Field
            initialValues={initialValues}
            key={index}
            name={`${name}.label`}
            component={info => (
              <div>
                {renderCheckbox({
                  ...info,
                  label: formatMessage(localMessages.label, { label: fieldObject.label }),
                  input: {
                    ...info.input,
                    ...fieldObject,
                    value: fieldObject.selected,
                    onChange: newValue => onChange({ ...info.input, ...fieldObject, value: newValue }),
                  },
                })}
              </div>
            )}
            label={`${name}.label`}
            placeholder={formatMessage(messages.ok)}
          />
        </li>
      );
      if (filter === 'selected' && fieldObject.selected && fieldObject.description) {
        // render selected items that were *not* part of the frequently used suggestions
        return content;
      }
      if (filter === 'defaults' && fieldObject.description === undefined) {
        // render the frequently used suggestions (regardless of if they are selected or not)
        return content;
      }
      return null;
    })}
  </ul>
);

MetadataCheckboxSelector.propTypes = {
  fields: PropTypes.object,
  initialValues: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),
  renderCheckbox: PropTypes.func.isRequired,
  intl: PropTypes.object,
  onChange: PropTypes.func,
  filter: PropTypes.string.isRequired,
};

const MetadataCheckboxList = injectIntl(withIntlForm(MetadataCheckboxSelector));

const MetadataCheckboxFieldArray = (props) => {
  const metaAndSelected = { ...props.initialValues };
  if (props.previouslySelected && props.previouslySelected[props.type]) {
    props.previouslySelected[props.type].forEach((p) => {
      const toUpdate = metaAndSelected.shortList.findIndex(t => t.tags_id === p.tags_id);
      if (toUpdate > -1) {
        metaAndSelected.shortList[toUpdate].selected = p.value !== false && p.value !== undefined;
        metaAndSelected.shortList[toUpdate].value = p.value !== false && p.value !== undefined;
      } else {
        metaAndSelected.shortList.push(p); // from autocomplete selections
      }
    });
  }
  // We can't figure out how to get it to render two separate field array lists here, so we are using the
  // `filter` property as a hack to tell it which subset of the elemnts to render
  return (
    <div>
      <FieldArray
        name="shortList"
        component={MetadataCheckboxList}
        initialValues={{ shortList: metaAndSelected.shortList }}
        onChange={props.onChange}
        props={{ filter: 'selected' }}
      />
      <h5>{props.intl.formatMessage(messages.frequentlyUsed)}</h5>
      <FieldArray
        name="shortList"
        component={MetadataCheckboxList}
        initialValues={{ shortList: metaAndSelected.shortList }}
        onChange={props.onChange}
        props={{ filter: 'defaults' }}
      />
    </div>
  );
};

MetadataCheckboxFieldArray.propTypes = {
  // from parent
  intl: PropTypes.object.isRequired,
  type: PropTypes.string,
  initialValues: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),
  previouslySelected: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),
  onChange: PropTypes.func,
};

const mapStateToProps = (state, ownProps) => ({
  fetchStatus: state.system.metadata[ownProps.type].fetchStatus,
  label: state.system.metadata[ownProps.type].label,
  initialValues: { shortList: state.system.metadata[ownProps.type].shortList },
});

const fetchAsyncData = (dispatch, props) => {
  const alreadyLoadedTags = ((props.fetchStatus === FETCH_SUCCEEDED) && (props.initialValues.shortList.length > 0));
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
      // case TAG_SET_MEDIA_TYPE:
        // fetcher = fetchMetadataValuesForMediaType;
        // break;
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
injectIntl(
  connect(mapStateToProps)(
    withAsyncData(fetchAsyncData)(
      withIntlForm(
        reduxForm({ propTypes })(
          MetadataCheckboxFieldArray
        )
      )
    )
  )
);
