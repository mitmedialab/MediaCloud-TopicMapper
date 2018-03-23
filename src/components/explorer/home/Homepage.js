import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { schemeCategory10 } from 'd3';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import DataCard from '../../common/DataCard';
import LoginForm from '../../user/LoginForm';
import SearchForm from './SearchForm';
import SampleSearchContainer from './SampleSearchContainer';
import { getDateRange, solrFormat, PAST_MONTH } from '../../../lib/dateUtil';
import { getUserRoles, hasPermissions, PERMISSION_LOGGED_IN } from '../../../lib/auth';
import { DEFAULT_COLLECTION_OBJECT_ARRAY, generateQueryParamString, autoMagicQueryLabel } from '../../../lib/explorerUtil';
import { emptyString } from '../../../lib/formValidators';
import MarketingFeatureList from './MarketingFeatureList';
import SystemStatsContainer from '../../common/statbar/SystemStatsContainer';
import messages from '../../../resources/messages';
import Masthead from '../../common/header/Masthead';

const localMessages = {
  title: { id: 'explorer.intro.title', defaultMessage: 'Explorer' },
  subtitle: { id: 'explorer.intro.subtitle', defaultMessage: 'Explore Online News with Media Cloud' },
  description: { id: 'explorer.intro.description', defaultMessage: 'Use the Media Cloud Explorer to search half a billion stories from more than 50,000 sources. We pull in stories from online news media, blogs, and other sources to let you research media attention to issues you are interested in. Track shifts in media attention, identify competing media narratives, compare coverage in different media sectors - these are all tasks Media Cloud can help you with.' },
  loginTitle: { id: 'explorer.intro.login.title', defaultMessage: 'Have an Account? Login Now' },
};

const Homepage = (props) => {
  const { user, onKeywordSearch } = props;
  let sideBarContent;
  if (!user.isLoggedIn) {
    sideBarContent = (
      <Grid>
        <Row>
          <Col lg={1} />
          <Col lg={5}>
            <h1><FormattedMessage {...localMessages.subtitle} /></h1>
            <p><FormattedMessage {...localMessages.description} /></p>
          </Col>
          <Col lg={1} />
          <Col lg={4}>
            <DataCard>
              <h2><FormattedMessage {...localMessages.loginTitle} /></h2>
              <LoginForm />
            </DataCard>
          </Col>
        </Row>
      </Grid>
    );
  }
  return (
    <div className="homepage">
      <Masthead
        nameMsg={messages.explorerToolName}
        descriptionMsg={messages.explorerToolDescription}
        link="https://mediacloud.org/tools/"
      />
      <div className="search-section">
        <Grid>
          <Row>
            <Col lg={12}>
              <SearchForm onSearch={val => onKeywordSearch(val, user)} user={user} />
            </Col>
          </Row>
        </Grid>
      </div>
      <SampleSearchContainer />
      {sideBarContent}
      <MarketingFeatureList />
      <Grid>
        <SystemStatsContainer />
      </Grid>
    </div>
  );
};

Homepage.propTypes = {
  intl: PropTypes.object.isRequired,
  // from context
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,       // params from router
  onKeywordSearch: PropTypes.func.isRequired,
  // from state
  user: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  user: state.user,
});

const mapDispatchToProps = dispatch => ({
  onKeywordSearch: (values, user) => {
    let urlParamString;
    const keyword = emptyString(values.keyword) ? '' : values.keyword;
    if (hasPermissions(getUserRoles(user), PERMISSION_LOGGED_IN)) {
      const defaultDates = getDateRange(PAST_MONTH);
      const queries = [{
        q: keyword,
        startDate: solrFormat(defaultDates.start),
        endDate: solrFormat(defaultDates.end),
        color: schemeCategory10[0],
        collections: DEFAULT_COLLECTION_OBJECT_ARRAY,
        sources: [],
      }];
      queries[0].label = autoMagicQueryLabel(queries[0]);
      const queryStr = generateQueryParamString(queries);
      urlParamString = `search?q=${queryStr}`;
    } else {
      const queryStr = `[{"q":"${encodeURIComponent(keyword)}"}]`;
      urlParamString = `demo/search?q=${queryStr}`;
    }
    dispatch(push(`/queries/${urlParamString}&auto=true`));
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      Homepage
    )
  );
