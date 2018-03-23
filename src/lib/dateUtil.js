import moment from 'moment';

export const STORY_PUB_DATE_UNDATEABLE = 'undateable';

const SOLR_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';

const SHORT_SOLR_DATE_FORMAT = 'YYYY-MM-DD';

const GAP_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ssZ';

const DB_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const JOB_STATUS_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const TOPIC_DATE_FORMAT = 'YYYY-MM-DD';

// "2017-04-13 12:26:59.649513"
const SNAPSHOT_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSSSSS';


export const ONE_DAY_RANGE = '+1DAY';

export const PAST_WEEK = 'week';
export const PAST_TWO_WEEKS = 'two_weeks';
export const PAST_MONTH = 'month';
export const PAST_YEAR = 'year';
export const PAST_ALL = 'all-time';

export function getCurrentDate() {
  const testdate = moment().format(TOPIC_DATE_FORMAT);
  return testdate;
}

export function getShortDate(dateString) {
  return moment(dateString).format('ll');
}

export function getDateFromTimestamp(milliseconds) {
  return moment.utc(parseInt(milliseconds, 10)).format(GAP_DATE_FORMAT);
}

export function isStartDateAfterEndDate(start, end) {
  return moment(start).isAfter(end);
}

export function oneWeekLater(date) {
  const weekLater = moment(date).add(1, 'week');
  return weekLater;
}

export function oneMonthBefore(date) {
  const monthBefore = moment(date).subtract(1, 'month').format(TOPIC_DATE_FORMAT);
  return monthBefore;
}

export function isMoreThanAYearInPast(dateInPast) {
  const yearPriorToNow = moment().subtract(1, 'years');
  return yearPriorToNow.isAfter(dateInPast);
}

export function isADayDifference(date0, date1) {
  const firstDate = moment(date0);
  const oneDayAfter = firstDate.add(1, 'days');
  return oneDayAfter.isAfter(moment(date1));
}

export function solrFormat(date, short = true) {
  return moment(date).format(short ? SHORT_SOLR_DATE_FORMAT : SOLR_DATE_FORMAT);
}

export function getMomentDateSubtraction(date, num, timeUnit) {
  return moment(date).subtract(num, timeUnit).format(TOPIC_DATE_FORMAT);
}

export function topicDateToMoment(topicDate, strict = true) {
  return moment(topicDate, TOPIC_DATE_FORMAT, strict);
}

export function snapshotDateToMoment(snapshotDateStr, strict = false) {
  return moment(snapshotDateStr, SNAPSHOT_DATE_FORMAT, strict);
}

export function jobStatusDateToMoment(statusDate, strict = true) {
  return moment(statusDate, JOB_STATUS_DATE_FORMAT, strict);
}

export function healthStartDateToMoment(healthStartDate, strict = true) {
  return moment(healthStartDate.substring(0, DB_DATE_FORMAT.length), DB_DATE_FORMAT, strict);
}

export function sourceSuggestionDateToMoment(suggestionDate, strict = true) {
  return moment(suggestionDate.substring(0, DB_DATE_FORMAT.length), DB_DATE_FORMAT, strict);
}

function solrDateToMoment(solrDateString, strict = true) {
  return moment(solrDateString, SOLR_DATE_FORMAT, strict);
}

export function storyPubDateToMoment(solrDateString, strict = true) {
  return moment(solrDateString, DB_DATE_FORMAT, strict);
}

export function storyPubDateToTimestamp(solrDateString, strict = true) {
  return storyPubDateToMoment(solrDateString, strict).valueOf();
}

function gapDateToMomemt(gapDateString, strict = true) {
  return moment(gapDateString, GAP_DATE_FORMAT, strict);
}


// Helper to change solr dates (2015-12-14T00:00:00Z) into javascript date ojects
export function calcSentences(countsMap) {
  let sentenceCount = 0;
  Object.keys(countsMap).forEach((k) => {
    if (k !== 'end' && k !== 'gap' && k !== 'start') {
      const v = countsMap[k];
      sentenceCount += v;
    }
  });
  return sentenceCount;
}
// Helper to change solr dates (2015-12-14T00:00:00Z) into javascript date ojects
export function cleanDateCounts(countsMap) {
  const countsArray = [];
  Object.keys(countsMap).forEach((k) => {
    if (k !== 'end' && k !== 'gap' && k !== 'start') {
      const v = countsMap[k];
      const timestamp = solrDateToMoment(k).valueOf();
      countsArray.push({ date: timestamp, count: v });
    }
  });
  return countsArray.sort((a, b) => a.date - b.date);
}

// Turn a gap list into a list of objects with from/to/color attributes, suitable for use as plot bands in HighCharts
export function cleanCoverageGaps(gapList) {
  let plotBands = [];
  if (gapList) {  // if the source has no health data, gapList could be undefined
    plotBands = gapList.map((gap) => {
      const weekStart = gapDateToMomemt(gap.stat_week).valueOf();
      const weekEnd = weekStart + (604800 * 1000);    // + one week
      return {
        from: weekStart,
        to: weekEnd,
        color: 'rgba(255, 0, 0, .6)',
      };
    });
  }
  return plotBands;
}

export function prepDateForSolrQuery(startDate, endDate) {
  return `(publish_date:[${topicDateToMoment(startDate).format('YYYY-MM-DDThh:mm:ss')}Z TO ${topicDateToMoment(endDate).format('YYYY-MM-DDThh:mm:ss')}Z])`;
}

export function getDateRange(timePeriod) {
  if (![PAST_WEEK, PAST_TWO_WEEKS, PAST_MONTH, PAST_YEAR, PAST_ALL].includes(timePeriod)) {
    const error = { message: `unknown time period passed to calculateTimePeriods: ${timePeriod}` };
    throw error;
  }
  let targetPeriodStart = null;
  const targetYear = moment().subtract(1, 'year');
  const targetMonth = moment().subtract(1, 'month');
  const targetWeek = moment().subtract(1, 'week');
  const targetPastTwoWeeks = moment().subtract(2, 'week');
  switch (timePeriod) {
    case PAST_WEEK: // past week
      targetPeriodStart = targetWeek;
      break;
    case PAST_TWO_WEEKS: // past week
      targetPeriodStart = targetPastTwoWeeks;
      break;
    case PAST_MONTH: // past month
      targetPeriodStart = targetMonth;
      break;
    case PAST_YEAR:
      targetPeriodStart = targetYear;
      break;
    case PAST_ALL:
      return null;
    default:
      break;
  }
  return { start: targetPeriodStart, end: moment() };
}

export function getPastTwoWeeksDateRange() {
  const dateObj = getDateRange(PAST_TWO_WEEKS);
  dateObj.start = dateObj.start.format('YYYY-MM-DD');
  dateObj.end = dateObj.end.format('YYYY-MM-DD');
  return dateObj;
}

export function calculateTimePeriods(timePeriod) {
  const dates = getDateRange(timePeriod);
  if (dates === null) { // ie. PAST_ALL
    return '';
  }
  return `(publish_date:[${dates.start.format('YYYY-MM-DDThh:mm:ss')}Z TO ${dates.end.format('YYYY-MM-DDThh:mm:ss')}Z])`;
}
