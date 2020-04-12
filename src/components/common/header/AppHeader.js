import PropTypes from 'prop-types';
import React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import Link from 'react-router/lib/Link';
import FavoriteToggler from '../FavoriteToggler';
import { PERMISSION_LOGGED_IN } from '../../../lib/auth';
import Permissioned from '../Permissioned';

const AppHeader = (props) => {
  const { link, title, isFavorite, onSetFavorited, subTitle } = props;
  let titleContent;
  if (link) {
    titleContent = (<Link to={link}>{title}</Link>);
  } else {
    titleContent = title;
  }
  return (
    <div className="app-header">
      <Grid>
        <Row>
          <Col lg={12}>
            <h1>
              {titleContent}
              {(isFavorite !== undefined) && (
                <Permissioned onlyRole={PERMISSION_LOGGED_IN}>
                  <FavoriteToggler
                    isFavorited={isFavorite}
                    onSetFavorited={isFavNow => onSetFavorited(isFavNow)}
                  />
                </Permissioned>
              )}
            </h1>
            <p className="sub-title">{subTitle}</p>
          </Col>
        </Row>
      </Grid>
    </div>
  );
};

AppHeader.propTypes = {
  // from parent
  title: PropTypes.string.isRequired,
  isFavorite: PropTypes.bool, // optional so we can be a bit more resilient to potential future uses
  onSetFavorited: PropTypes.func,
  subTitle: PropTypes.string,
  link: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
};

export default AppHeader;
