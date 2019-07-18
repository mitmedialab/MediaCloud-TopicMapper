import moment from 'moment';
import { FETCH_STORY, SELECT_STORY, RESET_STORY } from '../../actions/storyActions';
import { createAsyncReducer } from '../../lib/reduxHelpers';
import { TAG_SET_DATE_GUESS_METHOD, TAG_SET_EXTRACTOR_VERSION, TAG_SET_GEOCODER_VERSION, TAG_SET_NYT_THEMES_VERSION }
  from '../../lib/tagUtil';

// returns undefined if it is not found
function tagWithTagSetsId(tags, tagSetsId) {
  if (tags) {
    const tag = tags.find(t => t.tag_sets_id === tagSetsId);
    return (tag) ? tag.tag : undefined;
  }
  return undefined;
}

const info = createAsyncReducer({
  initialState: {
    fetchStatus: '', fetchStatuses: [], id: null, stories_id: null,
  },
  action: FETCH_STORY,
  handleSuccess: payload => ({
    ...payload.info,
    publishDateObj: moment(payload.publish_date).toDate(),
    dateGuessMethod: tagWithTagSetsId(payload.story_tags, TAG_SET_DATE_GUESS_METHOD),
    extractorVersion: tagWithTagSetsId(payload.story_tags, TAG_SET_EXTRACTOR_VERSION),
    geocoderVersion: tagWithTagSetsId(payload.story_tags, TAG_SET_GEOCODER_VERSION),
    nytThemesVersion: tagWithTagSetsId(payload.story_tags, TAG_SET_NYT_THEMES_VERSION),
  }),
  [SELECT_STORY]: payload => ({ ...payload, selectedStory: true }),
  [RESET_STORY]: () => ({ fetchStatus: '', fetchStatuses: [], id: null, stories_id: null }),
});

export default info;
