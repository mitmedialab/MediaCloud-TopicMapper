import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import AppButton from '../../../common/AppButton';
import withAsyncFetch from '../../../common/hocs/AsyncContainer';
import { fetchCollectionToCopy } from '../../../../actions/sourceActions';
import messages from '../../../../resources/messages';

const localMessages = {
  confirm: { id: 'collection.media.add.confirm',
    defaultMessage: 'The "{name}" collection has {count} sources.  Do you want to add all {count} of them?',
  },
};

class CollectionCopyConfirmer extends Component {

  componentWillReceiveProps(nextProps) {
    const { collectionId, fetchData } = this.props;
    if ((nextProps.collectionId !== collectionId)) {
      fetchData(nextProps.collectionId);
    }
  }

  render() {
    const { collection, onConfirm, onCancel } = this.props;
    const { formatMessage } = this.props.intl;
    return (
      <div className="collection-copy-confirm">
        <p>
          <FormattedMessage
            {...localMessages.confirm}
            values={{ name: collection.label, count: collection.sources.length }}
          />
        </p>
        <AppButton
          onClick={onCancel}
          color="secondary"
        >{formatMessage(messages.cancel)}
        </AppButton>
        &nbsp; &nbsp;
        <AppButton
          onClick={() => onConfirm(collection)}
          color="primary"
        >{formatMessage(messages.ok)}
        </AppButton>
      </div>
    );
  }

}

CollectionCopyConfirmer.propTypes = {
  // from parent
  collectionId: PropTypes.number.isRequired,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  // from compositional chain
  intl: PropTypes.object.isRequired,
  // from dispatch
  asyncFetch: PropTypes.func.isRequired,
  fetchData: PropTypes.func.isRequired,
  // from state
  fetchStatus: PropTypes.string,
  collection: PropTypes.object,
};

const mapStateToProps = state => ({
  fetchStatus: state.sources.collections.form.toCopy.fetchStatus,
  collection: state.sources.collections.form.toCopy.results,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchData: (collectionId) => {
    dispatch(fetchCollectionToCopy(collectionId));
  },
  asyncFetch: () => {
    if (ownProps.collectionId) {
      const getSources = true;
      dispatch(fetchCollectionToCopy(ownProps.collectionId, { getSources }));
    }
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      withAsyncFetch(
        CollectionCopyConfirmer
      )
    )
  );
