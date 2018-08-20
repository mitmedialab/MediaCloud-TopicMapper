import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';

const localMessages = {
  title: { id: 'story.cached.title', defaultMessage: 'Cached Story' },
  intro: { id: 'story.cached.intro', defaultMessage: 'Originally published on {{ publishDate }} in {{ ref }}. Collected on {{ collectDate }}.' },
};

const StoryCached = (props) => {
  const { story } = props;
  return (
    <div>
      <h1>{story.title}</h1>
      <h3><FormattedMessage {...localMessages.intro} values={{ publishDate: story.publish_date, ref: `<a href="${story.media.url}">${story.media.name}/a>`, collectDate: story.collect_date }} /></h3>
      <pre>
        {story.text}
      </pre>
    </div>
  );
};

StoryCached.propTypes = {
  // from parent
  story: PropTypes.object.isRequired,
  storiesId: PropTypes.number.isRequired,
  // from context
  intl: PropTypes.object.isRequired,
  helpButton: PropTypes.node.isRequired,
};

export default
  injectIntl(
    StoryCached
  );
