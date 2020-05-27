import React from 'react';
import { HelpButton } from './IconButton';
import SimpleDialog from './SimpleDialog';

const HelpDialog = (props) => (
  <SimpleDialog
    trigger={<HelpButton color="lightgrey" />}
    {...props}
  />
);

HelpDialog.propTypes = SimpleDialog.propTypes;

export default HelpDialog;
