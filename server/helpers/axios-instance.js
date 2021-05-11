let ApiService = (function () {
  //As you can see we create an IIFE, holding instance of axios client in its scope.
  // IIFE immediately resolves to a function containing get, and post methods.
  // This way, we not only create a singleton instance of http, but also encapsulated axios from the rest of out program.
  let axios = require("axios");
  axios.defaults.withCredentials = true;
  const CancelToken = axios.CancelToken;
  let cancel;
  axios.interceptors.request.use(
    (req) => {
      if (!!req.query?.cancelToken) {
        cancel(); // cancel request
      }
      if (req.query?.cancelToken !== undefined) {
        req.cancelToken = new CancelToken(function executor(c) {
          cancel = c;
        });
      }

      return req;
    },
    function (error) {
      return Promise.reject(error);
    }
  );
  return axios;
})();

module.exports = ApiService;
