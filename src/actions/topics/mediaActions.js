import { createAction } from 'redux-actions';
import { createAsyncAction } from '../../lib/reduxHelpers';
import * as api from '../../lib/serverApi/topics';

export const SELECT_MEDIA = 'SELECT_MEDIA';
export const FETCH_MEDIA = 'FETCH_MEDIA';

// pass in media id
export const selectMedia = createAction(SELECT_MEDIA, id => id);

// pass in topic id, media id, filters
export const fetchMedia = createAsyncAction(FETCH_MEDIA, api.media);
