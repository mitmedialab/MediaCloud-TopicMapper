import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field, propTypes, formValueSelector } from 'redux-form';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import withIntlForm from '../../common/hocs/IntlForm';
import AppButton from '../../common/AppButton';
import withHelp from '../../common/hocs/HelpfulContainer';
import CopyAllComponent from '../../common/CopyAllComponent';
import SourceCollectionsMediaForm from '../../common/form/SourceCollectionsMediaForm';
import MediaPickerDialog from '../../common/mediaPicker/MediaPickerDialog';
import QueryHelpDialog from '../../common/help/QueryHelpDialog';
import MediaHelpDialog from '../../common/help/MediaHelpDialog';
import SavedSearchControls from './SavedSearchControls';
import { emptyString, validDate } from '../../../lib/formValidators';
import { isStartDateAfterEndDate, isValidSolrDate } from '../../../lib/dateUtil';
import { KEYWORD, MEDIA, DATES } from '../../../lib/explorerUtil';
import { ALL_MEDIA } from '../../../lib/mediaUtil';
import messages from '../../../resources/messages';

const formSelector = formValueSelector('queryForm');

const localMessages = {
  mainTitle: { id: 'explorer.queryBuilder.maintitle', defaultMessage: 'Create Query' },
  addButton: { id: 'explorer.queryBuilder.saveAll', defaultMessage: 'Search' },
  feedback: { id: 'explorer.queryBuilder.feedback', defaultMessage: 'We saved your new source' },
  query: { id: 'explorer.queryBuilder.query', defaultMessage: 'Enter search terms' },
  queryDesc: { id: 'explorer.queryBuilder.query.desc', defaultMessage: 'Media Cloud will return stories that match your search query. We use standard boolean search syntax.' },
  selectSandC: { id: 'explorer.queryBuilder.selectSAndC', defaultMessage: 'Select your media' },
  selectSandCDesc: { id: 'explorer.queryBuilder.selectSAndCDesc', defaultMessage: 'Choose individual sources or collections to be searched. Our system includes collections for a large range of countries, in multiple languages.' },
  selectSandCDescLink: { id: 'explorer.queryBuilder.selectSAndCDescLink', defaultMessage: 'Learn more about choosing media.' },
  SandC: { id: 'explorer.queryBuilder.sAndC', defaultMessage: 'Media' },
  color: { id: 'explorer.queryBuilder.color', defaultMessage: 'Choose a color' },
  dates: { id: 'explorer.queryBuilder.dates', defaultMessage: 'Enter dates' },
  datesDesc: { id: 'explorer.queryBuilder.datesDesc', defaultMessage: 'Our database goes back to 2011, however the start date for different sources and collections can vary. Click on a source or collecton to learn more about when we added it.' },
  dateTo: { id: 'explorer.queryBuilder.dateTo', defaultMessage: 'to' },
  queryHelpTitle: { id: 'explorer.queryBuilder.queryHelp.title', defaultMessage: 'Building Query Strings' },
  queryHelpContent: { id: 'explorer.queryBuilder.queryHelp.content', defaultMessage: '<p>You can write boolean queries to search against out database. To search for a single word, just enter that word:</p><code>gender</code><p>You can also use boolean and phrase searches like this:</p><code>"gender equality" OR "gender equity"</code>' },
  saveSearch: { id: 'explorer.queryBuilder.saveQueries', defaultMessage: 'Save Search...' },
  queryStringError: { id: 'explorer.queryBuilder.queryStringError', defaultMessage: 'Using no keywords will match all the stories we have (within the dates and media you pick).' },
  startDateWarning: { id: 'explorer.queryBuilder.warning.startDate', defaultMessage: 'Start Date must be before End Date' },
  invalidDateWarning: { id: 'explorer.queryBuilder.warning.invalidDate', defaultMessage: 'Use the YYYY-MM-DD format' },
  noMediaSpecified: { id: 'explorer.queryBuilder.warning.noMediaSpecified', defaultMessage: 'No media selected' },
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

  getAllActiveQueries = queries => (queries.filter(q => q.deleted !== true));

  setQueryFormChildDialogOpen = () => {
    this.setState(prevState => ({ childDialogOpen: !prevState.childDialogOpen }));
  }

  evalAllQueriesForValidMedia = () => {
    const { queries, mediaUpdates } = this.props;
    const anyQueriesNoMedia = this.getAllActiveQueries(queries).filter(q => (q.uid !== mediaUpdates.uid) && q.media && q.media.length === 0).length; // if any query is missing media
    const thisCurrentQueryFormNoMedia = mediaUpdates && (mediaUpdates.media === undefined || mediaUpdates.media.length === 0) && mediaUpdates.sources.length === 0 && mediaUpdates.collections.length === 0;
    return anyQueriesNoMedia || thisCurrentQueryFormNoMedia;
  }

  render() {
    const { initialValues, onWillSearch, isEditable, selected, buttonLabel, onMediaDelete, onDateChange, handleLoadSearches, handleDeleteSearch, handleLoadSelectedSearch, savedSearches, searchNickname, handleSaveSearch,
      submitting, handleSubmit, onSave, onMediaChange, renderTextField, renderTextFieldWithFocus, handleCopyAll } = this.props;
    const { formatMessage } = this.props.intl;
    const cleanedInitialValues = initialValues ? { ...initialValues } : {};
    if (cleanedInitialValues.disabled === undefined) {
      cleanedInitialValues.disabled = false;
    }
    if (initialValues.collections && initialValues.collections.length && initialValues.collections[0].tags_id === ALL_MEDIA) {
      cleanedInitialValues.media = [{ id: ALL_MEDIA, label: formatMessage(messages.allMedia) }];
    } else {
      cleanedInitialValues.media = [ // merge intial sources and collections into one list for display with `renderFields`
        ...initialValues.sources,
        ...initialValues.collections,
      ];
    }
    selected.media = [ // merge sources and collections into one list for display with `renderFields`
      ...selected.sources,
      ...selected.collections,
    ];
    const currentQ = selected.q;
    let mediaLabel = formatMessage(localMessages.SandC);
    if (isEditable) {
      mediaLabel = formatMessage(localMessages.selectSandC);
    }
    const queriesMissingMedia = this.evalAllQueriesForValidMedia();
    if (!selected) { return null; }

    return (
      <form className="app-form query-form" name="queryForm" onSubmit={handleSubmit(onSave)}>
        <div className="query-form-wrapper">
          <Grid>
            <Row>
              <Col lg={4}>
                <div className="q-field-wrapper">
                  <div className="media-field-label query-field-label">
                    <span className="query-field-number">1</span>
                    <CopyAllComponent
                      label={formatMessage(localMessages.query)}
                      title={formatMessage(localMessages.copyQueryKeywordTitle)}
                      msg={formatMessage(localMessages.copyQueryKeywordMsg)}
                      onOk={() => handleCopyAll(KEYWORD)}
                    />
                  </div>
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
                </div>
                <div className="query-field-desc">
                  <FormattedMessage {...localMessages.queryDesc} />
                  &nbsp;
                  <QueryHelpDialog trigger={formatMessage(messages.queryHelpLink)} />
                </div>
              </Col>
              <Col lg={4}>
                <div className="media-field-wrapper" ref={this.myRef} id="mediaPicker">
                  <div className="media-field-label query-field-label">
                    <span className="query-field-number">2</span>
                    <CopyAllComponent
                      label={mediaLabel}
                      title={formatMessage(localMessages.copyQueryMediaTitle)}
                      msg={formatMessage(localMessages.copyQueryMediaMsg)}
                      onOk={() => handleCopyAll(MEDIA)}
                    />
                  </div>
                  <SourceCollectionsMediaForm
                    className="query-field"
                    form="queryForm"
                    destroyOnUnmount={false}
                    onDelete={onMediaDelete}
                    initialValues={cleanedInitialValues.media}
                    allowRemoval={isEditable}
                    name="media"
                    title="title"
                    intro="intro"
                  />
                  <div>
                    {isEditable
                    && (
                      <MediaPickerDialog
                        initMedia={selected.media ? selected.media : cleanedInitialValues.media}
                        onConfirmSelection={selections => onMediaChange(selections)}
                        setQueryFormChildDialogOpen={this.setQueryFormChildDialogOpen}
                      />
                    )}
                  </div>
                  <div className="query-field-desc">
                    <FormattedMessage {...localMessages.selectSandCDesc} />
                    &nbsp;
                    <MediaHelpDialog trigger={formatMessage(localMessages.selectSandCDescLink)} />
                  </div>
                </div>
              </Col>
              <Col lg={4}>
                <div className="dates-field-label query-field-label">
                  <span className="query-field-number">3</span>
                  <CopyAllComponent
                    label={formatMessage(localMessages.dates)}
                    title={formatMessage(localMessages.copyQueryDatesTitle)}
                    msg={formatMessage(localMessages.copyQueryDatesMsg)}
                    onOk={() => handleCopyAll(DATES)}
                  />
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
                  <div className="query-field-desc"><FormattedMessage {...localMessages.datesDesc} /></div>
                </div>
              </Col>
            </Row>
          </Grid>
        </div>
        <div className="query-form-actions-wrapper">
          <Grid>
            <Row>
              <Col lg={6} />
              <Col lg={6}>
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
                    disabled={(queriesMissingMedia > 0) || submitting}
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
  // from state
  queries: PropTypes.array,
  // from form helper
  updateQuery: PropTypes.func,
  handleSubmit: PropTypes.func,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  isEditable: PropTypes.bool.isRequired,
  focusRequested: PropTypes.func.isRequired,
  mediaUpdates: PropTypes.object,
};


const mapStateToProps = state => ({
  mediaUpdates: formSelector(state, 'uid', 'media', 'sources', 'collections'),
  queries: state.explorer.queries.queries ? state.explorer.queries.queries : null,
});

function validate(values, props) {
  const { formatMessage } = props.intl;
  const errors = {};
  if (!validDate(values.startDate) || !isValidSolrDate(values.startDate)) {
    errors.startDate = { _error: formatMessage(localMessages.invalidDateWarning) };
  }
  if (!validDate(values.endDate) || !isValidSolrDate(values.endDate)) {
    errors.endDate = { _error: formatMessage(localMessages.invalidDateWarning) };
  }
  if (validDate(values.startDate) && validDate(values.endDate) && isStartDateAfterEndDate(values.startDate, values.endDate)) {
    errors.startDate = { _error: formatMessage(localMessages.startDateWarning) };
  }
  if ((!values.collections || !values.collections.length)
    && (!values.sources || !values.sources.length)
    && (!values.media || !values.media.length)) {
    errors.media = { _error: formatMessage(localMessages.noMediaSpecified) };
  }
  return errors;
}

function warn(values, props) {
  const { formatMessage } = props.intl;
  const warnings = {};
  if ((!values.collections || !values.collections.length)
    && (!values.sources || !values.sources.length)
    && (!values.media || !values.media.length)) {
    warnings.media = { _warning: formatMessage(localMessages.noMediaSpecified) };
  }
  if (emptyString(values.q)) {
    const errString = formatMessage(localMessages.queryStringError, { name: values.label });
    warnings.q = { _warning: errString };
  }
  return warnings;
}

export default
withIntlForm(
  withHelp(localMessages.queryHelpTitle, localMessages.queryHelpContent)(
    reduxForm({ propTypes, validate, warn })(
      connect(mapStateToProps, null)(
        QueryForm
      ),
    ),
  ),
);
