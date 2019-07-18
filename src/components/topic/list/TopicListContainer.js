import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Row } from 'react-flexbox-grid/lib';
import { setTopicFavorite } from '../../../actions/topicActions';
import TabSelector from '../../common/TabSelector';
import { updateFeedback } from '../../../actions/appActions';
import messages from '../../../resources/messages';
import FavoriteTopicsContainer from './FavoriteTopicsContainer';
import PersonalTopicsContainer from './PersonalTopicsContainer';
import PublicTopicsContainer from './PublicTopicsContainer';
import AdminAllTopicsContainer from './AdminAllTopicsContainer';
import { getUserRoles, hasPermissions, PERMISSION_ADMIN } from '../../../lib/auth';

const localMessages = {
  topicsListPublic: { id: 'topics.list.public', defaultMessage: 'Public Topics' },
  topicsListFavorites: { id: 'topics.list.favorite', defaultMessage: 'Starred Topics' },
  topicsListPersonal: { id: 'topics.list.personal', defaultMessage: 'Personal Topics' },
  topicsListAll: { id: 'topics.list.all', defaultMessage: 'Other Topics (admin)' },
  noAccess: { id: 'topics.list.noAccess', defaultMessage: "Sorry, you don't have the permissions to view this list." },
};

class TopicListContainer extends React.Component {
  state = {
    selectedViewIndex: 0,
  };

  componentWillMount() {
  }

  render() {
    const { handleSetFavorited, user } = this.props;
    const { formatMessage } = this.props.intl;

    let viewContent = null;
    switch (this.state.selectedViewIndex) {
      case 0:
        viewContent = <PersonalTopicsContainer onSetFavorited={handleSetFavorited} />;
        break;
      case 1:
        viewContent = <FavoriteTopicsContainer onSetFavorited={handleSetFavorited} />;
        break;
      case 2:
        viewContent = <PublicTopicsContainer onSetFavorited={handleSetFavorited} />;
        break;
      case 3:
        viewContent = <AdminAllTopicsContainer />;
        break;
      default:
        break;
    }


    return (
      <div className="topic-list-container">
        <Row>
          <TabSelector
            tabLabels={[
              formatMessage(localMessages.topicsListPersonal),
              formatMessage(localMessages.topicsListFavorites),
              formatMessage(localMessages.topicsListPublic),
              hasPermissions(getUserRoles(user), PERMISSION_ADMIN) ? formatMessage(localMessages.topicsListAll) : undefined,
            ]}
            onViewSelected={index => this.setState({ selectedViewIndex: index })}
          />
        </Row>

        <div className="tabbed-content-wrapper">
          {viewContent}
        </div>

      </div>
    );
  }
}

TopicListContainer.propTypes = {
  // from context
  intl: PropTypes.object.isRequired,
  // from state
  user: PropTypes.object.isRequired,
  // from dispatch
  handleSetFavorited: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  user: state.user,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleSetFavorited: (topicId, isFavorite) => {
    dispatch(setTopicFavorite(topicId, isFavorite))
      .then(() => {
        const msg = (isFavorite) ? messages.topicFavorited : messages.topicUnfavorited;
        dispatch(updateFeedback({ classes: 'info-notice', open: true, message: ownProps.intl.formatMessage(msg) }));
      });
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    TopicListContainer
  )
);
