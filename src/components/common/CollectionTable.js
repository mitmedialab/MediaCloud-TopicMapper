import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import Link from 'react-router/lib/Link';
import FilledStarIcon from './icons/FilledStarIcon';
import LockIcon from './icons/LockIcon';
import messages from '../../resources/messages';
import { urlToCollection, slugifyLocalCollectionPath } from '../../lib/urlUtil';

const CollectionTable = props => (
  <div className="collection-table">
    <table width="100%">
      <tbody>
        <tr>
          <th><FormattedMessage {...messages.collectionNameProp} /></th>
          <th><FormattedMessage {...messages.collectionDescriptionProp} /></th>
        </tr>
        {props.collections.map((c, idx) => (
          <tr key={c.tags_id} className={(idx % 2 === 0) ? 'even' : 'odd'}>
            <td>
              <Link
                to={props.absoluteLink ? urlToCollection(c) : slugifyLocalCollectionPath(c)}
              >
                {c.label || c.tag}
              </Link>
            </td>
            <td>
              {c.description}
            </td>
            <td>
              { c.show_on_media === false ? <LockIcon /> : '' }
              { c.isFavorite ? <FilledStarIcon /> : '' }
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

CollectionTable.propTypes = {
  // from parent
  collections: PropTypes.array.isRequired,
  absoluteLink: PropTypes.bool,
  // from context
  intl: PropTypes.object.isRequired,
};

export default
  injectIntl(
    CollectionTable
  );
