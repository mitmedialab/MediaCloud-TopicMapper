import PropTypes from 'prop-types';
import React from 'react';
import Link from 'react-router/lib/Link';
import IconButton from '@material-ui/core/IconButton';
import { injectIntl } from 'react-intl';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import ErrorIcon from '@material-ui/icons/Error';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';
import SaveIcon from '@material-ui/icons/Save';
import SearchIcon from '@material-ui/icons/Search';
import PlayIcon from '@material-ui/icons/PlayCircleFilled';
import PauseIcon from '@material-ui/icons/PauseCircleFilled';
import NextIcon from '@material-ui/icons/SkipNext';
import PreviousIcon from '@material-ui/icons/SkipPrevious';
import NotificationsIcon from '@material-ui/icons/Notifications';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import PersonIcon from '@material-ui/icons/Person';

import slugify from 'slugify';
import messages from '../../resources/messages';
import ExploreIcon from './icons/ExploreIcon';
import DownloadIcon from './icons/DownloadIcon';
import DeleteIcon from './icons/DeleteIcon';
import AddIcon from './icons/AddIcon';
import AddQueryIcon from './icons/AddQueryIcon';
import EditIcon from './icons/EditIcon';
import HomeIcon from './icons/HomeIcon';
import FilledStarIcon from './icons/FilledStarIcon';
import EmptyStarIcon from './icons/EmptyStarIcon';
import SettingsIcon from './icons/SettingsIcon';
import RemoveIcon from './icons/RemoveIcon';
import HelpIcon from './icons/HelpIcon';
import CloseIcon from './icons/CloseIcon';
import MoreOptionsIcon from './icons/MoreOptionsIcon';
import ResetIcon from './icons/ResetIcon';
import FilterIcon from './icons/FilterIcon';
import { getBrandDarkColor, getBrandDarkerColor } from '../../styles/colors';

/**
 * The wrapper for our custom icons.  The idea is that you define all the SVG icons in individual
 * Components in the `icons` directory, then export wrapper instances of them here.
 */
/**
 * The wrapper for our custom icons.  The idea is that you define all the SVG icons in individual
 * Components in the `icons` directory, then export wrapper instances of them here.
 */
function composeIconButton(Icon, defaultTooltipMessage, useBackgroundColor = true,
  defaultWidth = undefined, defaultHeight = undefined) {
  class AppIconButton extends React.Component {
    state = {
      backgroundColor: getBrandDarkColor(),
      // color: 'primary',
    };
    handleMouseEnter = () => {
      this.setState({ backgroundColor: getBrandDarkerColor() });
    }
    handleMouseLeave = () => {
      this.setState({ backgroundColor: getBrandDarkColor() });
    }
    handleClick = (event) => {
      const { onClick } = this.props;
      event.preventDefault();
      if (onClick) {
        onClick(event);
      }
    }
    render() {
      const { linkTo, onClick, color, tooltip, backgroundColor } = this.props;
      const { formatMessage } = this.props.intl;
      const displayTooltip = ((tooltip !== undefined) && (tooltip !== null)) ? tooltip : formatMessage(defaultTooltipMessage);
      const linkTarget = linkTo || null;
      const clickHandler = (onClick) ? this.handleClick : null;
      let bC = '';
      if (backgroundColor) {
        bC = backgroundColor;
      } else if (useBackgroundColor === true) {
        bC = this.state.backgroundColor;
      }
      const button = (
        <IconButton
          tooltip={displayTooltip}
          style={{ padding: 0, border: 0, width: defaultWidth || 26, height: defaultHeight || 26, color, backgroundColor: bC }}
          onClick={clickHandler}
        >
          <Icon color={this.state.color} />
        </IconButton>
      );
      let content;
      if (linkTarget) {
        content = (
          <Link
            to={linkTarget}
            onTouchTap={clickHandler}
            className="icon-button-link"
            name={displayTooltip}
            onMouseEnter={this.handleMouseEnter}
            onMouseLeave={this.handleMouseLeave}
          >
            {button}
          </Link>
        );
      } else {
        content = button;
      }
      return (
        <div className={`icon-button icon-button-${slugify(displayTooltip).toLowerCase()}`}>
          {content}
        </div>
      );
    }
  }
  AppIconButton.propTypes = {
    onClick: PropTypes.func,
    linkTo: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]),
    iconStyle: PropTypes.object,
    tooltip: PropTypes.string,
    intl: PropTypes.object.isRequired,
    color: PropTypes.string,
    backgroundColor: PropTypes.string,  // overrides everything else
  };
  return injectIntl(AppIconButton);
}

export const ExploreButton = composeIconButton(ExploreIcon, messages.explore);

export const DownloadButton = composeIconButton(DownloadIcon, messages.download);

export const HelpButton = composeIconButton(HelpIcon, messages.help, false);

export const DeleteButton = composeIconButton(DeleteIcon, messages.delete, false);

export const RemoveButton = composeIconButton(RemoveIcon, messages.remove, false);

export const AddButton = composeIconButton(AddIcon, messages.add);

export const AddQueryButton = composeIconButton(AddQueryIcon, messages.add, false);

export const FavoriteButton = composeIconButton(FilledStarIcon, messages.unfavorite, false);

export const FavoriteBorderButton = composeIconButton(EmptyStarIcon, messages.favorite);

export const ArrowDropDownButton = composeIconButton(ArrowDropDownIcon, messages.open, false);

export const ArrowDropUpButton = composeIconButton(ArrowDropUpIcon, messages.close, false);

export const SettingsButton = composeIconButton(SettingsIcon, messages.settings);

export const ReadItNowButton = composeIconButton(OpenInNewIcon, messages.readItNow, false);

export const EditButton = composeIconButton(EditIcon, messages.edit, true);

export const ErrorButton = composeIconButton(ErrorIcon, messages.error, false);

export const EyeButton = composeIconButton(RemoveRedEyeIcon, messages.monitored, false);

export const MoreOptionsButton = composeIconButton(MoreOptionsIcon, messages.moreOptions);

export const CloseButton = composeIconButton(CloseIcon, messages.close);

export const ResetButton = composeIconButton(ResetIcon, messages.reset);

export const FilterButton = composeIconButton(FilterIcon, messages.filter, false, 45, 45);

export const SaveButton = composeIconButton(SaveIcon, messages.save);

export const SearchButton = composeIconButton(SearchIcon, messages.search, false);

export const HomeButton = composeIconButton(HomeIcon, messages.home);

export const PlayButton = composeIconButton(PlayIcon, messages.play, false);

export const PauseButton = composeIconButton(PauseIcon, messages.pause, false);

export const NextButton = composeIconButton(NextIcon, messages.skipNext, false);

export const PreviousButton = composeIconButton(PreviousIcon, messages.skipPrevious, false);

export const NotificationsButton = composeIconButton(NotificationsIcon, messages.recentNews, false);

export const NotificationsActivesButton = composeIconButton(NotificationsActiveIcon, messages.recentNews, false);

export const PersonButton = composeIconButton(PersonIcon, messages.userLogin, false);
