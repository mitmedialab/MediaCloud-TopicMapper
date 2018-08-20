import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Row, Col } from 'react-flexbox-grid/lib';
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
  collectionDetailsTitle: { id: 'collection.details.title', defaultMessage: 'Collection: {name}' },
  noHealth: { id: 'collection.details.noHealth', defaultMessage: 'Sorry, we can\'t show collection-level health yet.' },
  sourceTableTitle: { id: 'collection.details.sourceTable.title', defaultMessage: 'Sources' },
  sourceTableIntro: { id: 'collection.details.sources.intro',
    defaultMessage: 'This collection includes {count, plural,\n =0 {no media sources} \n =1 {one media source} \n other {# media sources}\n}.',
  },
  collectionIsOrIsnt: { id: 'collection.details.isOrIsnt', defaultMessage: 'This is a {shows, plural,\n =false {dynamic collection; sources can be added and removed from it}\n =true {static collection; the sources that are part of it will not change}\n}.' },
  collectionIsNotStatic: { id: 'collection.details.isStatic', defaultMessage: 'This is a dynamic collection; sources can be added and removed from it' },
  collectionIsStatic: { id: 'collection.details.isNotStatic', defaultMessage: 'This is a static collection; the sources that are part of it will not change.' },
  collectionFavorited: { id: 'collection.favorited', defaultMessage: 'Marked this as a starred collection' },
  collectionUnFavorited: { id: 'collection.unfavorited', defaultMessage: 'Remove this as a starred collection' },
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
          <Row>
            <Col lg={6} xs={12}>
              <CollectionSourceListContainer collectionId={collection.tags_id} />
            </Col>
            <Col lg={6} xs={12}>
              <CollectionSourceRepresentation collection={collection} />
              <CollectionMetadataCoverageSummaryContainer collection={collection} />
              <CollectionSimilarContainer collectionId={collection.tags_id} filename={filename} />
            </Col>
          </Row>
        );
        break;
      case 1:
        viewContent = (
          <span>
            <Row>
              <Col lg={12}>
                <CollectionSplitStoryCountContainer
                  collectionId={collection.tags_id}
                  filename={filename}
                  collectionName={collection.label || collection.tag}
                />
              </Col>
            </Row>
            <Row>
              <Col lg={12}>
                <CollectionTopWordsContainer collectionId={collection.tags_id} collectionName={collection.label || collection.tag} />
              </Col>
            </Row>
            <Row>
              <Col lg={12}>
                <CollectionGeographyContainer
                  collectionId={collection.tags_id}
                  collectionName={collection.label || collection.tag}
                />
              </Col>
            </Row>
          </span>
        );
        break;
      default:
        break;
    }

    return (
      <div>

        <Row>
          <Col lg={8}>
            <p><b>{collection.description}</b></p>
            <p><FormattedMessage {...localMessages.collectionIsOrIsnt} values={{ shows: collection.is_static }} />
            </p>
          </Col>
        </Row>

        <Row>
          <TabSelector
            tabLabels={[
              formatMessage(localMessages.sources),
              formatMessage(localMessages.content),
            ]}
            onViewSelected={index => this.setState({ selectedViewIndex: index })}
          />
        </Row>

        {viewContent}

      </div>
    );
  }

}

CollectionDetailsContainer.propTypes = {
  intl: PropTypes.object.isRequired,
  // from context
  params: PropTypes.object.isRequired,       // params from router
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
