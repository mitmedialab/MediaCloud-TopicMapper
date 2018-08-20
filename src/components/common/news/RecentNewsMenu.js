import PropTypes from 'prop-types';
import React from 'react';
import Popover from '@material-ui/core/Popover';
import { FormattedMessage, injectIntl } from 'react-intl';
import Link from 'react-router/lib/Link';
import { NotificationsButton } from '../IconButton';
import messages from '../../../resources/messages';
import RecentNewsMenuItem from './RecentNewsMenuItem';
import { defaultMenuOriginProps } from '../../util/uiUtil';

const localMessages = {
  releaseNotes: { id: 'recentNewsMenu.releaseNotes', defaultMessage: 'Read More Release Notes' },
};

class RecentNewsMenu extends React.Component {

  state = {
    anchorEl: null,
  };

  handleToggle = (event) => {
    event.preventDefault(); // This prevents ghost click.
    this.setState({
      anchorEl: event.currentTarget,
    });
  }

  handleRequestClose = () => {
    this.setState({
      anchorEl: null,
    });
  };

  render() {
    const { newsItems, subTitle } = this.props;
    return (
      <div className="recent-news-menu">
        <NotificationsButton onClick={this.handleToggle} color={'#FFFFFF'} />
        <Popover
          open={Boolean(this.state.anchorEl)}
          anchorEl={this.state.anchorEl}
          {...defaultMenuOriginProps}
          onClose={this.handleRequestClose}
        >
          <div className="recent-news-menu-content">
            <h3> <FormattedMessage {...messages.recentNews} /> <small>{subTitle}</small></h3>
            <div className="recent-news-menu-items">
              {newsItems.map((item, idx) => <RecentNewsMenuItem item={item} key={`item${idx}`} />)}
            </div>
            <div className="recent-news-menu-link">
              <Link to="recent-news" onClick={this.handleRequestClose}><FormattedMessage {...localMessages.releaseNotes} /></Link>
            </div>
          </div>
        </Popover>
      </div>
    );
  }

}

RecentNewsMenu.propTypes = {
  // from parent
  newsItems: PropTypes.array.isRequired,
  subTitle: PropTypes.string.isRequired,
};

export default
  injectIntl(
    RecentNewsMenu
  );
