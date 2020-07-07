import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, FieldArray, Field, propTypes } from 'redux-form';
import { injectIntl } from 'react-intl';
import withIntlForm from './hocs/IntlForm';
import withAsyncData from './hocs/AsyncDataContainer';
import DataCard from './DataCard';
import { fetchMetadataValuesForMediaType } from '../../actions/systemActions';
import { TAG_SET_MEDIA_TYPE } from '../../lib/tagUtil';
import messages from '../../resources/messages';

const localMessages = {
  label: { id: 'system.mediaPicker.sources.label', defaultMessage: '{label}' },
};

const MediaTypesSelector = ({ initialValues, renderCheckbox, onChange, intl: { formatMessage }, fields }) => {
  // on the first time in, the fields don't properly load the initial Values. hence, hack to do so we don't end up with an empty display first time round
  const initArray = fields.length ? fields : initialValues.mediaType;
  return (
    <ul>
      {initArray.map((name, index, thisFieldArray) => { // redux-form overrides map, and converts name to a string instead of an object!
        const fieldObject = typeof thisFieldArray.get === 'function' ? thisFieldArray.get(index) : name;
        return (
          <li key={index}>
            <Field
              initialValues={initialValues}
              key={index}
              name={`${name}.label`}
              component={info => (
                <div>
                  {renderCheckbox({
                    ...info,
                    label: formatMessage(localMessages.label, { label: fieldObject.label, tagSetName: fieldObject.name }),
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
            <small>{fieldObject.description}</small>
          </li>
        );
      })}
    </ul>
  );
};

MediaTypesSelector.propTypes = {
  fields: PropTypes.object,
  initialValues: PropTypes.object,
  renderCheckbox: PropTypes.func.isRequired,
  intl: PropTypes.object,
  onChange: PropTypes.func,
};

const MediaTypesList = injectIntl(withIntlForm(MediaTypesSelector));

const MediaTypesFieldArray = (props) => {
  if (props.initialValues) {
    const metaAndSelected = { ...props.initialValues };
    if (props.previouslySelected && props.previouslySelected.mediaType) {
      props.previouslySelected.mediaType.forEach((p) => {
        const toUpdate = metaAndSelected.mediaType.findIndex(t => t.tags_id === p.tags_id);
        if (toUpdate > -1) {
          metaAndSelected.mediaType[toUpdate].selected = p.value;
          metaAndSelected.mediaType[toUpdate].value = p.value;
        }
      });
    }
    return (
      <DataCard className="media-picker-filter-options media-picker-media-types">
        <FieldArray
          name="mediaType"
          component={MediaTypesList}
          initialValues={metaAndSelected}
          onChange={props.onChange}
        />
      </DataCard>
    );
  }
  return <br />;
};

MediaTypesFieldArray.propTypes = {
  // from parent
  intl: PropTypes.object.isRequired,
  tags: PropTypes.array,
  name: PropTypes.string,
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

const mapStateToProps = state => ({
  fetchStatus: state.system.metadata.mediaType.fetchStatus,
  initialValues: { mediaType: state.system.metadata.mediaType.tags.length ? state.system.metadata.mediaType.tags : null },
  // initialValues: { mediaType: state.system.metadata.mediaType.tags },
});

const fetchAsyncData = dispatch => dispatch(fetchMetadataValuesForMediaType(TAG_SET_MEDIA_TYPE));


export default
injectIntl(
  connect(mapStateToProps)(
    withAsyncData(fetchAsyncData)(
      withIntlForm(
        reduxForm({ propTypes })(
          MediaTypesFieldArray
        )
      )
    )
  )
);
