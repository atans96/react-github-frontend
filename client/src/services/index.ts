import { readEnvironmentVariable } from '../util';
import { RepoRenderImages, SearchUser } from '../typing/interface';

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
  //TODO: in production, user only get 1 token, that is provided by him/her
  const tokens = readEnvironmentVariable('TOKENS')!.split(',');
  let validToken = tokens.slice()[0];
  while (tokens.length) {
    const token = tokens.shift();
    const rateLimit: any = await rateLimitInfo(token!);
    if (rateLimit.rateLimit.limit > 10 || rateLimit.rateLimitGQL.limit > 10 || rateLimit.rateLimitSearch.limit > 5) {
      validToken = token!;
      break;
    }
  }
  return validToken;
}

export const getAllGraphQLNavBar = async (username: string) => {
  const response = await fetch(`/api/graphqlUserData?username=${username}`, {
    method: 'GET',
    credentials: 'include',
  });
  return await response.json();
};
export const getTopContributors = async (fullName: string, token: string | null | undefined) => {
  const toke = await rotateTokens();
  const validToken = toke.length === 0 ? token : toke;
  const response = await fetch(`/api/getTopContributors?fullName=${fullName}&token=${validToken}`, {
    method: 'GET',
    credentials: 'include',
  });
  return await response.json();
};
export const removeStarredMe = async (repoFullName: string, token: string | null | undefined) => {
  const response = await fetch(`/api/removeStarredMe?repoFullName=${repoFullName}&token=${token}`, {
    method: 'GET',
    credentials: 'include',
  });
  return await response.json();
};
export const setStarredMe = async (repoFullName: string, token: string | null | undefined) => {
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
  signal: any | undefined,
  username: string,
  perPage: number,
  page: number,
  token: string | null | undefined
) => {
  if (username !== '') {
    const toke = await rotateTokens();
    const validToken = toke.length === 0 ? token : toke;
    const response = await fetch(
      `/api/users?username=${username}&page=${page}&per_page=${perPage}&token=${token === null ? '' : validToken}`,
      {
        method: 'GET',
        signal,
      }
    );
    return await response.json();
  }
};
export const getOrg = async (
  signal: any | undefined,
  org: string,
  perPage: number,
  page: number,
  token: string | null | undefined
) => {
  if (org !== '') {
    const toke = await rotateTokens();
    const validToken = toke.length === 0 ? token : toke;
    const response = await fetch(
      `/api/org?org=${org}&page=${page}&per_page=${perPage}&token=${token === null ? '' : validToken}`,
      {
        method: 'GET',
        signal,
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
export const markdownParsing = async (full_name: string, branch: string, token: string | null | undefined) => {
  const toke = await rotateTokens();
  const validToken = toke.length === 0 ? token : toke;
  const response = await fetch(
    `/api/markdown?full_name=${full_name}&branch=${branch}&token=${token === null ? '' : validToken}`
  );
  return await response.json();
};
export const getRateLimitInfo = async (token: string | null | undefined) => {
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
export const getSearchUsers = async (query: string, token: string | null | undefined) => {
  const toke = await rotateTokens();
  const validToken = toke.length === 0 ? token : toke;
  const response = await fetch(`/api/search_users?user=${query}&token=${validToken === null ? '' : validToken}`, {
    method: 'GET',
  });
  return (await response.json()) as SearchUser;
};
export const getSearchTopics = async (signal: any, topic: string, token: string | null | undefined) => {
  const toke = await rotateTokens();
  const validToken = toke.length === 0 ? token : toke;
  const response = await fetch(`/api/search_topics?topic=${topic}&token=${validToken === null ? '' : validToken}`, {
    method: 'GET',
    signal,
  });
  return await response.json();
};
export const getElasticSearchBertAutocomplete = async (query: string) => {
  const response = await fetch(`${readEnvironmentVariable('BERT_AUTOCOMPLETE')}?q=${query}&docName=github`, {
    method: 'GET',
    mode: 'cors',
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
export const convertToWebP = async (imgUrl: string) => {
  const response = await fetch(`/api/convert_to_webp?imgUrl=${imgUrl}`, {
    method: 'GET',
  });
  return await response.json();
};
export const getRepoImages = async (signal: any, data: any[], topic: string, page: number, token: string) => {
  //actually query_topic is not used at Node.Js but since we want to save this query to Redis, each request
  //must contain a different URL to save each request
  const toke = await rotateTokens();
  const validToken = toke.length === 0 ? token : toke;
  const response = await fetch(`/api/images_from_markdown?query_topic=${topic}&page=${page}`, {
    method: 'POST',
    body: JSON.stringify({
      data: data,
      token: validToken,
    }),
    //Fastify not only supports async functions for use as controller code,
    // but it also automatically parses incoming requests into JSON if the Content-Type header suggests
    // the body is JSON. Thus, when using fetch request to Fastify, we need to use headers of content-type
    // so that the Json.stringify from client can be parsed into JSON, which will match our fluent-schema in Fastify (requires object, not string)
    headers: new Headers({ 'content-type': 'application/json' }),
    signal,
  });
  return (await response.json()) as RepoRenderImages;
};
export const convertToWebP = async (imgUrl: string) => {
  const response = await fetch(`/api/convert_to_webp?imgUrl=${imgUrl}`, {
    method: 'GET',
  });
  return await response.json();
};
