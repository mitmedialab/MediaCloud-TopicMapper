import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { reduxForm, FieldArray, Field, propTypes } from 'redux-form';
import withHelp from '../hocs/HelpfulContainer';
import withIntlForm from '../hocs/IntlForm';
import SourceOrCollectionWidget from '../SourceOrCollectionWidget';
import { urlToSource, urlToCollection } from '../../../lib/urlUtil';
import messages from '../../../resources/messages';

const localMessages = {
  helpTitleMsg: { id: 'explorer.results.attention.helpTitle', defaultMessage: 'Select Media' },
  helpContentMsg: { id: 'explorer.results.attention.helpMessage', defaultMessage: 'Our collection of media sources is closely aligned with topics we have researched before, and doesn\'t represent a balanced list of media sources that represent the media ecosystem online. For instance, because we have done deep research on gender and reproductive rights, we have an over-representation of blogs and media outlets that cover those issues. The same is true for public health and international development. You should try to avoid searching all sources. Click \'Add Media\' and pick some specific sources, or country-based collections to localize your search and get more representative results.' },
};

const goToSourceManager = (obj) => {
  let url = null;
  if (obj.tag_set_name === 'collection') {
    url = urlToCollection(obj.id);
  } else {
    url = urlToSource(obj.id);
  }
  window.open(url, '_blank');
};

const renderCollectionSelector = ({ allowRemoval, showWarningIfEmpty, helpButton, fields, onDelete }) => {
  let warningInfo = null;
  if (showWarningIfEmpty && fields.length === 0) {
    warningInfo = (
      <div className="media-picker-no-media-warning">
        <FormattedMessage {...messages.noMedia} />
        {helpButton}
      </div>
    );
  }
  return (
    <div>
      {warningInfo}
      {fields.map((name, index) => (
        <Field
          key={name}
          name={name}
          component={(info) => {
            const handleDelete = (allowRemoval || info.meta.dirty) && fields.length > 0 ? () => { fields.remove(index); onDelete(info.input.value); } : undefined;
            const val = info.input.value;
            let tempObj = {};
            if (val && typeof val === 'number') {
              tempObj.id = val;
            } else {
              tempObj = info.input.value;
            }
            return (
              <SourceOrCollectionWidget object={tempObj} onClick={() => goToSourceManager(tempObj)} onDelete={handleDelete} />
            );
          }}
        />
      ))}
    </div>
  );
};

renderCollectionSelector.propTypes = {
  fields: PropTypes.object,
  meta: PropTypes.object,
  allowRemoval: PropTypes.bool,
  validate: PropTypes.func,
  onDelete: PropTypes.func,
  showWarningIfEmpty: PropTypes.bool,
  helpButton: PropTypes.node.isRequired,
};

const SourceCollectionsFieldList = (props) => {
  const { initialValues, allowRemoval, onDelete, helpButton } = props;
  return (
    <div className="explorer-source-collection-form">
      <FieldArray
        form={propTypes.form}
        name="media"
        validate={propTypes.validate}
        warn={propTypes.warn}
        allowRemoval={allowRemoval}
        showWarningIfEmpty
        component={renderCollectionSelector}
        initialValues={initialValues}
        helpButton={helpButton}
        onDelete={onDelete} // call back up to update the selected media array and hence sources and collections
      />
    </div>
  );
};

SourceCollectionsFieldList.propTypes = {
  // from parent
  intl: PropTypes.object.isRequired,
  initialValues: PropTypes.object,
  selected: PropTypes.object,
  allowRemoval: PropTypes.bool,
  showWarningIfEmpty: PropTypes.bool,
  onDelete: PropTypes.func,
  helpButton: PropTypes.node.isRequired,
};

export default
injectIntl(
  withHelp(localMessages.helpTitleMsg, localMessages.helpContentMsg)(
    withIntlForm(
      reduxForm({ propTypes })(
        SourceCollectionsFieldList
      )
    )
  )
);
