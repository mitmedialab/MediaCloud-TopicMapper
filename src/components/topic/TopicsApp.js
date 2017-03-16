import React from 'react';
import { injectIntl } from 'react-intl';
import Title from 'react-title-component';
import AppContainer from '../AppContainer';
import TopicsDrawer from './TopicsDrawer';
import messages from '../../resources/messages';
import TopicsSubHeaderContainer from './TopicsSubHeaderContainer';

const TopicsApp = (props) => {
  const { formatMessage } = props.intl;
  const titleHandler = parentTitle => `${formatMessage(messages.topicsToolName)} | ${parentTitle}`;
  const drawer = <TopicsDrawer />;
  return (
    <div>
      <Title render={titleHandler} />
      <AppContainer
        name="topics"
        title={formatMessage(messages.topicsToolName)}
        description={formatMessage(messages.topicsToolDescription)}
        drawer={drawer}
        subHeader={<TopicsSubHeaderContainer />}
      >
        {props.children}
      </AppContainer>
    </div>
  );
};

TopicsApp.propTypes = {
  children: React.PropTypes.node,
  intl: React.PropTypes.object.isRequired,
};

export default
  injectIntl(
    TopicsApp
  );
