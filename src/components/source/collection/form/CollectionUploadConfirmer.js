import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import AppButton from '../../../common/AppButton';
import messages from '../../../../resources/messages';

const MAX_ROWS_ALLOWED = 300; // the max number of rows they are allowed to upload - enforced here and on the server

const localMessages = {
  downloadTemplate: { id: 'collection.media.upload.downloadTemplate',
    defaultMessage: 'Download Template',
  },
  confirm: { id: 'collection.media.upload.confirm',
    defaultMessage: 'We emailed you a summary of all the media sources we created or updated. {count} sources were added and/or updated successfully! Do you want to add them to this collection?',
  },
  error: { id: 'collection.media.upload.tooMany',
    defaultMessage: 'Limit exceeded: too many {count} sources to upload. You can add up to 300 sources at a time.',
  },
};

const CollectionUploadConfirmer = (props) => {
  const { sources, onConfirm, onCancel, onClickButton } = props;
  const { formatMessage } = props.intl;
  const message = (sources.length > MAX_ROWS_ALLOWED) ? localMessages.error : localMessages.confirm;
  return (
    <div className="collection-copy-confirm">
      <p>
        <FormattedMessage
          {...message}
          values={{ count: sources.length }}
        />
      </p>
      <AppButton
        label={formatMessage(messages.cancel)}
        onClick={() => { onCancel(); onClickButton(); }}
        color="secondary"
      />
      &nbsp; &nbsp;
      <AppButton
        label={formatMessage(messages.ok)}
        onClick={() => { onConfirm(sources); onClickButton(); }}
        color="primary"
      />
    </div>
  );
};

CollectionUploadConfirmer.propTypes = {
  // from parent
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  onClickButton: PropTypes.func.isRequired,
  // from compositional chain
  intl: PropTypes.object.isRequired,
  // from dispatch
  // from state
  fetchStatus: PropTypes.string,
  sources: PropTypes.array,
};

const mapStateToProps = state => ({
  fetchStatus: state.sources.collections.form.toUpload.fetchStatus,
  sources: state.sources.collections.form.toUpload.list,
});

const mapDispatchToProps = () => ({
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      CollectionUploadConfirmer
    )
  );
