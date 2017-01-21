// TODO: Adjust `RootQuery.asset(id: ID, url: String)` to instead be
// `RootQuery.asset(id: ID, url: String!)` because we'll always need the url, if
// this change is done now everything will likely break on the front end.

const typeDefs = [`
interface ActionableItem {
  id: ID!
}

type UserSettings {
  # bio of the user.
  bio: String
}

input CommentsInput {
  # current status of a comment.
  status: COMMENT_STATUS

  # asset that a comment is on.
  asset_id: ID

  # action type to find comments that have an action with.
  action_type: ACTION_TYPE
}

# Any person who can author comments, create actions, and view comments on a
# stream.
type User {
  id: ID!

  # display name of a user.
  displayName: String!

  # actions against a specific user.
  actions: [ActionSummary]

  # settings for a user.
  settings: UserSettings

  # returns all comments based on a query.
  comments(query: CommentsInput): [Comment]
}

type Comment {
  id: ID!

  # the actual comment data.
  body: String!

  # the user who authored the comment.
  user: User

  # the replies that were made to the comment.
  replies(limit: Int = 3): [Comment]

  # the actions made against a comment.
  actions: [ActionSummary]

  # the asset that a comment was made on.
  asset: Asset

  # the current status of a comment.
  status: COMMENT_STATUS
}

enum ITEM_TYPE {
  ASSETS
  COMMENTS
  USERS
}

enum ACTION_TYPE {
  LIKE
  FLAG
}

type Action {
  id: ID!
  action_type: ACTION_TYPE!

  item_id: ID!
  item_type: ITEM_TYPE!
  item: ActionableItem

  user: User!
  updated_at: String
  created_at: String
}

type ActionSummary {
  action_type: ACTION_TYPE!
  item_type: ITEM_TYPE!
  count: Int
  current_user: Action
}

type Settings {
  moderation: String
  infoBoxEnable: Boolean
  infoBoxContent: String
  closeTimeout: Int
  closedMessage: String
  charCountEnable: Boolean
  charCount: Int
  requireEmailConfirmation: Boolean
}

type Asset {
  id: ID!
  title: String
  url: String
  comments: [Comment]
  settings: Settings!
  closedAt: String
}

enum COMMENT_STATUS {
  ACCEPTED
  REJECTED
  PREMOD
}

type RootQuery {
  # retrieves site wide settings and defaults.
  settings: Settings

  # retrieves all assets.
  assets: [Asset]

  # retrieves a specific asset.
  asset(id: ID, url: String): Asset

  # retrieves comments based on the input query.
  comments(query: CommentsInput): [Comment]

  # retrieves the current logged in user.
  me: User
}

input CreateActionInput {
  # the type of action.
  action_type: ACTION_TYPE!

  # the type of the item.
  item_type: ITEM_TYPE!

  # the id of the item that is related to the action.
  item_id: ID!
}

input UpdateUserSettingsInput {
  # user bio
  bio: String!
}

type RootMutation {
  # creates a comment on the asset.
  createComment(asset_id: ID!, parent_id: ID, body: String!): Comment

  # creates an action based on an input.
  createAction(action: CreateActionInput!): Action

  # delete an action based on the action id.
  deleteAction(id: ID!): Boolean

  # updates a user's settings, it will return if the query was successful.
  updateUserSettings(settings: UpdateUserSettingsInput!): Boolean
}

schema {
  query: RootQuery
  mutation: RootMutation
}
`];

module.exports = typeDefs;