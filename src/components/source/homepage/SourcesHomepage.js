import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { Grid, Container, Box } from '@material-ui/core';
import FeaturedCollectionsContainer from './FeaturedCollectionsContainer';
import FavoriteSourcesAndCollectionsContainer from './FavoriteSourcesAndCollectionsContainer';
import SourceControlBar from '../controlbar/SourceControlBar';
import Permissioned from '../../common/Permissioned';
import { PERMISSION_MEDIA_EDIT, PERMISSION_LOGGED_IN } from '../../../lib/auth';
import { AddButton } from '../../common/IconButton';
import DataCard from '../../common/DataCard';
import LoginForm from '../../user/LoginForm';
import messages from '../../../resources/messages';
import Masthead from '../../common/header/Masthead';
import SourcesMarketingFeatureList from './SourcesMarketingFeatureList';
import SystemStatsContainer from '../../common/statbar/SystemStatsContainer';

const localMessages = {
  title: { id: 'sources.intro.title', defaultMessage: 'Explore our Sources and Collections' },
  intro: { id: 'explorer.intro.title', defaultMessage: 'Investigate Global News with Media Cloud' },
  about: { id: 'explorer.intro.subtitle', defaultMessage: 'We add sources and create collections from media ecosystems around the world. In order to identify the right sources, we use a combination of automated search and discovery, identified lists of influential sources, and expert input from journalists and media practitioners. You can also ' },
  suggestLink: { id: 'sources.intro.suggestLink', defaultMessage: 'suggest a source.' },
  browseCountry: { id: 'sources.into.browse.mediacloud', defaultMessage: 'Browse Country Collections' },
  browseCountryAbout: { id: 'sources.into.browse.mediacloud.about', defaultMessage: 'See all the global country and state-level collections we\'ve imported from <a href="http://www.abyznewslinks.com/">ABYZ</a>.' },
  browseMC: { id: 'sources.into.browse.mediacloud', defaultMessage: 'Browse Custom Collections' },
  browseMCabout: { id: 'sources.into.browse.mediacloud.about', defaultMessage: 'See all the collections our team has put together to support our various investigations.' },
  created: { id: 'sources.intro.created', defaultMessage: "Collections I've created" },
  loginTitle: { id: 'sources.intro.login.title', defaultMessage: 'Have an Account? Login Now' },
  addCollection: { id: 'source.controlbar.addCollection', defaultMessage: 'Create a Collection' },
  addSource: { id: 'source.controlbar.addSource', defaultMessage: 'Add a Source' },
};

const SourcesHomepage = (props) => {
  const { user } = props;
  const sideBarContent = (
    <Box pt={3}>
      {user.isLoggedIn && <FavoriteSourcesAndCollectionsContainer />}
      {!user.isLoggedIn && (
        <DataCard>
          <h2><FormattedMessage {...localMessages.loginTitle} /></h2>
          <LoginForm />
        </DataCard>
      )}
    </Box>
  );
  return (
    <div className="homepage">
      <Masthead
        nameMsg={messages.sourcesToolName}
        descriptionMsg={messages.sourcesToolDescription}
        link="https://mediacloud.org/tools/"
      />
      <Permissioned onlyRole={PERMISSION_LOGGED_IN}>
        <SourceControlBar showSearch>
          <Permissioned onlyRole={PERMISSION_MEDIA_EDIT}>
            <Container maxWidth="lg">
              <Link to="collections/create">
                <AddButton />
                <FormattedMessage {...localMessages.addCollection} />
              </Link>
              &nbsp; &nbsp;
              <Link to="sources/create">
                <AddButton />
                <FormattedMessage {...localMessages.addSource} />
              </Link>
            </Container>
          </Permissioned>
        </SourceControlBar>
      </Permissioned>
      <Container maxWidth="md">
        <Grid container spacing={3}>
          <Grid item md={6} xs={12}>
            <h1><FormattedMessage {...localMessages.intro} /></h1>
            <p>
              <FormattedHTMLMessage {...localMessages.about} />
              <Link to="/sources/suggest"><FormattedMessage {...localMessages.suggestLink} /></Link>
            </p>
          </Grid>
          <Grid item md={6} xs={12}>
            {sideBarContent}
          </Grid>
        </Grid>
      </Container>

      <Permissioned onlyRole={PERMISSION_LOGGED_IN}>
        <FeaturedCollectionsContainer />
      </Permissioned>

      <SourcesMarketingFeatureList />

      <Container maxWidth="lg">
        <SystemStatsContainer />
      </Container>

    </div>
  );
};

SourcesHomepage.propTypes = {
  intl: PropTypes.object.isRequired,
  // from context
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired, // params from router
  // from state
  user: PropTypes.object.isRequired,
  // from dispatch
  goToUrl: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  user: state.user,
});

const mapDispatchToProps = dispatch => ({
  goToUrl: (url) => {
    dispatch(push(url));
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    SourcesHomepage
  )
);
