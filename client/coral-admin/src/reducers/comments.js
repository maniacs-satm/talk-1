import * as actions from '../constants/comments';
import * as userActions from '../constants/user';
import {Map, List, fromJS} from 'immutable';

/**
 * Comments state is stored using 2 structures:
 * - byId is a Map holding the comments using the item_id property as keys
 * - ids is a List of item_id, this allows us to order and iterate easily
 *   since maps are unordered and some times we just need a list of things
 */

const initialState = Map({
  byId: Map(),
  ids: List(),
  loading: false,
  showBanUserDialog: false,
  banUser: {
    'userName': '',
    'userId': '',
    'commentId': ''
  }
});

// Handle the comment actions
export default (state = initialState, action) => {
  switch (action.type) {
  case actions.COMMENTS_MODERATION_QUEUE_FETCH_REQUEST: return state.set('loading', true);
  case actions.COMMENTS_MODERATION_QUEUE_FETCH_SUCCESS: return replaceComments(action, state);
  case actions.COMMENTS_MODERATION_QUEUE_FAILED: return state.set('loading', false);
  case actions.COMMENT_STATUS_UPDATE_REQUEST: return updateStatus(state, action);
  case actions.COMMENT_FLAG: return flag(state, action);
  case actions.COMMENT_CREATE_SUCCESS: return addComment(state, action);
  case actions.COMMENT_STREAM_FETCH_SUCCESS: return replaceComments(action, state);
  case actions.SHOW_BANUSER_DIALOG: return setBanUser(state, true, action);
  case actions.HIDE_BANUSER_DIALOG: return setBanUser(state, false, action);
  case actions.USER_BAN_SUCCESS: return setBanUser(state, false, action);
  case userActions.UPDATE_STATUS_SUCCESS: return setBanUser(state, false, action);
  default: return state;
  }
};

// hide or show the UI for the dialog confirming the ban
// set the user that is going to set and the comment that is the reason
const setBanUser = (state, showBanUser, action) => {
  const banUser = {'userName': action.userName, 'userId': action.userId, 'commentId': action.commentId};
  return state.set('showBanUserDialog', showBanUser)
    .set('banUser', banUser);
};

// Update a comment status
const updateStatus = (state, action) => {
  const byId = state.get('byId');
  const data = byId.get(action.id).set('status', action.status.toLowerCase());
  return state.set('byId', byId.set(action.id, data));
};

// Flag a comment
const flag = (state, action) => {
  const byId = state.get('byId');
  const data = byId.get(action.id).set('flagged', true);
  const comment = byId.get(action.id).set('data', data);
  return state.set('byId', byId.set(action.id, comment));
};

// Replace the comment list with a new one
const replaceComments = (action, state) => {
  const comments = fromJS(action.comments.reduce((prev, curr) => { prev[curr.id] = curr; return prev; }, {}));
  return state.set('byId', comments).set('loading', false)
  .set('ids', List(comments.keys()));
};

// Add a new comment
const addComment = (state, action) => {
  const comment = fromJS(action.comment);
  return state.set('byId', state.get('byId').set(comment.get('item_id'), comment))
    .set('ids', state.get('ids').unshift(comment.get('item_id')));
};
