import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, FieldArray, Field, propTypes } from 'redux-form';
import { injectIntl } from 'react-intl';
import withIntlForm from './hocs/IntlForm';
import withAsyncData from './hocs/AsyncDataContainer';
import { fetchMetadataValuesForMediaType } from '../../actions/systemActions';
import { TAG_SET_MEDIA_TYPE } from '../../lib/tagUtil';
import messages from '../../resources/messages';

const MediaTypesSelector = ({ renderCheckbox, intl: { formatMessage }, fields }) => (
  <ul>
    {fields.map((f, index) => (
      <li key={index}>
        <Field
          key={index}
          name={`${f}.label`}
          component={renderCheckbox}
          label={f}
          placeholder={formatMessage(messages.ok)}
        />
      </li>
    ))}
  </ul>
);

MediaTypesSelector.propTypes = {
  fields: PropTypes.object,
  renderCheckbox: PropTypes.func.isRequired,
  intl: PropTypes.object,
};

const MediaTypesList = injectIntl(withIntlForm(MediaTypesSelector));

const MediaTypesFieldArray = () => (
  <div className="explorer-media-picker-media-types">
    <FieldArray
      name="mediaType"
      component={MediaTypesList}
    />
  </div>
);

MediaTypesFieldArray.propTypes = {
  // from parent
  intl: PropTypes.object.isRequired,
  tags: PropTypes.array,
  name: PropTypes.string,
};

const mapStateToProps = state => ({
  fetchStatus: state.system.metadata.mediaType.fetchStatus,
  // mediaType: state.system.metadata.mediaType.tags.length ? state.system.metadata.mediaType.tags : null,
  initialValues: { mediaType: state.system.metadata.mediaType.tags },
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
