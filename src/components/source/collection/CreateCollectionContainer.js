import PropTypes from 'prop-types';
import React from 'react';
import { push } from 'react-router-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import LoadingSpinner from '../../common/LoadingSpinner';
import { createCollection, fetchSourcesByIds, fetchCollectionSourcesByIds,
  resetAdvancedSearchSource, resetAdvancedSearchCollection } from '../../../actions/sourceActions';
import { updateFeedback } from '../../../actions/appActions';
import CollectionForm from './form/CollectionForm';
import { PERMISSION_MEDIA_EDIT } from '../../../lib/auth';
import Permissioned from '../../common/Permissioned';
import { nullOrUndefined } from '../../../lib/formValidators';
import PageTitle from '../../common/PageTitle';

const localMessages = {
  mainTitle: { id: 'collection.maintitle', defaultMessage: 'Create New Collection' },
  addButton: { id: 'collection.add.save', defaultMessage: 'Save New Collection' },
  feedback: { id: 'source.add.feedback', defaultMessage: 'We saved your new Collection' },
  failed: { id: 'source.add.feedback.failed', defaultMessage: 'Something went wrong :(' },
};

class CreateCollectionContainer extends React.Component {
  UNSAFE_componentWillMount() {
    const { saveParamsToStore } = this.props;
    saveParamsToStore(this.props, this);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.location.query.src !== this.props.location.query.src
      || nextProps.location.query.coll !== this.props.location.query.coll
      || nextProps.location.query.search !== this.props.location.query.search) {
      const { saveParamsToStore } = nextProps;
      saveParamsToStore(nextProps, this);
    }
  }

  componentWillUnmount() {
    const { dispatchReset } = this.props;
    dispatchReset();
  }

  render() {
    const { handleSave, prefillSrcIds, prefillCollectionIds, sourcesToPrefill, collectionsToPrefill } = this.props;
    const { formatMessage } = this.props.intl;
    const initialValues = {};
    let readyToShowForm = false;
    if ((prefillSrcIds || prefillCollectionIds)) {
      // if there is anything to prefill, spin until data is recieved, then show form
      if ((sourcesToPrefill.length + collectionsToPrefill.length) > 0) {
        let combinedPrefill = [];
        if (sourcesToPrefill) combinedPrefill = combinedPrefill.concat(sourcesToPrefill);
        if (collectionsToPrefill) combinedPrefill = combinedPrefill.concat(collectionsToPrefill);
        initialValues.sources = combinedPrefill;
        readyToShowForm = true;
      }
    } else {
      // nothign to prefill, so show the form
      readyToShowForm = true;
    }
    let formContent = <LoadingSpinner />;
    if (readyToShowForm) {
      formContent = (
        <CollectionForm
          initialValues={initialValues}
          buttonLabel={formatMessage(localMessages.addButton)}
          onSave={handleSave}
        />
      );
    }
    return (
      <div className="create-collection">
        <Permissioned onlyRole={PERMISSION_MEDIA_EDIT}>
          <PageTitle value={localMessages.mainTitle} />
          <Grid>
            <Row>
              <Col lg={12}>
                <h1><FormattedMessage {...localMessages.mainTitle} /></h1>
              </Col>
            </Row>
            {formContent}
          </Grid>
        </Permissioned>
      </div>
    );
  }
}

CreateCollectionContainer.propTypes = {
  // from context
  intl: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired, // params from router
  location: PropTypes.object.isRequired,
  // from dispatch
  handleSave: PropTypes.func.isRequired,
  dispatchMetadataSelections: PropTypes.func.isRequired,
  dispatchAddAllSourcesByString: PropTypes.func.isRequired,
  dispatchReset: PropTypes.func,
  saveParamsToStore: PropTypes.func.isRequired,
  sourcesToPrefill: PropTypes.array,
  collectionsToPrefill: PropTypes.array,
  prefillSrcIds: PropTypes.string,
  prefillCollectionIds: PropTypes.string,
};

const mapStateToProps = (state, ownProps) => ({
  sourcesToPrefill: state.sources.collections.form.seedSources.list,
  collectionsToPrefill: state.sources.collections.form.seedCollections.list,
  prefillSrcIds: ownProps.location.query.src,
  prefillCollectionIds: ownProps.location.query.coll,
  searchStrToAdd: ownProps.location.query.search,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleSave: (values) => {
    const infoToSave = {
      name: values.name,
      description: nullOrUndefined(values.description) ? '' : values.description,
      static: values.static,
      showOnMedia: values.showOnMedia,
      showOnStories: values.showOnStories,
    };
    if ('sources' in values) {
      infoToSave['sources[]'] = values.sources.map(s => (s.id ? s.id : s.media_id));
    } else {
      infoToSave['sources[]'] = [];
    }
    dispatch(createCollection(infoToSave))
      .then((results) => {
        if (results.tags_id) {
          // let them know it worked
          dispatch(updateFeedback({ classes: 'info-notice', open: true, message: ownProps.intl.formatMessage(localMessages.feedback) }));
          dispatch(push(`/collections/${results.tags_id}`));
        } else {
          dispatch(updateFeedback({ classes: 'error-notice', open: true, message: ownProps.intl.formatMessage(localMessages.failed) }));
        }
      });
  },
  dispatchReset() {
    dispatch(resetAdvancedSearchSource());
    dispatch(resetAdvancedSearchCollection());
  },
  dispatchMetadataSelections: (sourceIdArray, collectionIdArray) => {
    dispatch(resetAdvancedSearchSource());
    dispatch(resetAdvancedSearchCollection());
    // fields of sources will come back and will be integrated into the media form fields
    if (collectionIdArray && collectionIdArray.length > 0) {
      dispatch(fetchCollectionSourcesByIds(collectionIdArray.length > 1 ? collectionIdArray.split(',') : collectionIdArray));
    }
    if (sourceIdArray && sourceIdArray.length > 0) {
      dispatch(fetchSourcesByIds(sourceIdArray.length > 1 ? sourceIdArray.split(',') : sourceIdArray));
    }
  },
  dispatchAddAllSourcesByString() {
    // not currently implemented, but creation of collection should add all media sources by searchStr and metadata...
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    saveParamsToStore: () => {
      if (stateProps.prefillSrcIds || stateProps.prefillCollectionIds) {
        dispatchProps.dispatchMetadataSelections(stateProps.prefillSrcIds, stateProps.prefillCollectionIds);
      } else {
        dispatchProps.dispatchAddAllSourcesByString(stateProps.searchStr);
      }
    },
  };
}

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps, mergeProps)(
    CreateCollectionContainer
  ),
);
