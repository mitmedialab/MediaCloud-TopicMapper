import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl';
import AppButton from '../../../common/AppButton';
import withAsyncFetch from '../../../common/hocs/AsyncContainer';
import { createSourcesByUrl } from '../../../../actions/sourceActions';
import messages from '../../../../resources/messages';

const localMessages = {
  newCount: { id: 'source.status.new', defaultMessage: '<b>New Sources</b>: {count} ' },
  showNew: { id: 'source.status.new.show', defaultMessage: 'show new sources' },
  existingCount: { id: 'source.status.existing', defaultMessage: '<b>Existing Sources</b>: {count} ' },
  showExisting: { id: 'source.status.existing.show', defaultMessage: 'show existing sources' },
  errorCount: { id: 'source.status.error', defaultMessage: '<b>Failed Sources</b>: {count} ' },
  showError: { id: 'source.status.error.show', defaultMessage: 'show failed sources' },
};

class AddByUrlConfirmer extends Component {

  state = {
    showNew: false,
    showExisting: false,
    showError: false,
  }

  componentWillReceiveProps(nextProps) {
    const { urls, fetchData } = this.props;
    if ((nextProps.urls !== urls)) {
      fetchData(nextProps.urls);
    }
  }

  render() {
    const { onConfirm, onCancel, newSources, existingSources, errorSources } = this.props;
    const { formatMessage } = this.props.intl;
    const newListContent = (this.state.showNew) ? newSources.map(s => (<span key={s.media_id}>{s.url}<br /></span>)) : null;
    const existingListContent = (this.state.showExisting) ? existingSources.map(s => (<span key={s.media_id}>{s.url}<br /></span>)) : null;
    const errorListContent = (this.state.showError) ? errorSources.map(s => (<span key={s.media_id}>{s.url}: {s.error}<br /></span>)) : null;
    return (
      <div className="add-by-url-confirm">
        <p>
          <FormattedHTMLMessage {...localMessages.newCount} values={{ count: newSources.length }} />
          <a href="#showNew" onClick={(evt) => { evt.preventDefault(); this.setState({ showNew: !this.state.showNew }); }} >
            <FormattedMessage {...localMessages.showNew} />
          </a>
          <br />
          {newListContent}
        </p>
        <p>
          <FormattedHTMLMessage {...localMessages.existingCount} values={{ count: existingSources.length }} />
          <a href="#showExisting" onClick={(evt) => { evt.preventDefault(); this.setState({ showExisting: !this.state.showExisting }); }} >
            <FormattedMessage {...localMessages.showExisting} />
          </a>
          <br />
          {existingListContent}
        </p>
        <p>
          <FormattedHTMLMessage {...localMessages.errorCount} values={{ count: errorSources.length }} />
          <a href="#showError" onClick={(evt) => { evt.preventDefault(); this.setState({ showError: !this.state.showError }); }} >
            <FormattedMessage {...localMessages.showError} />
          </a>
          <br />
          {errorListContent}
        </p>
        <AppButton
          label={formatMessage(messages.cancel)}
          onClick={onCancel}
        />
        &nbsp; &nbsp;
        <AppButton
          label={formatMessage(messages.ok)}
          onClick={() => onConfirm([...newSources, ...existingSources])}
          color="primary"
        />
      </div>
    );
  }

}

AddByUrlConfirmer.propTypes = {
  // from parent
  urls: PropTypes.array.isRequired,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  // from compositional chain
  intl: PropTypes.object.isRequired,
  // from dispatch
  asyncFetch: PropTypes.func.isRequired,
  fetchData: PropTypes.func.isRequired,
  // from state
  fetchStatus: PropTypes.string,
  sources: PropTypes.array,
  newSources: PropTypes.array,
  existingSources: PropTypes.array,
  errorSources: PropTypes.array,
};

const mapStateToProps = state => ({
  fetchStatus: state.sources.collections.form.urlsToAdd.fetchStatus,
  sources: state.sources.collections.form.urlsToAdd.results,
  newSources: state.sources.collections.form.urlsToAdd.new,
  existingSources: state.sources.collections.form.urlsToAdd.existing,
  errorSources: state.sources.collections.form.urlsToAdd.error,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchData: (urls) => {
    dispatch(createSourcesByUrl(urls));
  },
  asyncFetch: () => {
    dispatch(createSourcesByUrl(ownProps.urls));
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      withAsyncFetch(
        AddByUrlConfirmer
      )
    )
  );
