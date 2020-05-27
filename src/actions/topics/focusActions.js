import { createAction } from 'redux-actions';
import { createAsyncAction } from '../../lib/reduxHelpers';
import * as api from '../../lib/serverApi/topics';

export const UPDATE_OR_CREATE_FOCUS_DEFINITION = 'UPDATE_OR_CREATE_FOCUS_DEFINITION';

export const CREATE_FOCUS_DEFINITION = 'CREATE_FOCUS_DEFINITION';
export const DELETE_FOCUS_DEFINITION = 'DELETE_FOCUS_DEFINITION';
export const GO_TO_CREATE_FOCUS_STEP = 'GO_TO_CREATE_FOCUS_STEP';

export const CREATE_RETWEET_FOCUS_SET = 'CREATE_RETWEET_FOCUS_SET';
export const CREATE_TOP_COUNTRIES_FOCUS_SET = 'CREATE_TOP_COUNTRIES_FOCUS_SET';
export const CREATE_NYT_THEME_FOCUS_SET = 'CREATE_NYT_THEME_FOCUS_SET';
export const CREATE_MEDIA_TYPE_FOCUS_SET = 'CREATE_MEDIA_TYPE_FOCUS_SET';

export const submitFocusUpdateOrCreate = createAsyncAction(UPDATE_OR_CREATE_FOCUS_DEFINITION, api.updateOrCreateFocusDefinition);

// pass in topicId and focusDefenitionId
export const deleteFocusDefinition = createAsyncAction(DELETE_FOCUS_DEFINITION, api.deleteFocusDefinition);

// pass in the number of the step to go to
export const goToCreateFocusStep = createAction(GO_TO_CREATE_FOCUS_STEP, step => step);

export const createRetweetFocalSet = createAsyncAction(CREATE_RETWEET_FOCUS_SET, api.createRetweetFocalSet);

export const createTopCountriesFocalSet = createAsyncAction(CREATE_TOP_COUNTRIES_FOCUS_SET, api.createTopCountriesFocalSet);

export const createMediaTypeFocalSet = createAsyncAction(CREATE_MEDIA_TYPE_FOCUS_SET, api.createMediaTypeFocalSet);

export const createNytThemeFocalSet = createAsyncAction(CREATE_NYT_THEME_FOCUS_SET, api.createNytThemeFocalSet);
