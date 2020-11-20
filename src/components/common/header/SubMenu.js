import PropTypes from 'prop-types';
import React from 'react';
import Popover from '@material-ui/core/Popover';
import {  injectIntl } from 'react-intl';
import TopicsAppMenu from './TopicsAppMenu';
import ExplorerAppMenu from './ExplorerAppMenu';
import AppButton from '../AppButton';
import SourcesAppMenu from './SourcesAppMenu';
import { defaultMenuOriginProps } from '../../util/uiUtil';
import messages from '../../../resources/messages';


class SubMenu extends React.Component {
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
  const { formatMessage } = this.props.intl;
    const { title, label } = this.props;
    return (
      <div className="menu">
           <AppButton
                  variant="text"
                  href='#'
                  title={title}
                  label={label}
                  onClick={this.handleToggle} 
                />
        <Popover
          open={Boolean(this.state.anchorEl)}
          anchorEl={this.state.anchorEl}
          {...defaultMenuOriginProps}
          onClose={this.handleRequestClose}
        >
          <ul className="submenulist">
            <li className="explorer">
              <ExplorerAppMenu />
            </li>
            <li className="topics">
              <TopicsAppMenu />
            </li>
            <li className="sources">
              <SourcesAppMenu />
            </li>
            <li>
            <AppButton
                  variant="text"
                  target="new"
                  label={formatMessage(messages.mediaDataToolName)}
                />
            </li>
          </ul>
        </Popover>
      </div>
    );
  }
}

SubMenu.propTypes = {
  // from parent
  title: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  intl: PropTypes.shape({}).isRequired
};

export default
  injectIntl(
    SubMenu
  );
