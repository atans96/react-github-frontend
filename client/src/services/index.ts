import { readEnvironmentVariable } from '../util';
import { SearchUser } from '../typing/interface';

export const getAllGraphQLNavBar = async (username: string) => {
  const response = await fetch(`/api/graphqlUserData?username=${username}`, {
    method: 'GET',
    credentials: 'include',
  });
  return await response.json();
};
export const getTopContributors = async (fullName: string, token: string | null | undefined) => {
  const response = await fetch(`/api/getTopContributors?full_name=${fullName}&token=${token}`, {
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
    credentials: 'include',
  });
  return await response.json();
};
export const subscribeUser = async (username: string, signal: any) => {
  if (username !== '') {
    const response = await fetch(`/api/subscribe_user?username=${username}`, {
      method: 'GET',
      credentials: 'include',
      signal,
    });
    return await response.json();
  }
};
export const getUser = async ({
  signal,
  username,
  perPage,
  page,
  token,
  axiosCancel = false,
}: {
  signal: any | undefined;
  username: string;
  perPage: number;
  page: number;
  token: string | null | undefined;
  axiosCancel: boolean;
}) => {
  if (username !== '') {
    const response = await fetch(
      `/api/users?username=${username}&page=${page}&per_page=${perPage}&token=${token}&axiosCancel=${axiosCancel}`,
      {
        method: 'GET',
        credentials: 'include',
        signal,
      }
    );
    return await response.json();
  }
};
export const getOrg = async ({
  signal,
  org,
  perPage,
  page,
  token,
  axiosCancel = false,
}: {
  signal: any | undefined;
  org: string;
  perPage: number;
  page: number;
  token: string | null | undefined;
  axiosCancel: boolean;
}) => {
  if (org !== '') {
    const response = await fetch(
      `/api/org?org=${org}&page=${page}&per_page=${perPage}&token=${token}&axiosCancel=${axiosCancel}`,
      {
        method: 'GET',
        credentials: 'include',
        signal,
      }
    );
    return await response.json();
  }
};
export const getValidGQLProperties = async () => {
  const response = await fetch(`/api/getValidGQLProperties`, {
    method: 'GET',
    credentials: 'include',
  });
  return await response.json();
};
export const markdownParsing = async (full_name: string, branch: string, token: string | null | undefined) => {
  const response = await fetch(`/api/markdown?full_name=${full_name}&branch=${branch}&token=${token}`, {
    method: 'GET',
    credentials: 'include',
  });
  return await response.json();
};
export const getRateLimitInfo = async (token: string | null | undefined) => {
  const response = await fetch(`/api/get_rate_limit?token=${token === null ? '' : token}`, {
    method: 'GET',
    credentials: 'include',
  });
  return await response.json();
};
export const verifyJWTToken = async (token: string, username: string, isLoggedIn: boolean) => {
  const response = await fetch(`/api/verifyJWTToken?token=${token}&username=${username}&isLoggedIn=${isLoggedIn}`, {
    method: 'GET',
    credentials: 'include',
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
  const response = await fetch(`/api/search_users?username=${query}&token=${token}`, {
    method: 'GET',
    credentials: 'include',
  });
  return (await response.json()) as SearchUser;
};
export const getSearchTopics = async ({
  axiosCancel = false,
  signal,
  topic,
  token,
}: {
  axiosCancel: boolean;
  signal: any | undefined;
  topic: string;
  token: string | null | undefined;
}) => {
  const response = await fetch(`/api/search_topics?topic=${topic}&token=${token}&axiosCancel=${axiosCancel}`, {
    method: 'GET',
    credentials: 'include',
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
    credentials: 'include',
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
    credentials: 'include',
  });
  return await response.json();
};
export const getRepoImages = async ({
  axiosCancel = false,
  signal,
  data,
  topic,
  page,
  token,
}: {
  axiosCancel: boolean;
  signal: any | undefined;
  data: any[];
  topic: string;
  page: number;
  token: string | null | undefined;
}) => {
  //actually query_topic is not used at Node.Js but since we want to save this query to Redis, each request
  //must contain a different URL to save each request
  return await fetch(
    `/api/images_from_markdown?query_topic=${topic}&page=${page}&axiosCancel=${axiosCancel}&token=${token}`,
    {
      method: 'POST',
      body: JSON.stringify({
        data: data,
      }),
      //Fastify not only supports async functions for use as controller code,
      // but it also automatically parses incoming requests into JSON if the Content-Type header suggests
      // the body is JSON. Thus, when using fetch request to Fastify, we need to use headers of content-type
      // so that the Json.stringify from client can be parsed into JSON, which will match our fluent-schema in Fastify (requires object, not string)
      headers: new Headers({ 'content-type': 'application/json' }),
      signal,
    }
  );
};
export const crawlerPython = async ({
  axiosCancel = false,
  signal,
  data,
  topic,
  page,
  token,
}: {
  axiosCancel: boolean;
  signal: any | undefined;
  data: any[];
  topic: string;
  page: number;
  token: string | null | undefined;
}) => {
  const response = await fetch(
    `${readEnvironmentVariable(
      'PYTHON_CRAWLER'
    )}?query_topic=${topic}&page=${page}&axiosCancel=${axiosCancel}&token=${token}`,
    {
      method: 'POST',
      body: JSON.stringify({
        data: data,
      }),
      headers: new Headers({ 'content-type': 'application/json' }),
      signal,
    }
  );
  return await response.json();
};
