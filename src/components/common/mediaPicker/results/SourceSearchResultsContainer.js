import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { formValueSelector } from 'redux-form';
import { Row, Col } from 'react-flexbox-grid/lib';
import { selectMediaPickerQueryArgs, fetchMediaPickerSources, selectMediaCustomColl, resetMediaPickerSources } from '../../../../actions/systemActions';
import { FETCH_ONGOING } from '../../../../lib/fetchConstants';
import withHelp from '../../hocs/HelpfulContainer';
import SourceResultsTable from './SourceResultsTable';
import AdvancedMediaPickerSearchForm from '../AdvancedMediaPickerSearchForm';
import LoadingSpinner from '../../LoadingSpinner';
import AppButton from '../../AppButton';
import { PUBLICATION_COUNTRY, PUBLICATION_STATE, COUNTRY_OF_FOCUS, PRIMARY_LANGUAGE, MEDIA_TYPE } from '../../../../lib/tagUtil';
import { metadataQueryFields, stringifyTags } from '../../../../lib/explorerUtil';
import { notEmptyString } from '../../../../lib/formValidators';
import { decodeQueryParamString } from '../../../../lib/mediaUtil';
import messages from '../../../../resources/messages';

const localMessages = {
  prefixTitle: { id: 'system.mediaPicker.sources.prefixTitle', defaultMessage: '{numResults} Sources matching ' },
  ktTitle: { id: 'system.mediaPicker.sources.combinedKeywordAndTags', defaultMessage: '"{keyword}" and {tags}' },
  hintText: { id: 'system.mediaPicker.sources.hint', defaultMessage: 'Search sources by name or url' },
  noResults: { id: 'system.mediaPicker.sources.noResults', defaultMessage: 'No results. Try searching for the name or URL of a specific source to see if we cover it, like Washington Post, Hindustan Times, or guardian.co.uk.' },
  showAdvancedOptions: { id: 'system.mediaPicker.sources.showAdvancedOptions', defaultMessage: 'Show Advanced Options' },
  hideAdvancedOptions: { id: 'system.mediaPicker.sources.hideAdvancedOptions', defaultMessage: 'Hide Advanced Options' },
  allMedia: { id: 'system.mediaPicker.sources.allMedia', defaultMessage: 'All Media (not advised)' },
  customColl: { id: 'system.mediaPicker.sources.customColl', defaultMessage: 'Add As Custom Collection' },
  customCollTitle: { id: 'system.mediaPicker.sources.customCollTitle', defaultMessage: 'Add As Custom Collection' },
  customCollDef: { id: 'system.mediaPicker.sources.customCollDef', defaultMessage: 'Click this button to store your custom search as your own collection of sources that match the selected metadata query above.' },
};

const formSelector = formValueSelector('advanced-media-picker-search');

class SourceSearchResultsContainer extends React.Component {
  componentDidMount() {
    /* if we are viewOnly, (eg non-modal use for Source Manager)
     we may have urlParameters to ingest. In particular, a search parameter
     or tags from a custom collection reference coming from Explorer or Topic Mapper
    */
    const { viewOnly, updateMediaQuerySelection, location, selectedMediaQueryKeyword, selectedMediaQueryTags,
      selectedMediaQueryAllTags, selectedMediaQueryType, mediaMetadataSetsByName } = this.props;

    const lookupReadableMetadataName = (tagSetsId) => {
      switch (tagSetsId) {
        case mediaMetadataSetsByName.mediaPubCountrySet:
          return PUBLICATION_COUNTRY;
        case mediaMetadataSetsByName.mediaPubStateSet:
          return PUBLICATION_STATE;
        case mediaMetadataSetsByName.mediaPrimaryLanguageSet:
          return PRIMARY_LANGUAGE;
        case mediaMetadataSetsByName.mediaSubjectCountrySet:
          return COUNTRY_OF_FOCUS;
        case mediaMetadataSetsByName.mediaTypeSet:
          return MEDIA_TYPE;
        default:
          return null;
      }
    };

    if (viewOnly && location && location.query) {
      const urlParams = decodeQueryParamString(location, lookupReadableMetadataName);

      // we must provide all parameters when updating state
      // minimally, the type which selects the tabular setting
      updateMediaQuerySelection({
        type: selectedMediaQueryType,
        mediaKeyword: selectedMediaQueryKeyword,
        advancedSearchQueryString: selectedMediaQueryKeyword,
        tags: selectedMediaQueryTags,
        allMedia: selectedMediaQueryAllTags,
        ...urlParams,
      });
    }
  }

  processQuery = (values) => {
    const { formQuery, selectedMediaQueryType, selectedMediaQueryKeyword, selectedMediaQueryTags, selectedMediaQueryAllTags } = this.props;
    // essentially reselect all values that are currently selected, plus the newly clicked/entered ones
    // any updates to MediaQuery need to be in the right form { type, tags, allMedia || customColl || null }
    //  initialize with previously selected query args
    const updatedQueryObj = {
      mediaKeyword: selectedMediaQueryKeyword,
      type: selectedMediaQueryType,
      tags: selectedMediaQueryTags,
      allMedia: selectedMediaQueryAllTags,
    };

    if (updatedQueryObj.tags === undefined) {
      updatedQueryObj.tags = []; // if first metadata selection
    }

    // ignore/remove any non metadata args (like search etc)
    metadataQueryFields.forEach((key) => {
      if (updatedQueryObj.tags[key] === undefined) {
        updatedQueryObj.tags[key] = [];
      }
      // update tags with information we need to keep in query args
      Object.values(values).forEach((obj) => {
        if (obj !== undefined && obj !== null
          && obj.name
          && obj.name === key) {
          const modifiedObjIndex = updatedQueryObj.tags[key].findIndex(o => obj.tags_id === o.tags_id);
          if (modifiedObjIndex > -1) {
            updatedQueryObj.tags[key][modifiedObjIndex].value = obj.value; // update
            updatedQueryObj.tags[key][modifiedObjIndex].selected = obj.value; // update
            updatedQueryObj.tags[key][modifiedObjIndex].tag_sets_id = obj.tag_sets_id;
            updatedQueryObj.tags[key][modifiedObjIndex].tag_set_label = obj.tag_set_label;
          } else if (obj.tags_id) {
            const updatedWithSelection = obj;
            if (updatedWithSelection.value !== false && updatedWithSelection.value !== undefined) { // user has selected a new entry and we set the selected flag acc to the value
              updatedWithSelection.selected = true;
            }
            updatedQueryObj.tags[key].tag_sets_id = obj.tag_sets_id;
            updatedQueryObj.tags[key].tag_set_label = obj.tag_set_label;
            updatedQueryObj.tags[key].push(updatedWithSelection); // or insert ? Or do in reducer?
          }
        }
      });
    });


    if (typeof values === 'object' && 'allMedia' in values) {
      updatedQueryObj.allMedia = values.allMedia;
    } else if (typeof values === 'object' && 'customColl' in values) {
      updatedQueryObj.tags.name = 'search';
      updatedQueryObj.tags.label = 'search';
      updatedQueryObj.customColl = values.customColl;
      updatedQueryObj.id = Math.random(0, 100000);
    }
    updatedQueryObj.mediaKeyword = formQuery.advancedSearchQueryString;
    return updatedQueryObj;
  }

  updateQuerySelection = (metadataType, values) => {
    // triggered when a singular metadata is un/checked
    const { updateMediaQuerySelection } = this.props;
    const updatedQueryObj = this.processQuery([values]);

    updateMediaQuerySelection(updatedQueryObj);
  }

  addCustomSelection = (values) => {
    const { handleSelectMediaCustomColl } = this.props;
    // get current selected tags and current selected media
    const updatedQueryObj = this.processQuery(values);
    // remove unselected metadata tags
    handleSelectMediaCustomColl(updatedQueryObj);
  }

  updateAndSearchWithSelection = (values) => {
    const { clearPreviousSources, handleUpdateAndSearchWithSelection } = this.props;
    const updatedQueryObj = this.processQuery(values);
    clearPreviousSources(); // do this here and not for paging
    handleUpdateAndSearchWithSelection(updatedQueryObj);
  }

  updateAndSearchWithPaging = (values) => {
    const { pageThroughSources } = this.props;
    const updatedQueryObj = this.processQuery(values);
    pageThroughSources(updatedQueryObj); // mergeProps for paging
  }

  render() {
    const { fetchStatus, selectedMediaQueryKeyword, sourceResults, onToggleSelected, selectedMediaQueryTags,
      selectedMediaQueryAllTags, helpButton, viewOnly, links, mediaMetadataSetsByName } = this.props;
    const { formatMessage } = this.props.intl;

    const content = (
      <div>
        <AdvancedMediaPickerSearchForm
          initialValues={{ mediaKeyword: selectedMediaQueryKeyword, advancedSearchQueryString: selectedMediaQueryKeyword, tags: selectedMediaQueryTags, allMedia: selectedMediaQueryAllTags }}
          onQueryUpdateSelection={(metadataType, values) => this.updateQuerySelection(metadataType, values)}
          onSearch={val => this.updateAndSearchWithSelection(val)}
          hintText={formatMessage(localMessages.hintText)}
          mediaMetadataSetsByName={mediaMetadataSetsByName}
        />
      </div>
    );
    const addCustomButton = (
      <Col lg={12}>
        { helpButton }
        <AppButton
          style={{ float: 'right' }}
          label={formatMessage(localMessages.customColl)}
          onClick={() => this.addCustomSelection({ customColl: true })}
          color="primary"
          disabled={!selectedMediaQueryTags
            || Object.values(selectedMediaQueryTags)
              .filter((t) => t.length > 0 && t !== 'search') // values greater than 0
              .map((p,) => p.filter((e) => e.selected).length) // for each element eg "US" in metadata category array
              .filter((e) => e > 0).length < 1
            || sourceResults === undefined
            || sourceResults.list.length === 0}
        />
      </Col>
    );

    let resultContent;
    let getMoreResultsContent;
    if (fetchStatus === FETCH_ONGOING) {
      resultContent = <LoadingSpinner />;
    } else if (sourceResults && (sourceResults.list && (sourceResults.list.length > 0 || (sourceResults.args && sourceResults.args.media_keyword) || (sourceResults.args && sourceResults.args.tags)))) {
      const previouslySearchedTags = {};
      const tagNames = Object.keys(selectedMediaQueryTags)
        .filter(t => metadataQueryFields.has(t) > 0 && Array.isArray(selectedMediaQueryTags[t]) && selectedMediaQueryTags[t].length > 0)
        .map((i) => {
          const tag = selectedMediaQueryTags[i];
          if (sourceResults.args.tags) { // correlate searched tag ids with objects so we can display the labels
            if (!previouslySearchedTags[i]) {
              previouslySearchedTags[i] = [];
            }
            previouslySearchedTags[i] = tag
              .filter(t => sourceResults.args.tags.indexOf(t.tags_id) > -1)
              .map(t => (
                // if in tags, it is selected, so reflect this
                { ...t, selected: true }
              ));
          }
          return tag.map(a => a.tag_set_name).reduce(l => l);
        });
      let stringifiedTags = '';
      if (tagNames.length > 0) {
        stringifiedTags = stringifyTags(previouslySearchedTags, formatMessage);
      }
      const prefixTitle = <FormattedHTMLMessage {...localMessages.prefixTitle} values={{ numResults: sourceResults.list.length }} />;
      const hasMediaQueryKeywords = notEmptyString(selectedMediaQueryKeyword);
      let conditionalTitle = '';
      if (hasMediaQueryKeywords && stringifiedTags) {
        conditionalTitle = <FormattedHTMLMessage {...localMessages.ktTitle} values={{ keyword: selectedMediaQueryKeyword, tags: stringifiedTags }} />;
      } else {
        conditionalTitle = hasMediaQueryKeywords ? selectedMediaQueryKeyword : stringifiedTags;
      }

      getMoreResultsContent = (
        <Row>
          <Col lg={12}>
            <AppButton
              className="select-media-button"
              label={formatMessage(messages.getMoreResults)}
              onClick={val => this.updateAndSearchWithPaging(val)}
              type="submit"
              disabled={links.next <= 0}
            />
          </Col>
        </Row>
      );

      resultContent = (
        <div className="media-picker-search-results">
          <h2><span className="source-search-keys">{prefixTitle}</span>{ conditionalTitle }</h2>
          { !viewOnly && addCustomButton }
          { getMoreResultsContent }
          <SourceResultsTable
            sources={sourceResults.list}
            onToggleSelected={onToggleSelected}
            viewOnly={viewOnly}
          />
        </div>
      );
    } else {
      resultContent = <FormattedMessage {...localMessages.noResults} />;
    }
    return (
      <div>
        {content}
        {resultContent}
        { getMoreResultsContent }
      </div>
    );
  }
}

SourceSearchResultsContainer.propTypes = {
  intl: PropTypes.object.isRequired,
  params: PropTypes.object, // params from router
  location: PropTypes.object,
  // from parent
  onToggleSelected: PropTypes.func.isRequired,
  handleMediaConcurrency: PropTypes.func.isRequired,
  updateMediaQuerySelection: PropTypes.func.isRequired,
  // from state
  fetchStatus: PropTypes.string,
  selectedMedia: PropTypes.array,
  selectedMediaQueryType: PropTypes.number,
  selectedMediaQueryKeyword: PropTypes.string,
  selectedMediaQueryTags: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),
  selectedMediaQueryAllTags: PropTypes.bool,
  sourceResults: PropTypes.object,
  formQuery: PropTypes.object,
  mediaQuery: PropTypes.array,
  helpButton: PropTypes.node.isRequired,
  links: PropTypes.object,
  mediaMetadataSetsByName: PropTypes.object.isRequired,
  // from dispatch
  handleUpdateAndSearchWithSelection: PropTypes.func.isRequired,
  handleSelectMediaCustomColl: PropTypes.func.isRequired,
  clearPreviousSources: PropTypes.func.isRequired,
  viewOnly: PropTypes.bool,
  pageThroughSources: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.system.mediaPicker.sourceQueryResults.fetchStatus,
  selectedMedia: state.system.mediaPicker.selectMedia.list,
  selectedMediaQueryType: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.type : 0,
  selectedMediaQueryKeyword: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.mediaKeyword : null,
  selectedMediaQueryTags: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.tags : null,
  selectedMediaQueryAllTags: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.allMedia : null,
  sourceResults: state.system.mediaPicker.sourceQueryResults,
  formQuery: formSelector(
    state,
    'publicationCountry',
    'publicationState',
    'primaryLanguage',
    'countryOfFocus',
    'mediaType',
    'allMedia',
    'advancedSearchQueryString',
  ),
  links: state.system.mediaPicker.sourceQueryResults.linkId,
  mediaMetadataSetsByName: state.system.staticTags.tagSets.mediaMetadataSetsByName,
});

// tags holds metadata search tags
const mapDispatchToProps = (dispatch, ownProps) => ({
  updateMediaQuerySelection: (values) => {
    if (values && values.tags) {
      dispatch(resetMediaPickerSources()); // clear prev results
      if (values.allMedia) { // handle the "all media" placeholder selection
        ownProps.updateMediaQuerySelection({ media_keyword: values.mediaKeyword || '*', type: values.type, allMedia: true });
      } else {
        dispatch(selectMediaPickerQueryArgs({ media_keyword: values.mediaKeyword || '*', type: values.type, tags: { ...values.tags }, allMedia: false }));
      }
    }
  },
  clearPreviousSources: () => dispatch(resetMediaPickerSources()), // clear prev results

  handleUpdateAndSearchWithSelection: (values) => {
    if (values.mediaKeyword || values.tags) {
      let tags = null;
      if (!values.allMedia) { // handle the "all media" placeholder selection
        dispatch(selectMediaPickerQueryArgs(values));
        tags = Object.values(values.tags).filter(t => t.length > 0);
        const selectedTags = [];
        // parsing and/or in backend
        tags.forEach((t) => {
          if (Array.isArray(t)) {
            selectedTags.push(t.filter(m => m.value).reduce((a, b) => a.concat(b), []).map(i => i.tags_id));
          }
        });
        tags = selectedTags.filter(t => t.length > 0).join(',');
      }
      dispatch(fetchMediaPickerSources({ media_keyword: values.mediaKeyword || '*', tags: (values.allMedia ? -1 : tags), type: values.type, linkId: values.linkId }));
    }
  },
  handleSelectMediaCustomColl: (values) => {
    dispatch(selectMediaCustomColl(values));
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return { ...stateProps,
    ...dispatchProps,
    ...ownProps,
    pageThroughSources: (values) => {
      if (stateProps.links !== undefined) {
        dispatchProps.handleUpdateAndSearchWithSelection({ ...values, linkId: stateProps.links.next });
      } else {
        dispatchProps.handleUpdateAndSearchWithSelection({ ...values, linkId: 0 });
      }
    },
  };
}

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps, mergeProps)(
    withHelp(localMessages.customCollTitle, localMessages.customCollDef)(
      withRouter(SourceSearchResultsContainer)
    )
  )
);
