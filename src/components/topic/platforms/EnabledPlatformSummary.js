import PropTypes from 'prop-types';
import React from 'react';
import { FormattedHTMLMessage, injectIntl } from 'react-intl';
import { platformIconUrl, platformNameMessage, sourceNameMessage } from './AvailablePlatform';
import PlatformDetailsInfo from './PlatformDetailsInfo';

const EnabledPlatformSummary = ({ platform }) => (
  <div className="platform-summary">
    <b>
      <img src={platformIconUrl(platform.platform, platform.source)} alt={platform.platform} />
      <FormattedHTMLMessage {...platformNameMessage(platform.platform, platform.source)} />
      &nbsp;
      (<FormattedHTMLMessage {...sourceNameMessage(platform.source)} />)
    </b>
    <PlatformDetailsInfo platform={platform} />
  </div>
);

EnabledPlatformSummary.propTypes = {
  // from parent
  platform: PropTypes.object.isRequired,
  // form context
  intl: PropTypes.object.isRequired,
};

export default injectIntl(EnabledPlatformSummary);
