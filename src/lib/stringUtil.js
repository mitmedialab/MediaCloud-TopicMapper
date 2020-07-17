import LogicQueryParser from 'logic-query-parser';

export const WILDCARD_ASTERISK = '*';
// Trim a string to a max length, adding '...' if it is too long
export function trimToMaxLength(originalString, maxLength) {
  if ((originalString === undefined) || (originalString === null)) {
    return originalString; // is this right, or should we return empty string?
  }
  if (originalString.length < maxLength) {
    return originalString;
  }
  return `${originalString.substring(0, maxLength)}...`;
}

// Use this to handle really big numbers that you need to show at low accuracy
export function humanReadableNumber(number, numSigFigs, formatNumber) {
  const pow = Math.round(number).toString().length;

  if (pow > 12) {
    return '>1 trillion';
  }
  if (pow >= 10 && pow <= 12) {
    const abbrev = formatNumber(number / 1000000000, { maximumSignificantDigits: numSigFigs });
    return abbrev.concat(' billion');
  }
  if (pow >= 7 && pow <= 9) {
    const abbrev = formatNumber(number / 1000000, { maximumSignificantDigits: numSigFigs });
    return abbrev.concat(' million');
  }
  if (pow >= 4 && pow <= 6) {
    const abbrev = formatNumber(number / 1000, { maximumSignificantDigits: numSigFigs });
    return abbrev.concat('k');
  }

  return formatNumber(number);
}

// Is the object passed in an object waiting to be localized?
export function isIntlMessage(object) {
  return (object.id && object.defaultMessage);
}

/**
 * Use this to intl a variable when you don't know if it is a string or a message object.
 * Important that this return the raw object if it is neither a string, nor an intl object.
 */
export function intlIfObject(formatter, value) {
  if (value) {
    if (typeof value === 'string') {
      return value;
    }
    if (isIntlMessage(value)) {
      return formatter(value);
    }
  }
  return value; // it is some kind of null, so return it as is for caller to deal with (ie. render empty or cause error)
}

function extractStringsFromParseTree(node) {
  let words = [];
  if (node.lexeme.type === 'string') {
    const str = node.lexeme.value.replace('*', ''); // remove any wildcards
    words = [str];
  } else {
    if (node.left) {
      words = words.concat(extractStringsFromParseTree(node.left));
    }
    if (node.right) {
      words = words.concat(extractStringsFromParseTree(node.right));
    }
  }
  return words;
}

export function extractWordsFromQuery(searchString) {
  if (searchString) {
    const binaryTree = LogicQueryParser.parse(searchString);
    const strings = extractStringsFromParseTree(binaryTree);
    return strings.join(',');
  }
  return null;
}

export function replaceCurlyQuotes(stringWithQuotes) {
  if (stringWithQuotes) {
    let removedQuotes = stringWithQuotes.replace(/[\u2018]/g, "'").replace(/[\u2019]/g, "'"); // replace single curly quotes
    removedQuotes = removedQuotes.replace(/[\u201C]/g, '"').replace(/[\u201D]/g, '"'); // replace double curly quotes
    return removedQuotes;
  }
  return stringWithQuotes;
}

// handle a CodeMirror or regular object
export const queryAsString = (obj) => ((typeof obj === 'string') ? obj : obj.getValue());
