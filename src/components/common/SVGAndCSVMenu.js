import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { DownloadButton } from './IconButton';
import { ACTION_MENU_ITEM_CLASS } from '../../lib/explorerUtil';

const localMessages = {
  downloadSVG: { id: 'explorer.themes.downloadSvg', defaultMessage: 'Download { name } SVG' },
  downloadCSV: { id: 'explorer.themes.downloadCsv', defaultMessage: 'Download { name } CSV' },
};

const SVGAndCSVMenu = (props) => {
  const { downloadCsv, downloadSvg, label, idx } = props;
  return [(
    <MenuItem
      key={`${idx}-csv`}
      className={ACTION_MENU_ITEM_CLASS}
      onClick={() => downloadCsv(label)}
    >
      <ListItemText>
        <FormattedMessage {...localMessages.downloadCSV} values={{ name: label }} />
      </ListItemText>
      <ListItemIcon>
        <DownloadButton />
      </ListItemIcon>
    </MenuItem>
  ),
  (
    <MenuItem
      key={`${idx}-svg`}
      className={ACTION_MENU_ITEM_CLASS}
      onClick={() => downloadSvg(label)}
    >
      <ListItemText>
        <FormattedMessage {...localMessages.downloadSVG} values={{ name: label }} />
      </ListItemText>
      <ListItemIcon>
        <DownloadButton />
      </ListItemIcon>
    </MenuItem>
  )];
};

SVGAndCSVMenu.propTypes = {
  children: PropTypes.node,
  intl: PropTypes.object.isRequired,
  downloadCsv: PropTypes.func.isRequired,
  downloadSvg: PropTypes.func,
  label: PropTypes.string.isRequired,
  idx: PropTypes.number,
};

export default injectIntl(SVGAndCSVMenu);
