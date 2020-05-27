import PropTypes from 'prop-types';
import React from 'react';
import Link from 'react-router/lib/Link';
import { FormattedMessage, injectIntl } from 'react-intl';
import withHelp from '../../common/hocs/HelpfulContainer';
import { AddButton } from '../../common/IconButton';

const localMessages = {
  createSnapshot: { id: 'snapshot.create', defaultMessage: 'Create a new snapshot' },
  helpTitle: { id: 'snapshot.help.title', defaultMessage: 'About Snapshots' },
  helpText: { id: 'snapshot.help.text',
    defaultMessage: '<p>A Snapshot is a frozen-in-time collection of all the content in your Topic.  You can\'t change anything within a Snapshot; you can just browse and explore it.  If you want to make any changes you need to generate a new Snapshot.  They are frozen-in-time so you can use them for reproduceable research; you wouldn\'t want your changing out from under you while you are analyzing it, or once you have published a report.</p><p>Click the arrow to see a popup list of the other Snapshots within this topic.  Click one from the list that appears to switch to it.</p>',
  },
};

const CreateSnapshotButton = (props) => {
  const { helpButton, topicId } = props;
  const { formatMessage } = props.intl;
  return (
    <div className="create-snapshot">
      <AddButton
        tooltip={formatMessage(localMessages.createSnapshot)}
        linkTo={`/topics/${topicId}/snapshot`}
      />
      <Link to={`/topics/${topicId}/snapshot`}>
        <span className="message"><FormattedMessage {...localMessages.createSnapshot} /></span>
      </Link>
      {helpButton}
    </div>
  );
};

CreateSnapshotButton.propTypes = {
  intl: PropTypes.object.isRequired,
  topicId: PropTypes.number.isRequired,
  helpButton: PropTypes.node.isRequired,
};

export default
injectIntl(
  withHelp(localMessages.helpTitle, localMessages.helpText)(
    CreateSnapshotButton
  )
);
