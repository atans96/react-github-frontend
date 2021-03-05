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
  .prop("noImageQuery", S.boolean().required())
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

const ContributorsRepoInfo = S.object()
  .title("Repository Contributors Data")
  .description("Attributes to query the github's repository contributors")
  .prop("token", S.string().minLength(0).maxLength(1000).required())
  .prop("fullName", S.string().required());

const ArrayObject = S.object()
  .title("Any Array of Objects")
  .description("Attributes for body data")
  .prop("data", S.array().items(S.object()).required());

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
  ArrayObject,
  ObjectData,
  JWTVerify,
  UsersSearchInfo,
  TopicsSearchInfo,
  UserName,
  UserToken,
  // ElasticSearchDiscover,
};
