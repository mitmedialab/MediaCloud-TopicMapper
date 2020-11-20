import PropTypes from 'prop-types';
import React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { injectIntl } from 'react-intl';
import messages from '../../../resources/messages';
import UserMenuContainer from './UserMenuContainer';
import SubMenu from './Submenu';
import AdminAppMenu from './AdminAppMenu';
import { assetUrl } from '../../../lib/assetUtil';
import AppButton from '../AppButton';
import Permissioned from '../Permissioned';
import { PERMISSION_ADMIN } from '../../../lib/auth';
import { getAppName, APP_TOOLS } from '../../../config';

const SUPPORT_URL = 'https://mediacloud.org/support/';

const localMessages = {
  goHome: { id: 'nav.home', defaultMessage: 'Home' },
  admin: { id: 'nav.admin', defaultMessage: 'Admin' },
  support: { id: 'nav.support', defaultMessage: 'Support' },
  about: { id: 'nav.about', defaultMessage: 'About' },
};

const goToHome = (evt) => {
  evt.preventDefault();
  window.location.href = '/#/home';
};

const NavToolbar = (props) => {
  const { formatMessage } = props.intl;
  return (
    <div id="nav-toolbar">
      <Grid>
        <Row>
          <Col lg={6}>
          <a href={`#${formatMessage(localMessages.goHome)}`} onClick={evt => goToHome(evt)}>
              <img
                className="app-logo"
                alt={formatMessage(messages.suiteName)}
                src={assetUrl('/static/img/logo.png')}
                height={80}
              />
            </a>
          
          </Col>
          <Col lg={6}>
            <ul className="right">
              <Permissioned onlyRole={PERMISSION_ADMIN}>
                <li className="admin">
                  <AdminAppMenu />
                </li>
              </Permissioned>
              <li className="menu">
              <SubMenu
              intl={props.intl}
                 title={formatMessage(messages.menuToolDescription)}
                 label={formatMessage(messages.menuToolName)} />
             
              </li>
              <li className="support">
                <AppButton
                  variant="text"
                  href={SUPPORT_URL}
                  target="new"
                  label={formatMessage(localMessages.support)}
                />
              </li>
              {(getAppName() !== APP_TOOLS) && (
                <li className="about">
                  <AppButton
                    variant="text"
                    href="#/about"
                    label={formatMessage(messages.menuAbout)}
                  />
                </li>
              )}
           
              <li className="user-menu-item">
                <UserMenuContainer />
              </li>
            </ul>
          </Col>
        </Row>
      </Grid>
    </div>
  );
};

NavToolbar.propTypes = {
  // from composition chain
  intl: PropTypes.object.isRequired,
};

export default
  injectIntl(
    NavToolbar
  );
