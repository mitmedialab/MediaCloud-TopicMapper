import React from 'react';
import { injectIntl } from 'react-intl';
import Title from 'react-title-component';
import AppContainer from '../AppContainer';
import SourcesDrawer from './SourcesDrawer';
import messages from '../../resources/messages';
import SourceMgrSubHeaderContainer from './SourceMgrSubHeaderContainer';

const SourcesApp = (props) => {
  const { formatMessage } = props.intl;
  const titleHandler = parentTitle => `${formatMessage(messages.sourcesToolName)} | ${parentTitle}`;
  const drawer = <SourcesDrawer />;
  return (
    <div>
      <Title render={titleHandler} />
      <AppContainer
        name="sources"
        title={formatMessage(messages.sourcesToolName)}
        description={formatMessage(messages.sourcesToolDescription)}
        drawer={drawer}
        subHeader={<SourceMgrSubHeaderContainer />}
      >
        {props.children}
      </AppContainer>
    </div>
  );
};

SourcesApp.propTypes = {
  children: React.PropTypes.node,
  intl: React.PropTypes.object.isRequired,
};

export default
  injectIntl(
    SourcesApp
  );
