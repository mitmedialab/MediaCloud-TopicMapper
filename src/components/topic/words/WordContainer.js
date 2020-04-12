import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { selectWord } from '../../../actions/topicActions';
import WordDetails from './WordDetails';
import WordWordsContainer from './WordWordsContainer';
import WordStoriesContainer from './WordStoriesContainer';
import WordSplitStoryCountContainer from './WordSplitStoryCountContainer';
import WordInContextContainer from './WordInContextContainer';
import WordSimilarWordsContainer from './WordSimilarWordsContainer';
import TopicPageTitle from '../TopicPageTitle';

const localMessages = {
  mainTitle: { id: 'word.details.mainTitle', defaultMessage: 'Word: "{title}"' },
};

class WordContainer extends React.Component {
  /* not an async */
  UNSAFE_componentWillMount() {
    const { saveParamsToStore } = this.props;
    saveParamsToStore(this.props, this);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.params.word !== this.props.params.word) {
      const { saveParamsToStore } = nextProps;
      saveParamsToStore(nextProps, this);
    }
  }

  render() {
    const { topicId, stem, term, filters, topicName } = this.props;
    const { formatMessage } = this.props.intl;
    return (
      <div>
        <TopicPageTitle value={formatMessage(localMessages.mainTitle, { title: term })} />
        <Grid>
          <Row>
            <Col lg={12}>
              <h1>
                <FormattedMessage {...localMessages.mainTitle} values={{ title: term }} />
              </h1>
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <WordSplitStoryCountContainer topicId={topicId} stem={stem} term={term} filters={filters} />
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <WordWordsContainer topicId={topicId} stem={stem} term={term} filters={filters} topicName={topicName} />
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <WordInContextContainer topicId={topicId} stem={stem} term={term} filters={filters} topicName={topicName} />
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <WordStoriesContainer topicId={topicId} stem={stem} term={term} filters={filters} />
            </Col>
          </Row>
          <Row>
            <Col lg={6} xs={12}>
              <WordDetails topicId={topicId} term={term} stem={stem} />
            </Col>
            <Col lg={6} xs={12}>
              <WordSimilarWordsContainer topicId={topicId} term={term} stem={stem} filters={filters} />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

WordContainer.propTypes = {
  // from context
  params: PropTypes.object.isRequired, // params from router
  location: PropTypes.object,
  intl: PropTypes.object.isRequired,
  // from parent
  // from dispatch
  selectNewWord: PropTypes.func.isRequired,
  saveParamsToStore: PropTypes.func.isRequired,
  // from state
  topicName: PropTypes.string.isRequired,
  topicId: PropTypes.number.isRequired,
  stem: PropTypes.string,
  term: PropTypes.string,
  filters: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  topicId: state.topics.selected.id,
  topicName: state.topics.selected.info.name,
  stem: ownProps.location.query.stem,
  term: ownProps.location.query.term,
  filters: state.topics.selected.filters,
});

const mapDispatchToProps = dispatch => ({
  selectNewWord: (term, stem) => {
    dispatch(selectWord({ term, stem }));
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return { ...stateProps,
    ...dispatchProps,
    ...ownProps,
    saveParamsToStore: () => {
      dispatchProps.selectNewWord(stateProps.stem, stateProps.term);
    } };
}

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps, mergeProps)(
    WordContainer
  )
);
