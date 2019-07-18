import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import AsyncSelect from 'react-select/lib/Async';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';

// adapted from https://material-ui.com/demos/autocomplete/#react-select

const customStyles = {
  root: {
    flexGrow: 1,
  },
  input: {
    display: 'flex',
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },
  noOptionsMessage: {
    padding: '5px 10px',
    fontSize: 14,
  },
  singleValue: {
    fontSize: 16,
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    fontSize: 16,
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: 5,
    left: 0,
    right: 0,
  },
  divider: {
    height: 5 * 2,
  },
};


function InputComponent({ inputRef, ...props }) {
  return <div ref={inputRef} {...props} />;
}
InputComponent.propTypes = {
  inputRef: PropTypes.func,
};

function Control(props) {
  return (
    <TextField
      fullWidth
      InputProps={{
        inputComponent: InputComponent,
        inputProps: {
          style: props.selectProps.classes.input,
          inputRef: props.innerRef,
          children: props.children,
          ...props.innerProps,
        },
      }}
      {...props.selectProps.textFieldProps}
    />
  );
}
Control.propTypes = {
  selectProps: PropTypes.object,
  innerRef: PropTypes.func,
  children: PropTypes.node,
  innerProps: PropTypes.object,
};

function Menu(props) {
  return (
    <Paper square style={props.selectProps.classes.paper} {...props.innerProps}>
      {props.children}
    </Paper>
  );
}
Menu.propTypes = {
  selectProps: PropTypes.object,
  children: PropTypes.node,
  innerProps: PropTypes.object,
};

function NoOptionsMessage(props) {
  return (
    <Typography
      color="textSecondary"
      style={props.selectProps.classes.noOptionsMessage}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}
NoOptionsMessage.propTypes = {
  selectProps: PropTypes.object,
  children: PropTypes.node,
  innerProps: PropTypes.object,
};


function Option(props) {
  return (
    <MenuItem
      buttonRef={props.innerRef}
      selected={props.isFocused}
      component="div"
      style={{
        fontWeight: props.isSelected ? 500 : 400,
      }}
      {...props.innerProps}
    >
      {props.children}
    </MenuItem>
  );
}
Option.propTypes = {
  innerRef: PropTypes.func,
  isFocused: PropTypes.bool,
  isSelected: PropTypes.bool,
  selectProps: PropTypes.object,
  children: PropTypes.node,
  innerProps: PropTypes.object,
};

function Placeholder(props) {
  return (
    <Typography
      color="textSecondary"
      style={props.selectProps.classes.placeholder}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}
Placeholder.propTypes = {
  selectProps: PropTypes.object,
  children: PropTypes.node,
  innerProps: PropTypes.object,
};

function SingleValue(props) {
  return (
    <Typography style={props.selectProps.classes.singleValue} {...props.innerProps}>
      {props.children}
    </Typography>
  );
}
SingleValue.propTypes = {
  selectProps: PropTypes.object,
  children: PropTypes.node,
  innerProps: PropTypes.object,
};

function ValueContainer(props) {
  return <div style={props.selectProps.classes.valueContainer}>{props.children}</div>;
}
ValueContainer.propTypes = {
  selectProps: PropTypes.object,
  children: PropTypes.node,
};

const components = {
  Control,
  Menu,
  NoOptionsMessage,
  Option,
  Placeholder,
  SingleValue,
  ValueContainer,
};

const Autocomplete = (props) => {
  const { placeholder, options, onSelected } = props;
  const selectStyles = {
    input: base => ({
      ...base,
      // color: theme.palette.text.primary,
      '& input': {
        font: 'inherit',
      },
    }),
  };
  return (
    <div className="autocomplete" style={customStyles.root}>
      <Select
        classes={customStyles}
        style={selectStyles}
        options={options}
        components={components}
        onChange={onSelected}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
};
Autocomplete.propTypes = {
  placeholder: PropTypes.string,
  options: PropTypes.array, // an array of objects with value and label properties
  onSelected: PropTypes.func.isRequired,
};

export const AsyncAutocomplete = (props) => {
  const { placeholder, onLoadOptions, onSelected } = props;
  const selectStyles = {
    input: base => ({
      ...base,
      // color: theme.palette.text.primary,
      '& input': {
        font: 'inherit',
      },
    }),
  };
  const otherProperties = { // let the caller override things as they desire
    defaultValue: props.defaultValue || true,
    cacheOptions: props.cacheOptions || true,
    isDisabled: props.isDisabled || false,
    isClearable: props.isClearable || false,
  };
  return (
    <div className="autocomplete async-autocomplete" style={customStyles.root}>
      <AsyncSelect
        cacheOptions
        loadOptions={onLoadOptions}
        classes={customStyles}
        style={selectStyles}
        components={components}
        placeholder={placeholder}
        onChange={onSelected}
        {...otherProperties}
      />
    </div>
  );
};
AsyncAutocomplete.propTypes = {
  placeholder: PropTypes.string,
  onLoadOptions: PropTypes.func.isRequired,
  onSelected: PropTypes.func.isRequired,
  defaultValue: PropTypes.object,
  cacheOptions: PropTypes.array,
  isDisabled: PropTypes.bool,
  isClearable: PropTypes.bool,
};

export default Autocomplete;
