import PropTypes from 'prop-types';
import React from 'react';

// https://stackoverflow.com/questions/29652862/highlight-text-using-reactjs

const HighlightedText = ({ text, search }) => {
  if (search === undefined) {
    return text;
  }
  const regex = new RegExp(`(${search.join('|')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.filter(part => part).map((part, i) => (
        regex.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>
      ))}
    </span>
  );
};

HighlightedText.propTypes = {
  text: PropTypes.string.isRequired,
  search: PropTypes.array,
};

export default HighlightedText;
