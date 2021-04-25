/**
 * @file
 * @copyright  2013 Michael Aufreiter (Development Seed) and 2016 Yahoo Inc.
 * @license    Licensed under {@link https://spdx.org/licenses/BSD-3-Clause-Clear.html BSD-3-Clause-Clear}.
 *             Github.js is freely distributable.
 */
/* eslint valid-jsdoc: ["error", {"requireReturnDescription": false}] */

const Gist = require("./Gist.js");
const User = require("./User.js");
const Issue = require("./Issue.js");
const Search = require("./Search.js");
const RateLimit = require("./RateLimit.js");
const Repository = require("./Repository.js");
const Organization = require("./Organization.js");
const Team = require("./Team.js");
const Markdown = require("./Markdown.js");
const Project = require("./Project.js");

/**
 * GitHub encapsulates the functionality to create various API wrapper objects.
 */
class GitHub {
  /**
   * Create a new GitHub.
   * @param {Requestable.auth} [auth] - the credentials to authenticate to Github. If auth is
   *                                  not provided requests will be made unauthenticated
   * @param axios
   * @param {string} [apiBase=https://api.github.com] - the base Github API URL
   */
  constructor(auth, axios, apiBase = "https://api.github.com") {
    this.__apiBase = apiBase;
    this.__auth = auth || {};
    this.axios = axios;
  }

  /**
   * Create a new Gist wrapper
   * @param {string} [id] - the id for the gist, leave undefined when creating a new gist
   * @return {Gist}
   */
  getGist(id) {
    return new Gist(id, this.__auth, this.__apiBase, this.axios);
  }

  /**
   * Create a new User wrapper
   * @param {string} [user] - the name of the user to get information about
   *                        leave undefined for the authenticated user
   * @return {User}
   */
  getUser(user, per_page) {
    return new User(user, this.__auth, this.__apiBase, this.axios);
  }

  /**
   * Create a new Organization wrapper
   * @param {string} organization - the name of the organization
   * @return {Organization}
   */
  getOrganization(organization) {
    return new Organization(
      organization,
      this.__auth,
      this.__apiBase,
      this.axios
    );
  }

  /**
   * create a new Team wrapper
   * @param {string} teamId - the name of the team
   * @return {Team}
   */
  getTeam(teamId) {
    return new Team(teamId, this.__auth, this.__apiBase, this.axios);
  }

  /**
   * Create a new Repository wrapper
   * @return {Repository}
   * @param fullName
   */
  getRepo(fullName) {
    return new Repository(fullName, this.__auth, this.__apiBase, this.axios);
  }

  /**
   * Create a new Issue wrapper
   * @param {string} user - the user who owns the repository
   * @param {string} repo - the name of the repository
   * @return {Issue}
   */
  getIssues(user, repo) {
    return new Issue(
      this._getFullName(user, repo),
      this.__auth,
      this.__apiBase,
      this.axios
    );
  }

  /**
   * Create a new Search wrapper
   * @param {string} query - the query to search for
   * @return {Search}
   */
  search(query) {
    return new Search(query, this.__auth, this.__apiBase, this.axios);
  }

  /**
   * Create a new RateLimit wrapper
   * @return {RateLimit}
   */
  getRateLimit() {
    return new RateLimit(this.__auth, this.__apiBase, this.axios);
  }

  /**
   * Create a new Markdown wrapper
   * @return {Markdown}
   */
  getMarkdown() {
    return new Markdown(this.__auth, this.__apiBase, this.axios);
  }

  /**
   * Create a new Project wrapper
   * @param {string} id - the id of the project
   * @return {Project}
   */
  getProject(id) {
    return new Project(id, this.__auth, this.__apiBase, this.axios);
  }

  /**
   * Computes the full repository name
   * @param {string} user - the username (or the full name)
   * @param {string} repo - the repository name, must not be passed if `user` is the full name
   * @return {string} the repository's full name
   */
  _getFullName(user, repo) {
    let fullname = user;

    if (repo) {
      fullname = `${user}/${repo}`;
    }

    return fullname;
  }
}
module.exports = GitHub;
