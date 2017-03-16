import React from 'react';
import { injectIntl } from 'react-intl';
import Title from 'react-title-component';
import AppContainer from '../AppContainer';
import messages from '../../resources/messages';

const ToolsApp = (props) => {
  const { formatMessage } = props.intl;
  const titleHandler = parentTitle => `${formatMessage(messages.toolsAppName)} | ${parentTitle}`;
  return (
    <div>
      <Title render={titleHandler} />
      <AppContainer
        name="tools"
        title={formatMessage(messages.toolsAppName)}
        description={formatMessage(messages.toolsAppDescription)}
      >
        {props.children}
      </AppContainer>
    </div>
  );
};

ToolsApp.propTypes = {
  children: React.PropTypes.node,
  intl: React.PropTypes.object.isRequired,
};

export default
  injectIntl(
    ToolsApp
  );
