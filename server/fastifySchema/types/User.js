const S = require("fluent-schema");
const Token = S.object()
  .title("Token")
  .description("Token Rule")
  .prop("token", S.string().minLength(0).maxLength(1000).required());

const UserName = S.object()
  .title("Username")
  .prop("username", S.string().minLength(1).required())
  .description("username is the Github's username");

const FullName = S.object()
  .title("FullName")
  .prop("full_name", S.string().minLength(1).required())
  .description(
    "full_name is Github query that contains username and repo name"
  );

const UserRepoInfo = S.object()
  .title("User Repository")
  .description("Attributes to query the github's user repository info")
  .prop(
    "page",
    S.string().required().description("Query page for github API pagination")
  )
  .prop("axiosCancel", S.boolean())
  .prop(
    "per_page",
    S.string()
      .required()
      .description("Query per_page for github API pagination")
  )
  .extend(Token)
  .extend(UserName);

const OrgRepoInfo = S.object()
  .title("Organization Repository")
  .description("Attributes to query the github's organization repository info")
  .prop(
    "page",
    S.string().required().description("Query page for github API pagination")
  )
  .prop("axiosCancel", S.boolean())
  .prop(
    "per_page",
    S.string()
      .required()
      .description("Query per_page for github API pagination")
  )
  .prop("org", S.string().required())
  .extend(Token);

const UsersSearchInfo = S.object()
  .title("Autocomplete Data")
  .description("Attributes to use autocomplete feature from github API")
  .extend(Token)
  .extend(UserName);

const TopicsSearchInfo = S.object()
  .title("Topics Search Data")
  .description("Attributes to search topics")
  .prop("axiosCancel", S.boolean())
  .prop("topic", S.string().required())
  .extend(Token);

const ReadmeRepoInfo = S.object()
  .title("Readme Data")
  .description("Attributes to readme")
  .prop("branch", S.string().required())
  .extend(Token)
  .extend(FullName);

const ContributorsRepoInfo = S.object()
  .title("Repository Contributors Data")
  .description("Attributes to query the github's repository contributors")
  .extend(Token)
  .extend(FullName);

const ImagesReadmeRepoInfo = S.object()
  .title("Images in Readme")
  .description("Attributes for Images Readme")
  .prop("query_topic", S.string().minLength(1).maxLength(200).required())
  .prop("axiosCancel", S.boolean())
  .prop("page", S.string().minLength(1).required())
  .extend(Token);

//if you define the schema here but forgot to include in the client/service folder, it will throw error
//if you define the query or body that doesn't exist in the schema, that specific request params/request body will be ignored
const ImagesReadmeRepoInfoBody = S.object()
  .title("Object")
  .description("Attributes for body data of Images Readme")
  .prop("data", S.object().required());

const ObjectData = S.object();

const ConvertToWebp = S.object()
  .title("Converting image to webp")
  .prop("imgUrl", S.string().minLength(1).required());

const JWTVerify = S.object()
  .title("JWT Verification")
  .prop("isLoggedIn", S.boolean().required())
  .extend(Token)
  .extend(UserName);

module.exports = {
  UserRepoInfo,
  OrgRepoInfo,
  ContributorsRepoInfo,
  ConvertToWebp,
  ObjectData,
  JWTVerify,
  UsersSearchInfo,
  TopicsSearchInfo,
  UserName,
  FullName,
  Token,
  ReadmeRepoInfo,
  ImagesReadmeRepoInfo,
  ImagesReadmeRepoInfoBody,
};
