import PropTypes from 'prop-types';
import React from 'react';
import Link from 'react-router/lib/Link';
import { FormattedMessage, injectIntl, FormattedNumber, FormattedDate } from 'react-intl';
import FilledStarIcon from '../common/icons/FilledStarIcon';
import messages from '../../resources/messages';
import { googleFavIconUrl, slugifyLocalSourcePath } from '../../lib/urlUtil';
import { parseSolrShortDate } from '../../lib/dateUtil';

const SourceTable = (props) => {
  const { sources, extraHeaderColumns, extraColumns } = props;
  const content = null;
  if (sources === undefined) {
    return (
      <div>
        { content }
      </div>
    );
  }
  return (
    <div className="source-table">
      <table width="100%">
        <tbody>
          <tr>
            <th colSpan="2"><FormattedMessage {...messages.sourceName} /></th>
            <th className="numeric"><FormattedMessage {...messages.storiesPerDay} /></th>
            <th className="numeric"><FormattedMessage {...messages.sourceStartDate} /></th>
            { extraHeaderColumns && extraHeaderColumns()}
          </tr>
          {sources.map((source, idx) =>
            (<tr key={source.id ? source.id : source.media_id} className={(idx % 2 === 0) ? 'even' : 'odd'}>
              <td>
                <img className="google-icon" src={googleFavIconUrl(source.url)} alt={source.name} />
              </td>
              <td>
                <Link to={slugifyLocalSourcePath(source)}>{source.name}</Link>
                { source.isFavorite ? <FilledStarIcon /> : '' }
              </td>
              <td className="numeric"><FormattedNumber value={Math.round(source.num_stories_90)} /></td>
              <td className="numeric"><FormattedDate value={parseSolrShortDate(source.start_date)} /></td>
              { extraColumns && extraColumns(source, idx)}
            </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

SourceTable.propTypes = {
  sources: PropTypes.array,
  intl: PropTypes.object.isRequired,
  extraHeaderColumns: PropTypes.func,
  extraColumns: PropTypes.func,
};

export default injectIntl(SourceTable);
