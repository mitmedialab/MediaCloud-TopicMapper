import PropTypes from 'prop-types';
import React from 'react';
// import { formValueSelector } from 'redux-form';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import Divider from '@material-ui/core/Divider';
import AdvancedSearchForm from './AdvancedSearchForm';
import AdvancedSearchResultsContainer from './AdvancedSearchResultsContainer';
import PageTitle from '../../common/PageTitle';
import messages from '../../../resources/messages';

// const formSelector = formValueSelector('advancedQueryForm');

const localMessages = {
  mainTitle: { id: 'collection.maintitle', defaultMessage: 'Advanced Source/Collection Search' },
  addButton: { id: 'collection.add.save', defaultMessage: 'Search' },
};

class AdvancedSearchContainer extends React.Component {
  constructor(props) {
    super(props);
    const defaultQueryStr = (props.urlQueryString) ? props.urlQueryString : null;
    this.state = { queryStr: defaultQueryStr, tags: [] };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { urlQueryString } = this.props;
    if (nextProps.urlQueryString !== urlQueryString) {
      this.state = { queryStr: nextProps.urlQueryString, tags: [] };
    }
  }

  render() {
    const { formatMessage } = this.props.intl;
    let resultsContent = null;
    if ((this.state.queryStr) || (this.state.tags.length > 0)) {
      resultsContent = <AdvancedSearchResultsContainer searchString={this.state.queryStr} tags={this.state.tags} />;
    }
    return (
      <div>
        <PageTitle value={messages.search} />
        <Grid>
          <Row>
            <Col lg={12}>
              <h1><FormattedMessage {...localMessages.mainTitle} /></h1>
            </Col>
          </Row>
          <AdvancedSearchForm
            initialValues={{ advancedSearchQueryString: this.state.queryStr }}
            buttonLabel={formatMessage(localMessages.addButton)}
            onSearch={(values) => {
              const info = {
                queryStr: values.advancedSearchQueryString,
                tags: [],
              };
              if ('publicationCountry' in values) {
                info.tags.push(values.publicationCountry);
              }
              if ('publicationState' in values) {
                info.tags.push(values.publicationState);
              }
              if ('primaryLanguage' in values) {
                info.tags.push(values.primaryLanguage);
              }
              if ('countryOfFocus' in values) {
                info.tags.push(values.countryOfFocus);
              }
              if ('mediaType' in values) {
                info.tags.push(values.mediaType);
              }
              this.setState(info);
            }}
          />
          <br />
          <Divider />
          {resultsContent}
        </Grid>
      </div>
    );
  }
}

AdvancedSearchContainer.propTypes = {
  // from context
  intl: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired, // params from router
  location: PropTypes.object,
  // from dispatch
  // from url
  urlQueryString: PropTypes.string,
};

const mapStateToProps = (state, ownProps) => ({
  urlQueryString: ownProps.location.query.search,
});

export default
injectIntl(
  connect(mapStateToProps)(
    AdvancedSearchContainer
  ),
);
