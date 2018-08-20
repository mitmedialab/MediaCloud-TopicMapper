import PropTypes from 'prop-types';
import React from 'react';
import Button from '@material-ui/core/Button';
import messages from '../../../resources/messages';

/**
 * Use this with the JS Composition pattern to make a Container that has paging controls.
 * Your container MUST expose `previousPage` and `nextPage` event handler methods.
 * Most likely those methods will call out to a fetchData property that loads the previous or
 * next page.
 */
function withPaging(ComposedContainer) {
  const PagedContainer = (props) => {
    const { links, nextPage, previousPage } = props;
    const { formatMessage } = props.intl;
    let previousButton = null;
    if ((links !== undefined) && {}.hasOwnProperty.call(links, 'previous')) {
      previousButton = <Button variant="outlined" label={formatMessage(messages.previousPage)} color="primary" onClick={previousPage} />;
    }
    let nextButton = null;
    if ((links !== undefined) && {}.hasOwnProperty.call(links, 'next')) {
      nextButton = <Button variant="contained" label={formatMessage(messages.nextPage)} color="primary" onClick={nextPage} />;
    }
    return <ComposedContainer {...props} nextButton={nextButton} previousButton={previousButton} />;
  };
  PagedContainer.propTypes = {
    intl: PropTypes.object.isRequired,
    links: PropTypes.object.isRequired,
    nextPage: PropTypes.func.isRequired,
    previousPage: PropTypes.func.isRequired,
  };
  return PagedContainer;
}

export default withPaging;
