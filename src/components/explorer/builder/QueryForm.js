import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { reduxForm, Field, propTypes } from 'redux-form';
import Link from 'react-router/lib/Link';
// import MenuItem from 'material-ui/MenuItem';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import withIntlForm from '../../common/hocs/IntlForm';
import AppButton from '../../common/AppButton';
import ColorPicker from '../../common/ColorPicker';
import withHelp from '../../common/hocs/HelpfulContainer';
import CopyAllComponent from '../../common/CopyAllComponent';
import SourceCollectionsFieldList from '../../common/mediaPicker/SourceCollectionsFieldList';
import MediaPickerDialog from '../../common/mediaPicker/MediaPickerDialog';
import QueryHelpDialog from '../../common/help/QueryHelpDialog';
import SavedSearchControls from './SavedSearchControls';
import { emptyString, validDate } from '../../../lib/formValidators';
import { isStartDateAfterEndDate, isValidSolrDate } from '../../../lib/dateUtil';
import { KEYWORD, MEDIA, DATES } from '../../../lib/explorerUtil';

const localMessages = {
  mainTitle: { id: 'explorer.queryBuilder.maintitle', defaultMessage: 'Create Query' },
  addButton: { id: 'explorer.queryBuilder.saveAll', defaultMessage: 'Search' },
  feedback: { id: 'explorer.queryBuilder.feedback', defaultMessage: 'We saved your new source' },
  query: { id: 'explorer.queryBuilder.query', defaultMessage: '1. Enter search terms' },
  queryDesc: { id: 'explorer.queryBuilder.query.desc', defaultMessage: 'Media Cloud will return stories that match your search query. We use standard boolean search syntax.' },
  queryDescLink: { id: 'explorer.queryBuilder.query.descLink', defaultMessage: 'Learn more about writing boolean search queries.' },
  selectSandC: { id: 'explorer.queryBuilder.selectSAndC', defaultMessage: '2. Select your media' },
  selectSandCDesc: { id: 'explorer.queryBuilder.selectSAndCDesc', defaultMessage: 'Choose individual sources or collections to be searched.' },
  selectSandCDescLink: { id: 'explorer.queryBuilder.selectSAndCDescLink', defaultMessage: 'Learn more about choosing media.' },
  SandC: { id: 'explorer.queryBuilder.sAndC', defaultMessage: 'Media' },
  color: { id: 'explorer.queryBuilder.color', defaultMessage: 'Choose a color' },
  dates: { id: 'explorer.queryBuilder.dates', defaultMessage: '3. Enter dates' },
  datesDesc: { id: 'explorer.queryBuilder.datesDesc', defaultMessage: 'Our database goes back to 2011, however for the most accurate and comprehensive results, we recommend staying within one year of the current date.' },
  dateTo: { id: 'explorer.queryBuilder.dateTo', defaultMessage: 'to' },
  queryHelpTitle: { id: 'explorer.queryBuilder.queryHelp.title', defaultMessage: 'Building Query Strings' },
  queryHelpContent: { id: 'explorer.queryBuilder.queryHelp.content', defaultMessage: '<p>You can write boolean queries to search against out database. To search for a single word, just enter that word:</p><code>gender</code><p>You can also use boolean and phrase searches like this:</p><code>"gender equality" OR "gender equity"</code>' },
  saveSearch: { id: 'explorer.queryBuilder.saveQueries', defaultMessage: 'Save Search...' },
  queryStringError: { id: 'explorer.queryBuilder.queryStringError', defaultMessage: 'Your {name} query is missing keywords.' },
  startDateWarning: { id: 'explorer.queryBuilder.warning.startDate', defaultMessage: 'Start Date must be before End Date' },
  invalidDateWarning: { id: 'explorer.queryBuilder.warning.invalidDate', defaultMessage: 'Use the YYYY-MM-DD format' },
  noMediaSpecified: { id: 'explorer.queryBuilder.warning.noMediaSpecified', defaultMessage: 'Searching all media - generally not a great idea' },
  copyQueryKeywordTitle: { id: 'explorer.queryform.copyQueryQ', defaultMessage: 'Copy Query Keywords' },
  copyQueryDatesTitle: { id: 'explorer.queryform.copyQueryDates', defaultMessage: 'Copy Query Dates' },
  copyQueryMediaTitle: { id: 'explorer.queryform.copyQueryMedia', defaultMessage: 'Copy Query Media' },
  copyQueryKeywordMsg: { id: 'explorer.queryform.title.copyQueryQ', defaultMessage: 'Are you sure you want to copy these keywords to all your queries? This will replace the keyword for all your queries.' },
  copyQueryDatesMsg: { id: 'explorer.queryform.title.copyQueryDates', defaultMessage: 'Are you sure you want to copy these dates to all your queries? This will replace the dates for all your queries.' },
  copyQueryMediaMsg: { id: 'explorer.queryform.title.copyQueryMedia', defaultMessage: 'Are you sure you want to copy these media to all your queries? This will replace the media for all your queries.' },
};

class QueryForm extends React.Component {
  state = { // do not focus on primary textfield if we have a dialog open
    childDialogOpen: false,
  }

  setQueryFormChildDialogOpen = () => {
    this.setState({ childDialogOpen: !this.state.childDialogOpen });
  }

  render() {
    const { initialValues, onWillSearch, isEditable, selected, buttonLabel, onMediaDelete, onDateChange, handleLoadSearches, handleDeleteSearch, handleLoadSelectedSearch, savedSearches, searchNickname, handleSaveSearch,
      submitting, handleSubmit, onSave, onColorChange, onMediaChange, renderTextField, renderTextFieldWithFocus, handleCopyAll } = this.props;
    const { formatMessage } = this.props.intl;
    const cleanedInitialValues = initialValues ? { ...initialValues } : {};
    if (cleanedInitialValues.disabled === undefined) {
      cleanedInitialValues.disabled = false;
    }
    cleanedInitialValues.media = [  // merge intial sources and collections into one list for display with `renderFields`
      ...initialValues.sources,
      ...initialValues.collections,
    ];
    selected.media = [  // merge sources and collections into one list for display with `renderFields`
      ...selected.sources,
      ...selected.collections,
    ];
    const currentColor = selected.color; // for ColorPicker
    const currentQ = selected.q;
    let mediaPicker = null;
    let mediaLabel = formatMessage(localMessages.SandC);
    if (isEditable) {
      mediaPicker = (
        <MediaPickerDialog
          initMedia={selected.media ? selected.media : cleanedInitialValues.media}
          onConfirmSelection={selections => onMediaChange(selections)}
          setQueryFormChildDialogOpen={this.setQueryFormChildDialogOpen}
        />
      );
      mediaLabel = formatMessage(localMessages.selectSandC);
    }
    if (!selected) { return null; }
    return (
      <form className="app-form query-form" name="queryForm" onSubmit={handleSubmit(onSave)}>
        <div className="query-form-wrapper">
          <Grid>
            <Row>
              <Col lg={5}>
                <div className="q-field-wrapper">
                  <CopyAllComponent label={formatMessage(localMessages.query)} title={formatMessage(localMessages.copyQueryKeywordTitle)} msg={formatMessage(localMessages.copyQueryKeywordMsg)} onOk={() => handleCopyAll(KEYWORD)} />
                  <br />
                  <FormattedMessage {...localMessages.queryDesc} />
                  <Link
                    to={'https://'}
                  >
                    <FormattedMessage {...localMessages.queryDescLink} />
                  </Link>
                  <Field
                    className="query-field"
                    name="q"
                    type="text"
                    value={currentQ}
                    multiline
                    rows={3}
                    rowsMax={4}
                    fullWidth
                    onChange={this.focusSelect}
                    component={renderTextFieldWithFocus}
                  />
                  <QueryHelpDialog />
                </div>
                <div className="color-field-wrapper">
                  <label className="inline" htmlFor="color"><FormattedMessage {...localMessages.color} /></label>
                  <ColorPicker
                    name="color"
                    color={currentColor}
                    onChange={onColorChange}
                  />
                </div>
              </Col>
              <Col lg={1} />
              <Col lg={6}>
                <div className="media-field-wrapper">
                  <CopyAllComponent label={mediaLabel} title={formatMessage(localMessages.copyQueryMediaTitle)} msg={formatMessage(localMessages.copyQueryMediaMsg)} onOk={() => handleCopyAll(MEDIA)} />
                  <br />
                  <FormattedMessage {...localMessages.selectSandCDesc} />
                  <Link
                    to={'https://'}
                  >
                    <FormattedMessage {...localMessages.selectSandCDescLink} />
                  </Link>
                  <SourceCollectionsFieldList
                    className="query-field"
                    form="queryForm"
                    destroyOnUnmount={false}
                    enableReinitialize
                    onDelete={onMediaDelete}
                    initialValues={cleanedInitialValues}
                    allowRemoval={isEditable}
                    showWarningIfEmpty
                  />
                  {mediaPicker}
                </div>
                <div>
                  <CopyAllComponent label={formatMessage(localMessages.dates)} title={formatMessage(localMessages.copyQueryDatesTitle)} msg={formatMessage(localMessages.copyQueryDatesMsg)} onOk={() => handleCopyAll(DATES)} />
                  <br />
                  <FormattedMessage {...localMessages.datesDesc} />
                </div>
                <div className="dates-field-wrapper">
                  <Field
                    className="query-field start-date-wrapper"
                    maxLength="12"
                    name="startDate"
                    type="inline"
                    component={renderTextField}
                    disableunderline="true"
                    disabled={!isEditable}
                    onChange={onDateChange}
                  />
                  <div className="date-for-wrapper"><FormattedMessage {...localMessages.dateTo} /></div>
                  <Field
                    className="query-field end-date-wrapper"
                    maxLength="12"
                    name="endDate"
                    type="inline"
                    component={renderTextField}
                    disableunderline="true"
                    disabled={!isEditable}
                    onChange={onDateChange}
                  />
                </div>
              </Col>
            </Row>
          </Grid>
        </div>
        <div className="query-form-actions-wrapper">
          <Grid>
            <Row>
              <Col lg={6} />
              <Col lg={6} >
                <div className="query-form-actions">
                  <SavedSearchControls
                    searchNickname={searchNickname}
                    savedSearches={savedSearches}
                    handleLoadSearches={handleLoadSearches}
                    handleLoadSelectedSearch={handleLoadSelectedSearch}
                    handleSaveSearch={l => handleSaveSearch(l)}
                    handleDeleteSearch={handleDeleteSearch}
                    submitting={submitting}
                    setQueryFormChildDialogOpen={this.setQueryFormChildDialogOpen}
                  />
                  <AppButton
                    type="submit"
                    label={buttonLabel}
                    disabled={submitting}
                    onClick={onWillSearch}
                    primary
                  />
                </div>
              </Col>
            </Row>
          </Grid>
        </div>
      </form>
    );
  }
}

QueryForm.propTypes = {
  // from context
  intl: PropTypes.object.isRequired,
  renderTextField: PropTypes.func.isRequired,
  renderSelect: PropTypes.func.isRequired,
  renderTextFieldWithFocus: PropTypes.func.isRequired,
  searchNickname: PropTypes.string.isRequired,
  savedSearches: PropTypes.array,

  // from parent
  selected: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onColorChange: PropTypes.func,
  onMediaChange: PropTypes.func,
  buttonLabel: PropTypes.string.isRequired,
  initialValues: PropTypes.object,
  onWillSearch: PropTypes.func,
  handleLoadSearches: PropTypes.func.isRequired,
  handleLoadSelectedSearch: PropTypes.func.isRequired,
  handleSaveSearch: PropTypes.func.isRequired,
  handleDeleteSearch: PropTypes.func.isRequired,
  handleCopyAll: PropTypes.func.isRequired,
  onMediaDelete: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  // from form healper
  updateQuery: PropTypes.func,
  handleSubmit: PropTypes.func,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  isEditable: PropTypes.bool.isRequired,
  focusRequested: PropTypes.func.isRequired,
};

function validate(values, props) {
  const { formatMessage } = props.intl;
  const errors = {};
  if (emptyString(values.q)) {
    const errString = formatMessage(localMessages.queryStringError, { name: values.label });
    errors.q = { _error: errString };
  }
  if (!validDate(values.startDate) || !isValidSolrDate(values.startDate)) {
    errors.startDate = { _error: formatMessage(localMessages.invalidDateWarning) };
  }
  if (!validDate(values.endDate) || !isValidSolrDate(values.endDate)) {
    errors.endDate = { _error: formatMessage(localMessages.invalidDateWarning) };
  }
  if (validDate(values.startDate) && validDate(values.endDate) && isStartDateAfterEndDate(values.startDate, values.endDate)) {
    errors.startDate = { _error: formatMessage(localMessages.startDateWarning) };
  }

  return errors;
}

function warn(values, props) {
  const { formatMessage } = props.intl;
  const warnings = {};
  if ((!values.collections || !values.collections.length) &&
    (!values.sources || !values.sources.length) &&
    (!values.media || !values.media.length)) {
    warnings.media = { _warning: formatMessage(localMessages.noMediaSpecified) };
  }
  return warnings;
}

export default
  injectIntl(
    withIntlForm(
      withHelp(localMessages.queryHelpTitle, localMessages.queryHelpContent)(
        reduxForm({ propTypes, validate, warn })(
          QueryForm
        ),
      ),
    ),
  );
