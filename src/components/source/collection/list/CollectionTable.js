import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import Link from 'react-router/lib/Link';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import CollectionIcon from '../../../common/icons/CollectionIcon';
import FilledStarIcon from '../../../common/icons/FilledStarIcon';
import messages from '../../../../resources/messages';

const CollectionTable = (props) => {
  const { title, description, collections } = props;
  let tableEntries = Object.values(collections);
  const keys = Object.keys(collections);
  tableEntries = tableEntries.map((c, index) => (
    <tr>
      <h2>{collections[keys[index]][0].label}</h2>
      {c.map((s, idx) => (
        <tr key={s.tags_id} className={(idx % 2 === 0) ? 'even' : 'odd'}>
          <td>
            <Link to={`/collections/${s.tags_id}`}>{s.label}</Link>
          </td>
          <td>
            {s.description}
          </td>
          <td>
            { s.isFavorite ? <FilledStarIcon /> : '' }
          </td>
        </tr>
    ))}</tr>
  ));
  return (
    <div className="collection-table">
      <Grid>
        <Row>
          <Col lg={12} md={12} sm={12}>
            <h2>
              <CollectionIcon height={32} />
              {title}
            </h2>
            <p>{description}</p>
          </Col>
        </Row>
        <Row>
          <table width="100%">
            <tbody>
              <tr>
                <th><FormattedMessage {...messages.collectionNameProp} /></th>
                <th><FormattedMessage {...messages.collectionDescriptionProp} /></th>
              </tr>
              {tableEntries}
            </tbody>
          </table>
        </Row>
      </Grid>
    </div>
  );
};

CollectionTable.propTypes = {
  // from parent
  collections: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  // from context
  intl: PropTypes.object.isRequired,
};

export default
  injectIntl(
    CollectionTable
  );
