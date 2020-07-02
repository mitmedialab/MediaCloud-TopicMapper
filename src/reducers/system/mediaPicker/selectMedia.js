import { MEDIA_PICKER_SELECT_MEDIA, MEDIA_PICKER_INITIALIZE_ALREADY_SELECTED_MEDIA, MEDIA_PICKER_CLEAR_SELECTED_MEDIA, MEDIA_PICKER_UNSELECT_MEDIA, MEDIA_PICKER_SELECT_MEDIA_CUSTOM_COLL } from '../../../actions/systemActions';
// import { PICK_COLLECTION, PICK_SOURCE, ADVANCED  } from '../../../../lib/explorerUtil';

// we may not need this...

const INITIAL_STATE = {
  list: [],
};

function selectMedia(state = INITIAL_STATE, action) {
  let updatedSelectedList = [];
  switch (action.type) {
    // recieving a whole new list of media to show
    case MEDIA_PICKER_INITIALIZE_ALREADY_SELECTED_MEDIA:
      updatedSelectedList = [...action.payload];
      updatedSelectedList = updatedSelectedList.map(c => ({ ...c, selected: true, id: c.tags_id || c.media_id || c.id }));
      return { list: updatedSelectedList };

    // update a particular item on the list, source, collection, or search. Search id is generated in SourceSelectContainer for new Custom searches and in python for URL loading
    case MEDIA_PICKER_SELECT_MEDIA:
      updatedSelectedList = [...state.list];
      if (action.payload.id !== undefined) {
        const mediaIndex = updatedSelectedList.findIndex(s => s.id === action.payload.id);
        if (mediaIndex > -1 && !action.payload.customColl) {
          // if there already, treat as a removal/toggle
          updatedSelectedList.splice(mediaIndex, 1);
        } else { // if newly selected
          updatedSelectedList.push({ ...action.payload, selected: action.payload.selected === undefined ? true : !action.payload.selected });
        }
        return { list: updatedSelectedList };
      }
      return state;
    case MEDIA_PICKER_SELECT_MEDIA_CUSTOM_COLL:
      updatedSelectedList = [...state.list];
      if (action.payload.id !== undefined) {
        const newObj = {};
        newObj.mediaKeyword = action.payload.mediaKeyword;
        newObj.customColl = action.payload.customColl;
        newObj.id = action.payload.id;
        const testObj = {};
        Object.keys(action.payload.tags).forEach((t) => { // for each tag
          const valArray = Object.values(action.payload.tags[t]);
          const onlySelectedTags = [...valArray].filter((t) => t.selected); // if it is selected!
          testObj[t] = [...onlySelectedTags]; // explicitly clone each array that is in each tags obj
        });
        newObj.tags = testObj;
        updatedSelectedList.push(newObj);
        return { list: updatedSelectedList };
      }
      return state;
    case MEDIA_PICKER_UNSELECT_MEDIA:
      updatedSelectedList = [...state.list];
      if (action.payload.id !== undefined) {
        const mediaIndex = updatedSelectedList.findIndex(s => s.id === action.payload.id);
        if (mediaIndex > -1) {
          updatedSelectedList[mediaIndex] = action.payload; // in display check matches
          updatedSelectedList.splice(mediaIndex, 1); // or just toggle selected...
        }
        return { list: updatedSelectedList };
      }
      return state;
    // empty the whole thing out
    case MEDIA_PICKER_CLEAR_SELECTED_MEDIA: // maybe we want this...
      // removed from selected list
      updatedSelectedList = [];
      return { list: updatedSelectedList };

    default:
      return state;
  }
}

export default selectMedia;
