import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import TextField from '@material-ui/core/TextField';

const localMessages = {
  pickQuery: { id: 'query.pick', defaultMessage: 'Story Search (press enter to apply)' },
};

class QuerySelector extends React.Component {

  state = {
    focused: false,
    value: '',
  };

  componentWillMount() {
    this.setState({ value: this.props.query || '' });
  }

  componentWillReceiveProps(nextProps) {
    const { query } = this.props;
    if (nextProps.query !== query) {
      // if filters are open and user deletes chip, gotta remove the query here
      this.setState({ value: nextProps.query });
    }
  }

  valueHasChanged = () => {
    const { query } = this.props;
    return this.state.value !== query;
  }

  handleApply = () => {
    const { onQuerySelected } = this.props;
    onQuerySelected(this.state.value);
  }

  handleMenuItemKeyDown = (event) => {
    if (event.key === 'Enter') {
      this.setState({ focused: false });
      this.handleApply();
    }
  }

  handleFocus = () => {
    this.setState({ focused: true });
  }

  handleBlur = () => {
    const { query } = this.props;
    this.setState({ focused: false });
    if (this.valueHasChanged()) { // reset if they didn't apply their changes
      this.setState({ value: query });
    }
  }

  handleChange = (event) => {
    this.setState({ value: event.target.value });
  }

  render() {
    const { formatMessage } = this.props.intl;
    // only show apply button if they change something
    let buttonContent;
    return (
      <div className="query-selector-wrapper">
        <TextField
          label={formatMessage(localMessages.pickQuery)}
          style={{ color: 'rgb(224,224,224)', opacity: 0.8 }}
          value={this.state.value ? this.state.value : ''}
          onKeyDown={this.handleMenuItemKeyDown}
          fullWidth
          id="topic-filter-query"
          onChange={this.handleChange}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
        />
        {buttonContent}
      </div>
    );
  }

}

QuerySelector.propTypes = {
  // from parent
  query: PropTypes.string,
  onQuerySelected: PropTypes.func.isRequired,
  // from compositional chain
  intl: PropTypes.object.isRequired,
};

export default
  injectIntl(
    QuerySelector
  );
