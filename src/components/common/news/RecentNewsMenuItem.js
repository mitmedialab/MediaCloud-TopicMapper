import PropTypes from 'prop-types';
import React from 'react';
import SanitizedHTML from 'react-sanitized-html';
import { injectIntl } from 'react-intl';

const RecentNewsMenuItem = props => (
  <div className="recent-news-menu-item">
    <span className={`news-type news-${props.item.type.toLowerCase()}`}>{props.item.type}</span>
    <SanitizedHTML className="news-note" html={props.item.note} />
  </div>
);

RecentNewsMenuItem.propTypes = {
  // from parent
  item: PropTypes.object,
};

export default
injectIntl(
  RecentNewsMenuItem
);
