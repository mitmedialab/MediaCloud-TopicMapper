import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import CollectionSourceListContainer from './CollectionSourceListContainer';
import CollectionSplitStoryCountContainer from './CollectionSplitStoryCountContainer';
import CollectionTopWordsContainer from './CollectionTopWordsContainer';
import CollectionGeographyContainer from './CollectionGeographyContainer';
import CollectionSourceRepresentation from './CollectionSourceRepresentation';
import CollectionSimilarContainer from './CollectionSimilarContainer';
import CollectionMetadataCoverageSummaryContainer from './CollectionMetadataCoverageSummaryContainer';
import { hasPermissions, getUserRoles, PERMISSION_MEDIA_EDIT } from '../../../lib/auth';
import { WarningNotice } from '../../common/Notice';
import TabSelector from '../../common/TabSelector';

const localMessages = {
  collectionIsNotStatic: { id: 'collection.details.isStatic', defaultMessage: 'This is a dynamic collection; sources can be added and removed from it' },
  collectionIsStatic: { id: 'collection.details.isNotStatic', defaultMessage: 'This is a static collection; the sources that are part of it will not change.' },
  notPermitted: { id: 'collection.notPermitted', defaultMessage: 'Sorry, this is a private collection.' },
  sources: { id: 'collection.sourcesTab', defaultMessage: 'Source List' },
  content: { id: 'collection.contentTab', defaultMessage: 'Collection Content' },
};

class CollectionDetailsContainer extends React.Component {
  state = {
    selectedViewIndex: 0,
  };

  render() {
    const { collection, user } = this.props;
    const { formatMessage } = this.props.intl;
    const filename = `SentencesOverTime-Collection-${collection.tags_id}`;

    if (collection && !collection.show_on_media && !hasPermissions(getUserRoles(user), PERMISSION_MEDIA_EDIT)) {
      return (
        <WarningNotice><FormattedHTMLMessage {...localMessages.notPermitted} /></WarningNotice>
      );
    }

    let viewContent;
    switch (this.state.selectedViewIndex) {
      case 0:
        viewContent = (
          <>
            <Grid item md={6} sm={12}>
              <CollectionSourceListContainer collectionId={collection.tags_id} />
            </Grid>
            <Grid item md={6} sm={12}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <CollectionSourceRepresentation collection={collection} />
                </Grid>
                <Grid item xs={12}>
                  <CollectionMetadataCoverageSummaryContainer collection={collection} />
                </Grid>
                <Grid item xs={12}>
                  <CollectionSimilarContainer collectionId={collection.tags_id} filename={filename} />
                </Grid>
              </Grid>
            </Grid>
          </>
        );
        break;
      case 1:
        viewContent = (
          <>
            <Grid item xs={12}>
              <CollectionSplitStoryCountContainer
                collectionId={collection.tags_id}
                filename={filename}
                collectionName={collection.label || collection.tag}
              />
            </Grid>
            <Grid item xs={12}>
              <CollectionTopWordsContainer collectionId={collection.tags_id} collectionName={collection.label || collection.tag} />
            </Grid>
            <Grid item xs={12}>
              <CollectionGeographyContainer
                collectionId={collection.tags_id}
                collectionName={collection.label || collection.tag}
              />
            </Grid>
          </>
        );
        break;
      default:
        break;
    }

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <p><b>{collection.description}</b></p>
          <p>
            {collection.is_static && <FormattedMessage {...localMessages.collectionIsStatic} values={{ shows: collection.is_static }} />}
            {!collection.is_static && <FormattedMessage {...localMessages.collectionIsNotStatic} values={{ shows: collection.is_static }} />}
          </p>
        </Grid>

        <Grid item xs={12}>
          <TabSelector
            tabLabels={[
              formatMessage(localMessages.sources),
              formatMessage(localMessages.content),
            ]}
            onViewSelected={index => this.setState({ selectedViewIndex: index })}
          />
        </Grid>

        {viewContent}
      </Grid>
    );
  }
}

CollectionDetailsContainer.propTypes = {
  intl: PropTypes.object.isRequired,
  // from context
  params: PropTypes.object.isRequired, // params from router
  collectionId: PropTypes.number.isRequired,
  // from state
  collection: PropTypes.object,
  user: PropTypes.object,
};

const mapStateToProps = (state, ownProps) => ({
  collectionId: parseInt(ownProps.params.collectionId, 10),
  collection: state.sources.collections.selected.collectionDetails.object,
  user: state.user,
});

export default
injectIntl(
  connect(mapStateToProps)(
    CollectionDetailsContainer
  )
);
