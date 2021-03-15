import { readEnvironmentVariable } from '../util';
function rateLimitInfo(token: string) {
  return new Promise(function (resolve, reject) {
    (async () => {
      let rateLimit = null;
      do {
        rateLimit = await getRateLimitInfo(token);
      } while (rateLimit === null);
      resolve(rateLimit);
    })();
  });
}
async function rotateTokens() {
  const tokens = readEnvironmentVariable('TOKENS')!.split(',');
  let validToken = '';
  for (const token of tokens) {
    const rateLimit: any = await rateLimitInfo(token);
    if (rateLimit.rateLimit.used > 10 || rateLimit.rateLimitGQL.used > 10 || rateLimit.rateLimitSearch.used > 5) {
      validToken = token;
      break;
    }
  }
  return validToken;
}
export const getTopContributors = async (fullName: string, token: string | null) => {
  const toke = await rotateTokens();
  const validToken = toke.length === 0 ? token : toke;
  const response = await fetch(`/api/getTopContributors?fullName=${fullName}&token=${validToken}`, {
    method: 'GET',
    credentials: 'include',
  });
  return await response.json();
};
export const removeStarredMe = async (repoFullName: string, token: string | null) => {
  const response = await fetch(`/api/removeStarredMe?repoFullName=${repoFullName}&token=${token}`, {
    method: 'GET',
    credentials: 'include',
  });
  return await response.json();
};
export const setStarredMe = async (repoFullName: string, token: string | null) => {
  const response = await fetch(`/api/setStarredMe?repoFullName=${repoFullName}&token=${token}`, {
    method: 'GET',
    credentials: 'include',
  });
  return await response.json();
};
export const setTokenGQL = async (tokenGQL: string) => {
  const response = await fetch(`/api/setTokenGQL?tokenGQL=${tokenGQL}`, {
    method: 'GET',
    credentials: 'include',
  });
  return await response.json();
};
export const getTokenGQL = async () => {
  const response = await fetch(`/api/getTokenGQL`, {
    method: 'GET',
    credentials: 'include',
  });
  return await response.json();
};
export const removeTokenGQL = async () => {
  const response = await fetch(`/api/destroyTokenGQL`, {
    method: 'GET',
  });
  return await response.json();
};
export const subscribeUser = async (username: string, signal: any) => {
  if (username !== '') {
    const response = await fetch(`/api/subscribe_user?username=${username}`, {
      method: 'GET',
      signal,
    });
    return await response.json();
  }
};
export const getUser = async (
  username: string,
  perPage: number,
  page: number,
  token: string | null,
  noImageQuery = false
) => {
  if (username !== '') {
    const response = await fetch(
      `/api/users?username=${username}&page=${page}&per_page=${perPage}&token=${
        token === null ? '' : token
      }&noImageQuery=${noImageQuery}`,
      {
        method: 'GET',
      }
    );
    return await response.json();
  }
};
export const getOrg = async (org: string, perPage: number, page: number, token: string | null) => {
  if (org !== '') {
    const response = await fetch(
      `/api/org?org=${org}&page=${page}&per_page=${perPage}&token=${token === null ? '' : token}`,
      {
        method: 'GET',
      }
    );
    return await response.json();
  }
};
export const getValidGQLProperties = async () => {
  const response = await fetch(`/api/getValidGQLProperties`, {
    method: 'GET',
  });
  return await response.json();
};
export const markdownParsing = async (full_name: string, branch: string) => {
  const response = await fetch(`/api/markdown?full_name=${full_name}&branch=${branch}`);
  return await response.json();
};
export const getRateLimitInfo = async (token: string | null) => {
  const response = await fetch(`/api/get_rate_limit?token=${token === null ? '' : token}`, {
    method: 'GET',
  });
  return await response.json();
};
export const verifyJWTToken = async (token: string, username: string, isLoggedIn: boolean) => {
  const response = await fetch(`/api/verifyJWTToken?token=${token}&username=${username}&isLoggedIn=${isLoggedIn}`, {
    method: 'GET',
  });
  return await response.json();
};
export const requestGithubLogin = async (proxy_url: string, data: any) => {
  const response = await fetch(proxy_url, {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify(data),
    headers: new Headers({ 'content-type': 'application/json' }),
  });
  return await response.json();
};
export const getSearchUsers = async (query: string, token: string | null) => {
  const toke = await rotateTokens();
  const validToken = toke.length === 0 ? token : toke;
  const response = await fetch(`/api/search_users?user=${query}&token=${validToken === null ? '' : validToken}`, {
    method: 'GET',
  });
  return await response.json();
};
export const getSearchTopics = async (topic: string, token: string | null) => {
  const toke = await rotateTokens();
  const validToken = toke.length === 0 ? token : toke;
  const response = await fetch(`/api/search_topics?topic=${topic}&token=${validToken === null ? '' : validToken}`, {
    method: 'GET',
  });
  return await response.json();
};
export const getElasticSearchBert = async (query: string) => {
  const response = await fetch(`${readEnvironmentVariable('BERT')}?q=${query}&docName=github`, {
    method: 'GET',
    mode: 'cors',
  });
  return await response.json();
};
export const requestGithubGraphQLLogin = async (token: string) => {
  const response = await fetch('/api/auth_graphql', {
    method: 'POST',
    body: JSON.stringify({
      token: token,
    }),
    headers: new Headers({ 'content-type': 'application/json' }),
  });
  return await response.json();
};
export const getRepoImages = async (data: any, topic: string, page: number, token: string) => {
  //actually query_topic is not used at Node.Js but since we want to save this query to Redis, each request
  //must contain a different URL to save each request
  const validToken = await rotateTokens();
  const response = await fetch(`/api/images_from_markdown?query_topic=${topic}&page=${page}`, {
    method: 'POST',
    body: JSON.stringify({
      data: data,
      token: validToken.length === 0 ? token : validToken,
    }),
    //Fastify not only supports async functions for use as controller code,
    // but it also automatically parses incoming requests into JSON if the Content-Type header suggests
    // the body is JSON. Thus, when using fetch request to Fastify, we need to use headers of content-type
    // so that the Json.stringify from client can be parsed into JSON, which will match our fluent-schema in Fastify (requires object, not string)
    headers: new Headers({ 'content-type': 'application/json' }),
  });
  return await response.json();
};
