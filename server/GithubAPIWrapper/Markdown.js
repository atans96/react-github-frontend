/**
 * @file
 * @copyright  2013 Michael Aufreiter (Development Seed) and 2016 Yahoo Inc.
 * @license    Licensed under {@link https://spdx.org/licenses/BSD-3-Clause-Clear.html BSD-3-Clause-Clear}.
 *             Github.js is freely distributable.
 */

const Requestable = require("./Requestable.js");

/**
 * Renders html from Markdown text
 */
class Markdown extends Requestable {
  /**
   * construct a Markdown
   * @param {Requestable.auth} auth - the credentials to authenticate to GitHub
   * @param {string} [apiBase] - the base Github API URL
   * @return {Promise} - the promise for the http request
   */
  constructor(auth, apiBase) {
    super(auth, apiBase);
  }

  getReadMe(full_name, options, cb) {
    return this._request("GET", `/repos/${full_name}/readme`, options, cb);
  }
}

module.exports = Markdown;
