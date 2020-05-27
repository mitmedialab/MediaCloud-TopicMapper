import getCountryISO2 from 'country-iso-3-to-2'; // ISO 3166-1 lookup, from alpha3 to alpha2
import { GEONAMES_ID_TO_APLHA3 } from './mapUtil';

// tags indicating how the date on a story was guessed
export const TAG_SET_DATE_GUESS_METHOD = 508;

// tags indicating what extractor was used to pull content out of the story url
export const TAG_SET_EXTRACTOR_VERSION = 1354;

// tags indicating which version of the geocoder this was geocoded with
export const TAG_SET_GEOCODER_VERSION = 1937;
// tags for each geonames place
export const TAG_SET_GEOGRAPHIC_PLACES = 1011;
// tags indicating which version of the nyt theme engine the story was processed with
export const TAG_SET_NYT_THEMES_VERSION = 1964;
// tags for each nyt theme
export const TAG_SET_NYT_THEMES = 1963;
export const TAG_NYT_LABELER_1_0_0 = 9360669; // the tag that indicates a story was tagged by the NYT labeller version 1

// tags indicating what media type a source is
export const TAG_SET_MEDIA_TYPE = 1972;

export const TAG_SET_CLIFF_ORGS = 2388;
export const TAG_SET_CLIFF_PEOPLE = 2389;

const TAG_ID_CLIFF_CLAVIN_2_3_0 = 9353691; // the tag that indicates a story was tagged by the CLIFF version 2.3.0
const TAG_ID_CLIFF_CLAVIN_2_4_1 = 9696677; // the tag that indicates a story was tagged by the CLIFF version 2.4.1
const TAG_ID_CLIFF_CLAVIN_2_6_0 = 189462640; // the tag that indicates a story was tagged by the CLIFF version 2.6.0
export const CLIFF_VERSION_TAG_LIST = [TAG_ID_CLIFF_CLAVIN_2_3_0, TAG_ID_CLIFF_CLAVIN_2_4_1, TAG_ID_CLIFF_CLAVIN_2_6_0];

// tag sets that hold collections we want to show to the user
export const TAG_SET_MC_ID = 5;

export const TAG_SET_PARTISAN_RETWEETS_ID = 1959;
export const TAG_SET_ABYZ_GEO_COLLECTIONS = 15765102;
export const VALID_COLLECTION_IDS = [TAG_SET_MC_ID, TAG_SET_PARTISAN_RETWEETS_ID, TAG_SET_ABYZ_GEO_COLLECTIONS];

// tags for each country, allowed us to indicate which country a media source was published in
export const TAG_SET_PUBLICATION_COUNTRY = 1935;
export const TAG_SET_PUBLICATION_STATE = 1962;
export const TAG_SET_PRIMARY_LANGUAGE = 1969;
export const TAG_SET_COUNTRY_OF_FOCUS = 1970;
const VALID_METADATA_IDS = [TAG_SET_PUBLICATION_COUNTRY, TAG_SET_PUBLICATION_STATE, TAG_SET_PRIMARY_LANGUAGE,
  TAG_SET_COUNTRY_OF_FOCUS, TAG_SET_MEDIA_TYPE];

export const PUBLICATION_COUNTRY = 'publicationCountry';
export const PUBLICATION_STATE = 'publicationState';
export const PRIMARY_LANGUAGE = 'primaryLanguage';
export const COUNTRY_OF_FOCUS = 'countryOfFocus';
export const MEDIA_TYPE = 'mediaType';

export const PUB_COUNTRY_TAG_NAME = 'pub_country';
export const PUB_STATE_TAG_NAME = 'pub_state';
export const PRIMARY_LANGUAGE_TAG_NAME = 'primary_language';
export const COUNTRY_OF_FOCUS_TAG_NAME = 'subject_country';
export const MEDIA_TYPE_TAG_NAME = 'media_format';

export const TAG_STORY_UNDATEABLE = 8877812; // if a story has this tag, that means it was undateable


/**
 * Call this to verify a tag set id is one of the metadata options for a media source
 */
export function isMetaDataTagSet(metadataTagSetsId) {
  return VALID_METADATA_IDS.includes(metadataTagSetsId);
}

/**
 * Call this to verify a tag set id holds media source collections we want to show to the user
 */
export function isCollectionTagSet(tagSetsId) {
  return VALID_COLLECTION_IDS.includes(tagSetsId);
}

export function anyCollectionTagSets(tagSetIdList) {
  return tagSetIdList.reduce((any, tagSetId) => isCollectionTagSet(tagSetId) || any, false);
}

// Use this if you want to sort a set of tags by name (it falls back to tag if there is no label)
export function compareTagNames(a, b) {
  const nameA = (a.label || a.tag).toUpperCase(); // ignore upper and lowercase
  const nameB = (b.label || b.tag).toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
}

function tagForMetadata(metadataTagSetsId, allTags) {
  return allTags.find(tag => tag.tag_sets_id === metadataTagSetsId);
}

export function mediaSourceMetadataProps(mediaSource) {
  return {
    pubCountryTag: tagForMetadata(TAG_SET_PUBLICATION_COUNTRY, mediaSource.media_source_tags),
    pubStateTag: tagForMetadata(TAG_SET_PUBLICATION_STATE, mediaSource.media_source_tags),
    primaryLangaugeTag: tagForMetadata(TAG_SET_PRIMARY_LANGUAGE, mediaSource.media_source_tags),
    countryOfFocusTag: tagForMetadata(TAG_SET_COUNTRY_OF_FOCUS, mediaSource.media_source_tags),
    mediaTypeTag: tagForMetadata(TAG_SET_MEDIA_TYPE, mediaSource.media_source_tags),
  };
}

/**
 * Geographic country-level tags have the geonames id and country name encoded into the
 * actual tag string as a hack (because tags can't have arbitraty metadata). This reduxHelpers
 * uses that to add in any metadata needed to render maps. Returns only the country-level items.
 */
export const countryTagsWithAlpha2 = (tagList) => tagList
  .filter(t => t.tag.split('_')[1] in GEONAMES_ID_TO_APLHA3) // grab only the countries
  .map(t => ({
    ...t,
    // grab alpha3 out of the tag string, convert to alpha2 for highcharts
    'iso-a2': getCountryISO2(GEONAMES_ID_TO_APLHA3[parseInt(t.tag.split('_')[1], 10)]),
    value: t.count,
  }));
