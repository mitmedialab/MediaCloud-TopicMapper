import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm, FieldArray, Field, propTypes } from 'redux-form';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import withIntlForm from './hocs/IntlForm';

const localMessages = {
  label: { id: 'system.label', defaultMessage: '{label}' },
};

const TwitterCheckboxSelector = ({ initialValues, renderCheckbox, onChange, intl: { formatMessage }, fields }) => (
  <ul>
    {fields.map((name, index, thisFieldArray) => { // redux-form overrides map, and converts name to a string instead of an object!
      const fieldObject = thisFieldArray.get(index);
      const content = (
        <li key={index}>
          <Field
            initialValues={initialValues}
            key={index}
            name={`${name}.label`}
            component={info => (
              <div>
                {renderCheckbox({
                  ...info,
                  label: formatMessage(localMessages.label, { label: fieldObject.label }),
                  input: {
                    ...info.input,
                    ...fieldObject,
                    value: fieldObject.selected || false,
                    onChange: newValue => onChange({ ...info.input, ...fieldObject, value: newValue }),
                  },
                })}
              </div>
            )}
            label={`${name}.label`}
          />
        </li>
      );
      return content;
    })}
  </ul>
);

TwitterCheckboxSelector.propTypes = {
  fields: PropTypes.object,
  initialValues: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),
  renderCheckbox: PropTypes.func.isRequired,
  intl: PropTypes.object,
  onChange: PropTypes.func,
};

const TwitterCheckboxList = injectIntl(withIntlForm(TwitterCheckboxSelector));

const TwitterCheckboxFieldArray = (props) => (
  <div>
    <FieldArray
      name="channel"
      form={propTypes.form}
      component={TwitterCheckboxList}
      initialValues={props.initialValues}
      onChange={props.onChange}
    />
  </div>
);

TwitterCheckboxFieldArray.propTypes = {
  // from parent
  intl: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  initialValues: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),
  initVal: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),
  onChange: PropTypes.func,
};

const mapStateToProps = (state, ownProps) => ({
  // trick to get the values to update as we click the checkboxes
  initialValues: { channel: ownProps.initVal },
});

export default
injectIntl(
  withIntlForm(
    reduxForm({ propTypes })(
      connect(mapStateToProps)(
        TwitterCheckboxFieldArray
      )
    )
  )
);
