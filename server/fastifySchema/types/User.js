const S = require("fluent-schema");
const UserRepoInfo = S.object()
  .title("User Repository")
  .description("Attributes to query the github's user repository info")
  .prop("token", S.string().minLength(0).maxLength(1000).required())
  .prop(
    "page",
    S.string().required().description("Query page for github API pagination")
  )
  .prop(
    "per_page",
    S.string()
      .required()
      .description("Query per_page for github API pagination")
  )
  .prop("username", S.string().required());

const OrgRepoInfo = S.object()
  .title("Organization Repository")
  .description("Attributes to query the github's organization repository info")
  .prop("token", S.string().minLength(0).maxLength(1000).required())
  .prop(
    "page",
    S.string().required().description("Query page for github API pagination")
  )
  .prop(
    "per_page",
    S.string()
      .required()
      .description("Query per_page for github API pagination")
  )
  .prop("org", S.string().required());

const UsersSearchInfo = S.object()
  .title("Autocomplete Data")
  .description("Attributes to use autocomplete feature from github API")
  .prop("token", S.string().minLength(0).maxLength(1000).required())
  .prop("user", S.string().required());

const TopicsSearchInfo = S.object()
  .title("Topics Search Data")
  .description("Attributes to search topics")
  .prop("token", S.string().minLength(0).maxLength(1000).required())
  .prop("topic", S.string().required());

const ReadmeRepoInfo = S.object()
  .title("Readme Data")
  .description("Attributes to readme")
  .prop("full_name", S.string().minLength(1).maxLength(1000).required())
  .prop("token", S.string().minLength(1).maxLength(1000).required())
  .prop("branch", S.string().required());

const ContributorsRepoInfo = S.object()
  .title("Repository Contributors Data")
  .description("Attributes to query the github's repository contributors")
  .prop("token", S.string().minLength(0).maxLength(1000).required())
  .prop("fullName", S.string().required());

const ImagesReadmeRepoInfo = S.object()
  .title("Images in Readme")
  .description("Attributes for Images Readme")
  .prop("query_topic", S.string().minLength(1).maxLength(200).required())
  .prop("page", S.string().minLength(1).required());

//if you define the schema here but forgot to include in the client/service folder, it will throw error
//if you define the query or body that doesn't exist in the schema, that specific request params/request body will be ignored
const ImagesReadmeRepoInfoBody = S.object()
  .title("Any Array of Objects")
  .description("Attributes for body data of Images Readme")
  .prop("data", S.array().items(S.object()).required())
  .prop("token", S.string().minLength(1).maxLength(1000).required());

const ObjectData = S.object();

const UserToken = S.object()
  .title("Token GQL")
  .description("Token")
  .prop("token", S.string().required());

const UserName = S.object()
  .title("Username")
  .prop("username", S.string().minLength(1).required());

const JWTVerify = S.object()
  .title("JWT Verification")
  .prop("username", S.string().minLength(1).required())
  .prop("isLoggedIn", S.boolean().required())
  .prop("token", S.string().minLength(0).maxLength(1000).required());

// const ElasticSearchDiscover = S.object()
//   .title("Search query for Elastic Search")
//   .prop("search", S.string().minLength(1).required())
//   .prop("docName", S.string().minLength(1).required())
//   .prop("docType", S.string().minLength(1).required());

module.exports = {
  UserRepoInfo,
  OrgRepoInfo,
  ContributorsRepoInfo,
  ObjectData,
  JWTVerify,
  UsersSearchInfo,
  TopicsSearchInfo,
  UserName,
  UserToken,
  ReadmeRepoInfo,
  ImagesReadmeRepoInfo,
  ImagesReadmeRepoInfoBody,
  // ElasticSearchDiscover,
};
