const crypto = require("crypto");
const userRepoInfo = require("../api/repo/user-repo-info");
const orgRepoInfo = require("../api/repo/org-repo-info");
const contributorsRepoInfo = require("../api/repo/contributors-repo-info");
const imagesRepoInfo = require("../api/repo/images-repo-info");
const readmeRepoInfo = require("../api/repo/readme-repo-info");
const usersSearchInfo = require("../api/search/users-search-info");
const topicSearchInfo = require("../api/search/topics-search-info");
const setStarredMe = require("../api/me/set-starred-me");
const removeStarredMe = require("../api/me/delete-starred-me");
const getRateLimit = require("../api/rateLimit/get-rate-limit-info");
const subscribeUserFeed = require("../api/rssFeed/subscribe-user-feed");
const setTokenGQL = require("../api/auth/set-token-graphql");
const getTokenGQL = require("../api/auth/get-token-graphql");
const destroyTokenGQL = require("../api/auth/remove-token-graphql");
const githubAccessToken = require("../api/auth/github-access-token");
const verifyJWTToken = require("../api/auth/verify-jwt-token");
const testTokenGQL = require("../api/auth/github-graphql-test-token");
const getGQLData = require("../api/graphql/get-data");
const getGQLFile = require("../api/readFile/get-gql-properties-file");

const verifyUsername = require("../middleware/username");
const Schema = require("../fastifySchema");

async function routes(fastify, opts, done) {
  fastify.get(
    "/api/users",
    {
      logLevel: "error",
      schema: Schema.repo.UserRepoInfo,
      preValidation: fastify.csrfProtection,
    },
    (req, res) => {
      const url = crypto.createHash("md5").update(req.url).digest("hex");
      const { redis } = fastify;
      redis.get(url, (err, val) => {
        if (val) {
          redis.expire(url, 300 * 1000); //refresh it since we're still using it
          res.send(val);
        } else if (!err && !val) {
          userRepoInfo(req, res, fastify, {
            url,
            axios: opts.axios,
            github: opts.githubAPIWrapper,
          });
        } else {
          throw new Error(`Something Wrong with ${req.url} ${err}`);
        }
      });
    }
  );
  fastify.get(
    "/api/graphqlUserData",
    {
      logLevel: "error",
      schema: Schema.graphql.GetGQLData,
      preValidation: fastify.csrfProtection,
      preHandler: (req, res, done) => verifyUsername(req, res, fastify, done),
    },
    (req, res) => {
      getGQLData(req, res, fastify);
    }
  );
  fastify.get(
    "/api/verifyJWTToken",
    {
      logLevel: "error",
      schema: Schema.auth.VerifyJWTToken,
      preValidation: fastify.csrfProtection,
      preHandler: (req, res, done) => verifyUsername(req, res, fastify, done),
    },
    (req, res) => {
      verifyJWTToken(req, res, fastify, {
        axios: opts.axios,
        jwtService: opts.jwtService,
      });
    }
  );

  fastify.get(
    "/api/org",
    {
      logLevel: "error",
      schema: Schema.repo.OrgRepoInfo,
      preValidation: fastify.csrfProtection,
    },
    (req, res) => {
      const url = crypto.createHash("md5").update(req.url).digest("hex");
      const { redis } = fastify;
      redis.get(url, (err, val) => {
        if (val) {
          redis.expire(url, 300 * 1000); //refresh it since we're still using it
          res.send(val);
        } else if (!err && !val) {
          orgRepoInfo(req, res, fastify, {
            url,
            axios: opts.axios,
            github: opts.githubAPIWrapper,
          });
        } else {
          throw new Error(`Something Wrong with ${req.url} ${err}`);
        }
      });
    }
  );

  fastify.get(
    "/api/getTopContributors",
    {
      logLevel: "error",
      schema: Schema.repo.ContributorsRepoInfo,
      preValidation: fastify.csrfProtection,
    },
    (req, res) => {
      contributorsRepoInfo(req, res, fastify, {
        axios: opts.axios,
        github: opts.githubAPIWrapper,
      });
    }
  );

  fastify.post(
    "/api/images_from_markdown",
    {
      logLevel: "error",
      schema: Schema.repo.ImagesReadmeRepoInfo,
      preValidation: fastify.csrfProtection,
    },
    (req, res) => {
      const url = crypto.createHash("md5").update(req.url).digest("hex");
      const { redis } = fastify;
      redis.get(url, (err, val) => {
        if (val) {
          redis.expire(url, 300 * 1000); //refresh it since we're still using it
          res.send(val);
        } else if (!err && !val) {
          imagesRepoInfo(req, res, fastify, {
            url,
            axios: opts.axios,
            github: opts.githubAPIWrapper,
          });
        } else {
          throw new Error(`Something Wrong with ${req.url} ${err}`);
        }
      });
    }
  );

  fastify.get(
    "/api/markdown",
    {
      logLevel: "error",
      schema: Schema.repo.ReadmeRepoInfo,
      preValidation: fastify.csrfProtection,
    },
    (req, res) => {
      const urlReadMe = `${opts.config.getBestOfJS()}?fullName=${
        req.query.full_name
      }&branch=${req.query.branch}`;
      const url = crypto.createHash("md5").update(req.url).digest("hex");
      const { redis } = fastify;
      redis.get(url, (err, val) => {
        if (val) {
          redis.expire(url, 300 * 1000); //refresh it since we're still using it
          res.send(val);
        } else if (!err && !val) {
          readmeRepoInfo(req, res, fastify, {
            urlReadMe,
            url,
            axios: opts.axios,
            github: opts.githubAPIWrapper,
          });
        } else {
          throw new Error(`Something Wrong with ${req.url} ${err}`);
        }
      });
    }
  );

  fastify.get(
    "/api/search_topics",
    {
      logLevel: "error",
      schema: Schema.search.TopicsSearchInfo,
      preValidation: fastify.csrfProtection,
    },
    (req, res) => {
      const url = crypto.createHash("md5").update(req.url).digest("hex");
      const { redis } = fastify;
      redis.get(url, (err, val) => {
        if (val) {
          redis.expire(url, 300 * 1000); //refresh it since we're still using it
          res.send(val);
        } else if (!err && !val) {
          topicSearchInfo(req, res, fastify, {
            url,
            axios: opts.axios,
            github: opts.githubAPIWrapper,
          });
        } else {
          throw new Error(`Something Wrong with ${req.url} ${err}`);
        }
      });
    }
  );

  fastify.get(
    "/api/search_users",
    {
      logLevel: "error",
      schema: Schema.search.UsersSearchInfo,
      preValidation: fastify.csrfProtection,
    },
    (req, res) => {
      const url = crypto.createHash("md5").update(req.url).digest("hex");
      const { redis } = fastify;
      redis.get(url, (err, val) => {
        if (val) {
          redis.expire(url, 300 * 1000); //refresh it since we're still using it
          res.send(val);
        } else if (!err && !val) {
          usersSearchInfo(req, res, fastify, {
            url,
            axios: opts.axios,
            github: opts.githubAPIWrapper,
          });
        } else {
          throw new Error(`Something Wrong with ${req.url} ${err}`);
        }
      });
    }
  );

  fastify.get(
    "/api/setStarredMe",
    { logLevel: "error", preValidation: fastify.csrfProtection },
    (req, res) => {
      setStarredMe(req, res, fastify, {
        axios: opts.axios,
        github: opts.githubAPIWrapper,
      });
    }
  );

  fastify.get(
    "/api/removeStarredMe",
    { logLevel: "error", preValidation: fastify.csrfProtection },
    (req, res) => {
      removeStarredMe(req, res, fastify, {
        axios: opts.axios,
        github: opts.githubAPIWrapper,
      });
    }
  );

  fastify.post(
    "/authenticate",
    {
      logLevel: "error",
      schema: Schema.auth.GithubAccessToken,
      preValidation: fastify.csrfProtection,
    },
    (req, res) => {
      githubAccessToken(req, res, fastify, {
        axios: opts.axios,
        github: opts.githubAPIWrapper,
      });
    }
  );

  fastify.get(
    "/api/get_rate_limit",
    {
      logLevel: "error",
      schema: Schema.rateLimit.GetRateLimit,
      preValidation: fastify.csrfProtection,
    },
    (req, res) => {
      getRateLimit(req, res, fastify, {
        axios: opts.axios,
        github: opts.githubAPIWrapper,
      });
    }
  );

  fastify.get(
    "/api/subscribe_user",
    {
      logLevel: "error",
      schema: Schema.rssFeed.SubscribeUserFeed,
      preValidation: fastify.csrfProtection,
    },
    (req, res) => {
      subscribeUserFeed(req, res, fastify, {
        axios: opts.axios,
        github: opts.githubAPIWrapper,
      });
    }
  );

  fastify.get(
    "/api/setTokenGQL",
    { logLevel: "error", preValidation: fastify.csrfProtection },
    (req, res) => {
      setTokenGQL(req, res, fastify, {
        axios: opts.axios,
        github: opts.githubAPIWrapper,
      });
    }
  );

  fastify.get(
    "/api/getTokenGQL",
    { logLevel: "error", preValidation: fastify.csrfProtection },
    (req, res) => {
      getTokenGQL(req, res, fastify, {
        axios: opts.axios,
        github: opts.githubAPIWrapper,
      });
    }
  );

  fastify.get(
    "/api/destroyTokenGQL",
    { logLevel: "error", preValidation: fastify.csrfProtection },
    (req, res) => {
      destroyTokenGQL(req, res, fastify, {
        axios: opts.axios,
        github: opts.githubAPIWrapper,
      });
    }
  );

  fastify.post(
    "/api/auth_graphql",
    {
      logLevel: "error",
      schema: Schema.auth.TestTokenGQL,
      preValidation: fastify.csrfProtection,
    },
    (req, res) => {
      testTokenGQL(req, res, fastify, {
        axios: opts.axios,
        github: opts.githubAPIWrapper,
      });
    }
  );
  fastify.get(
    "/api/getValidGQLProperties",
    {
      logLevel: "error",
      preValidation: fastify.csrfProtection,
    },
    (req, res) => {
      getGQLFile(req, res, fastify);
    }
  );
  done();
}

module.exports = routes;
