import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { selectMediaPickerQueryArgs, fetchMediaPickerSources } from '../../../../actions/systemActions';
import { FETCH_ONGOING } from '../../../../lib/fetchConstants';
import SourceResultsTable from './SourceResultsTable';
import AdvancedMediaPickerSearchForm from '../AdvancedMediaPickerSearchForm';
import LoadingSpinner from '../../LoadingSpinner';
import { notEmptyString } from '../../../../lib/formValidators';
import { ALL_MEDIA } from '../../../../lib/mediaUtil';

const localMessages = {
  title: { id: 'system.mediaPicker.sources.title', defaultMessage: 'Sources matching "{name}"' },
  hintText: { id: 'system.mediaPicker.sources.hint', defaultMessage: 'Search sources by name or url' },
  noResults: { id: 'system.mediaPicker.sources.noResults', defaultMessage: 'No results. Try searching for the name or URL of a specific source to see if we cover it, like Washington Post, Hindustan Times, or guardian.co.uk.' },
  showAdvancedOptions: { id: 'system.mediaPicker.sources.showAdvancedOptions', defaultMessage: 'Show Advanced Options' },
  hideAdvancedOptions: { id: 'system.mediaPicker.sources.hideAdvancedOptions', defaultMessage: 'Hide Advanced Options' },
  allMedia: { id: 'system.mediaPicker.sources.allMedia', defaultMessage: 'All Media (not advised)' },
};

const formSelector = formValueSelector('advanced-media-picker-search');

class SourceSearchResultsContainer extends React.Component {
  updateAndSearchWithSelection(values, search) {
    const { formQuery, mediaQuery, updateMediaQuerySelection, handleUpdateAndSearchWithSelection, selectedMediaQueryType } = this.props;
    const updatedQueryObj = Object.assign({}, values, { type: selectedMediaQueryType });

    const formValues = formQuery['advanced-media-picker-search'];
    const mediaValues = mediaQuery !== null && mediaQuery !== undefined ? mediaQuery : [];
    updatedQueryObj.tags = [];
    const metadataQueryFields = ['publicationCountry', 'publicationState', 'primaryLanguage', 'countryOfFocus'];

    metadataQueryFields.forEach((key) => {
      updatedQueryObj.tags[key] = [];
      if (formValues && key in formValues) {
        updatedQueryObj.tags[key].push(formValues[key]);
      }
    });
    // prepare media values with id so we treat all the data similarly
    updatedQueryObj.tags.mediaType = [];
    Object.keys(mediaValues).forEach((key) => {
      if (mediaValues[key] === true) {
        updatedQueryObj.tags.mediaType.push({ tags_id: key });
      }
    });

    if (typeof values === 'object' && 'allMedia' in values) {
      updatedQueryObj.tags.push(values.allMedia);
    }
    this.setState(updatedQueryObj);

    if (search) {
      handleUpdateAndSearchWithSelection(updatedQueryObj);
    } else {
      updateMediaQuerySelection(updatedQueryObj);
    }
  }

  render() {
    const { fetchStatus, selectedMediaQueryKeyword, sourceResults, onToggleSelected } = this.props;
    const { formatMessage } = this.props.intl;
    let content = null;
    let resultContent = null;
    content = (
      <div>
        <AdvancedMediaPickerSearchForm
          initValues={{ storedKeyword: { mediaKeyword: selectedMediaQueryKeyword } }}
          onMetadataSelection={val => this.updateAndSearchWithSelection(val)}
          onSearch={val => this.updateAndSearchWithSelection(val, true)}
          hintText={formatMessage(localMessages.hintText)}
        />
      </div>
    );

    if (fetchStatus === FETCH_ONGOING) {
      resultContent = <LoadingSpinner />;
    } else if (sourceResults && (sourceResults.list && (sourceResults.list.length > 0 || (sourceResults.args && sourceResults.args.media_keyword)))) {
      resultContent = (
        <SourceResultsTable
          title={formatMessage(localMessages.title, { name: selectedMediaQueryKeyword })}
          sources={sourceResults.list}
          onToggleSelected={onToggleSelected}
        />
      );
    } else {
      resultContent = <FormattedMessage {...localMessages.noResults} />;
    }
    return (
      <div>
        {content}
        {resultContent}
      </div>
    );
  }
}

SourceSearchResultsContainer.propTypes = {
  intl: PropTypes.object.isRequired,
  // from parent
  onToggleSelected: PropTypes.func.isRequired,
  // from state
  fetchStatus: PropTypes.string,
  selectedMediaQueryType: PropTypes.number,
  selectedMediaQueryKeyword: PropTypes.string,
  sourceResults: PropTypes.object,
  formQuery: PropTypes.object,
  mediaQuery: PropTypes.array,
  selectedMetadata: PropTypes.object,
  // from dispatch
  updateMediaQuerySelection: PropTypes.func.isRequired,
  // updateAdvancedMediaQuerySelection: PropTypes.func.isRequired,
  handleUpdateAndSearchWithSelection: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.system.mediaPicker.sourceQueryResults.fetchStatus,
  selectedMediaQueryType: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.type : 0,
  selectedMediaQueryKeyword: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.mediaKeyword : null,
  sourceResults: state.system.mediaPicker.sourceQueryResults,
  formQuery: formSelector(
    state,
    'advanced-media-picker-search.publicationCountry',
    'advanced-media-picker-search.publicationState',
    'advanced-media-picker-search.primaryLanguage',
    'advanced-media-picker-search.countryOfFocus',
    'advanced-media-picker-search.mediaType',
    'advanced-media-picker-search.allMedia',
  ),
  mediaQuery: formSelector(
    state,
    'advanced-media-picker-search.mediaType',
  ),
  selectedMetadata: state.system.metadata.selected,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  /* updateMediaQuerySelection: (values) => {
    if (values && notEmptyString(values.mediaKeyword)) {
      dispatch(selectMediaPickerQueryArgs(values));
      dispatch(fetchMediaPickerSources({ media_keyword: values.mediaKeyword }));
    }
  }, */
  updateMediaQuerySelection: (values) => {
    if (values && (notEmptyString(values.mediaKeyword) || (values.tags && values.tags.length > 0))) {
      if (values.allMedia) { // handle the "all media" placeholder selection
        ownProps.onToggleSelected({ id: ALL_MEDIA, label: ownProps.intl.formatMessage(localMessages.allMedia) });
      } else {
        dispatch(selectMediaPickerQueryArgs(values));
        // dispatch(selectMetadata(values));
      }
    }
  },
  handleUpdateAndSearchWithSelection: (values) => {
    if (values.mediaKeyword || values.tags) {
      if (values.allMedia) { // handle the "all media" placeholder selection
        ownProps.onToggleSelected({ id: ALL_MEDIA, label: ownProps.intl.formatMessage(localMessages.allMedia) });
      } else {
        dispatch(selectMediaPickerQueryArgs(values));
        const tags = Object.values(values.tags).filter(t => t.length > 0).reduce((a, b) => a.concat(b), []).map(i => i.tags_id)
          .join(',');
        dispatch(fetchMediaPickerSources({ media_keyword: values.mediaKeyword || '*', tags }));
      }
    }
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    SourceSearchResultsContainer
  )
);
