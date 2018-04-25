import PropTypes from 'prop-types';
import React from 'react';
import Link from 'react-router/lib/Link';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';
import { SelectField, Checkbox, MenuItem } from 'material-ui';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import AppButton from '../../common/AppButton';
import { ExploreButton } from '../../common/IconButton';
import messages from '../../../resources/messages';
import FilledStarIcon from '../../common/icons/FilledStarIcon';
import { ADD_ALL_THIS_PAGE, REMOVE_ALL, ADD_ALL_PAGES } from './AdvancedSearchResultsContainer';
import { slugifyLocalCollectionPath, slugifyLocalSourcePath } from '../../../lib/urlUtil';

const localMessages = {
  title: { id: 'sourceCollectionList.title', defaultMessage: 'Search Results' },
  sourceHeader: { id: 'sourceCollectionList.source', defaultMessage: 'Source: {name}' },
  collectionHeader: { id: 'sourceCollectionList.collection', defaultMessage: 'Collection: {name} <small>({tagSetName})<small>' },
  checkAllFirstPage: { id: 'sourceCollectionList.checkAllFirstPage', defaultMessage: 'Select All On This Page' },
  unCheckAll: { id: 'sourceCollectionList.collection.unCheckAll', defaultMessage: 'Unselect All' },
  checkAllPages: { id: 'sourceCollectionList.checkAllPages', defaultMessage: 'Select All Results' },
  exploreSourceInvite: { id: 'sourceCollectionList.exploreSource', defaultMessage: 'Explore this Source' },
  exploreCollectionInvite: { id: 'sourceCollectionList.exploreCollection', defaultMessage: 'Explore this Collection' },
  addToCollection: { id: 'sources.sourceCollectionList.addToCollection', defaultMessage: 'Add Selected Items To Collection' },
};

const AdvancedSearchResults = (props) => {
  const { queriedSources, queriedCollections, addOrRemoveToSelectedSources,
    addOrRemoveToSelectedCollections, addRemoveAll, onAddToCollection } = props;
  const { formatMessage } = props.intl;
  const content = null;
  if (queriedSources === undefined || queriedCollections === undefined) {
    return (
      <div>
        { content }
      </div>
    );
  }
  return (
    <div className="search-results">
      <Grid>
        <Row>
          <Col lg={12}>
            <h2><FormattedMessage {...localMessages.title} /></h2>
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            <div className="search-results-controls">
              <SelectField name="allOrNone" style={{ fontSize: 13 }}>
                <MenuItem
                  name="chkSelectAllFirstPage"
                  onClick={(...args) => addRemoveAll(ADD_ALL_THIS_PAGE, args[1])}
                  primaryText={formatMessage(localMessages.checkAllFirstPage)}
                  style={{ fontSize: 13 }}
                />
                <MenuItem
                  primaryText={formatMessage(localMessages.unCheckAll)}
                  onClick={(...args) => addRemoveAll(REMOVE_ALL, args[1])}
                  style={{ fontSize: 13 }}
                />
                <MenuItem
                  name="chkSelectAllPages"
                  onClick={(...args) => addRemoveAll(ADD_ALL_PAGES, args[1])}
                  primaryText={formatMessage(localMessages.checkAllPages)}
                  style={{ fontSize: 13 }}
                />
              </SelectField>
            </div>
          </Col>
          <Col lg={6}>
            <div className="search-results-actions">
              <AppButton
                style={{ marginTop: 30 }}
                type="submit"
                label={formatMessage(localMessages.addToCollection)}
                primary
                onClick={onAddToCollection}
              />
            </div>
          </Col>
        </Row>
        <div className="search-results-list">
          <Row>
            {queriedCollections.map(collection => (
              <Col lg={12} key={`clxn_${collection.tags_id}`} >
                <div className={`search-result search-result-collection ${collection.selected ? 'search-result-selected' : ''}`} name={`src_${collection.tags_id}`}>
                  <div className="search-result-checkbox">
                    <Checkbox
                      checked={collection.selected}
                      key={collection.tags_id}
                      name={`clxn_${collection.tags_id}`}
                      onCheck={(...args) => addOrRemoveToSelectedCollections(collection.tags_id, args[1])}
                    />
                  </div>
                  <div className="search-result-actions">
                    <Link to={slugifyLocalCollectionPath(collection)}>
                      <FormattedMessage {...localMessages.exploreCollectionInvite} />
                    </Link>
                    &nbsp;
                    <ExploreButton linkTo={slugifyLocalCollectionPath(collection)} />
                  </div>
                  <div className="search-result-content">
                    <h2>
                      <FormattedHTMLMessage {...localMessages.collectionHeader} values={{ name: collection.label, tagSetName: collection.tag_set_label }} />
                    </h2>
                    { collection.isFavorite ? <FilledStarIcon /> : '' }
                    <p><span className="search-result-details"><FormattedMessage {...messages.collectionDescriptionProp} /></span>: {collection.description}</p>
                  </div>
                </div>
              </Col>
              )
            )}
            {queriedSources.map(source => (
              <Col lg={12} key={`src_${source.media_id}`} >
                <div className={`search-result search-result-source ${source.selected ? 'search-result-selected' : ''}`} name={`src_${source.media_id}`}>
                  <div className="search-result-checkbox">
                    <Checkbox
                      checked={source.selected}
                      key={source.media_id}
                      name={`src_${source.media_id}`}
                      onCheck={(...args) => addOrRemoveToSelectedSources(source.media_id, args[1])}
                    />
                  </div>
                  <div className="search-result-actions">
                    { source.isFavorite ? <FilledStarIcon /> : '' }
                    <Link to={slugifyLocalSourcePath(source)}>
                      <FormattedMessage {...localMessages.exploreSourceInvite} />
                    </Link>
                    &nbsp;
                    <ExploreButton linkTo={slugifyLocalSourcePath(source)} />
                  </div>
                  <div className="search-result-content">
                    <h2>
                      <FormattedMessage {...localMessages.sourceHeader} values={{ name: source.name }} />
                    </h2>
                    <p><span className="search-result-details"><FormattedMessage {...messages.sourceUrlProp} /></span>: {source.url}</p>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </Grid>
    </div>
  );
};

AdvancedSearchResults.propTypes = {
  queriedSources: PropTypes.array,
  queriedCollections: PropTypes.array,
  intl: PropTypes.object.isRequired,
  addOrRemoveToSelectedSources: PropTypes.func,
  addOrRemoveToSelectedCollections: PropTypes.func,
  addRemoveAll: PropTypes.func.isRequired,
  allOrNoneCheck: PropTypes.bool,
  onAddToCollection: PropTypes.func.isRequired,
};

export default injectIntl(AdvancedSearchResults);
