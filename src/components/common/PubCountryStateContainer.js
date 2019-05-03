import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import { injectIntl } from 'react-intl';
import withIntlForm from './hocs/IntlForm';
import withAsyncData from './hocs/AsyncDataContainer';
import { fetchMetadataValuesForMediaType } from '../../actions/systemActions';
import { TAG_SET_MEDIA_TYPE } from '../../lib/tagUtil';

const MediaTypesFieldArray = (props) => {
  const { types, renderCheckbox } = props;
  return (
    <ul>
      {types.map((t, idx) => (
        <li key={idx}>
          <Field
            component={renderCheckbox}
            name={`mediaType.${t.tags_id}`} // prefacing the name with the type for form
            label={t.label}
          />
        </li>
      ))}
    </ul>
  );
};

MediaTypesFieldArray.propTypes = {
  types: PropTypes.array,
  // form context
  intl: PropTypes.object.isRequired,
  renderCheckbox: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.system.metadata.mediaType.fetchStatus,
  types: state.system.metadata.mediaType.tags.length ? state.system.metadata.mediaType.tags : null,
});

const fetchAsyncData = dispatch => dispatch(fetchMetadataValuesForMediaType(TAG_SET_MEDIA_TYPE));

export default
injectIntl(
  connect(mapStateToProps)(
    withAsyncData(fetchAsyncData)(
      withIntlForm(
        MediaTypesFieldArray
      )
    )
  )
);
