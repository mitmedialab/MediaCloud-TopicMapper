import { SELECT_MEDIAPICKER_QUERY_ARGS, RESET_MEDIAPICKER_QUERY_ARGS } from '../../../actions/systemActions';
import { PICK_FEATURED /* PICK_SOURCE_AND_COLLECTION */ } from '../../../lib/explorerUtil';

const INITIAL_STATE = { args: { type: PICK_FEATURED, mediaKeyword: null, tags: {}, allMedia: false } };

function selectMediaQuery(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SELECT_MEDIAPICKER_QUERY_ARGS:
      if (action.payload) { // format should be args: { type, mediaKeyword, tags }. tags = metadata tags in the format of
        const testArray = [];
        if (action.payload.tags) { // custom Collections in source search
          Object.keys(action.payload.tags).forEach((t) => { // for each tag, specifically clone it or we have a reference issue
            const vals = Object.values(action.payload.tags[t]).filter(o => o && o.name).map(obj => ({ ...obj }));
            testArray[t] = [...vals];
          });
        }
        const args = {
          type: action.payload.type,
          allMedia: action.payload.allMedia,
          mediaKeyword: action.payload.mediaKeyword || action.payload.media_keyword,
          advancedSearchQueryString: action.payload.mediaKeyword || action.payload.media_keyword,
          tags: testArray,
        };
        return { args };
      }
      return state;
    case RESET_MEDIAPICKER_QUERY_ARGS:
      return INITIAL_STATE;
    default:
      return state;
  }
}

export default selectMediaQuery;
