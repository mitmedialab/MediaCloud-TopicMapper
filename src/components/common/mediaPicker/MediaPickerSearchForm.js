import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import TextField from '@material-ui/core/TextField';
import { Row, Col } from 'react-flexbox-grid/lib';
import AppButton from '../../common/AppButton';

const localMessages = {
  pickCollections: { id: 'system.mediaPicker.select.pickCollections', defaultMessage: 'Search For Collections' },
  pickSources: { id: 'system.mediaPicker.select.pickSources', defaultMessage: 'Search For Sources' },
  search: { id: 'system.mediaPicker.select.search', defaultMessage: 'Search' },
};

// const formSelector = formValueSelector('queryForm');

class MediaPickerSearchForm extends React.Component {

  shouldComponentUpdate = () => false;

  focusUsernameInputField = (input) => {
    if (input) {
      setTimeout(() => { input.focus(); }, 100);
    }
  }

  handleMenuItemKeyDown = (evt) => {
    const { onSearch } = this.props;
    switch (evt.key) {
      case 'Enter':
        evt.preventDefault(); // don't type the enter into the field
        onSearch({ mediaKeyword: evt.target.value });
        break;
      default: break;
    }
  };

  handleSearchButtonClick = (evt) => {
    const { onSearch } = this.props;
    evt.preventDefault();
    const searchStr = document.getElementsByName('mediaKeyword')[0].value;
    onSearch({ mediaKeyword: searchStr });
  }

  render() {
    const { initValues, hintText, children, pristine } = this.props;
    const { formatMessage } = this.props.intl;

    const storedKeyword = initValues.storedKeyword;
    if (storedKeyword.mediaKeyword === undefined || storedKeyword.mediaKeyword === null) {
      storedKeyword.mediaKeyword = '';
    }
    const defaultFormChildren = (
      <Row>
        <Col lg={8}>
          <TextField
            name="mediaKeyword"
            defaultValue={storedKeyword.mediaKeyword}
            onKeyPress={this.handleMenuItemKeyDown}
            fullWidth
            label={hintText}
          />
        </Col>
        <Col lg={2}>
          <AppButton
            style={{ marginTop: 10 }}
            label={formatMessage(localMessages.search)}
            onClick={this.handleSearchButtonClick}
            disabled={pristine}
            color="primary"
          />
        </Col>
      </Row>
    );
    const whichChildren = (children !== null && children !== undefined) ? children : defaultFormChildren;
    return whichChildren;
  }
}

MediaPickerSearchForm.propTypes = {
  intl: PropTypes.object.isRequired,
  onSearch: PropTypes.func,
  isEditable: PropTypes.bool,
  initValues: PropTypes.object,
  submitting: PropTypes.bool,
  hintText: PropTypes.string,
  children: PropTypes.object,
  pristine: PropTypes.bool,
};

export default
  injectIntl(
    MediaPickerSearchForm
  );

