import { readEnvironmentVariable } from '../util';
import { SearchUser } from '../typing/interface';
export const getAllGraphQLNavBar = async (username: string) => {
  const response = await fetch(
    `${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/graphqlUserData?username=${username}`,
    {
      method: 'GET',
    }
  );
  return await response.json();
};
export const endOfSession = async (username: string, cacheData: any) => {
  const response = await fetch(`${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/end_of_session?username=${username}`, {
    method: 'POST',
    body: JSON.stringify({ data: cacheData }),
    keepalive: true,
    credentials: 'include',
  });
  return await response.json();
};
export const getTopContributors = async (fullName: string) => {
  const response = await fetch(
    `${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/getTopContributors?full_name=${fullName}`,
    {
      method: 'GET',
      credentials: 'include',
    }
  );
  return await response.json();
};
export const removeStarredMe = async (repoFullName: string) => {
  const response = await fetch(
    `${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/removeStarredMe?repoFullName=${repoFullName}`,
    {
      method: 'GET',
    }
  );
  return await response.json();
};
export const setStarredMe = async (repoFullName: string) => {
  const response = await fetch(
    `${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/setStarredMe?repoFullName=${repoFullName}`,
    {
      method: 'GET',
    }
  );
  return await response.json();
};
export const setTokenGQL = async (tokenGQL: string, username: string) => {
  const response = await fetch(`${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/setTokenGQL?username=${username}`, {
    method: 'GET',
    headers: {
      Authorization: `${tokenGQL}`,
    },
  });
  return await response.json();
};
export const getTokenGQL = async () => {
  const response = await fetch(`${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/getTokenGQL`, {
    method: 'GET',
  });
  return await response.json();
};
export const removeTokenGQL = async () => {
  const response = await fetch(`${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/destroyTokenGQL`, {
    method: 'GET',
    credentials: 'include',
  });
  return await response.json();
};
export const removeToken = async () => {
  const response = await fetch(`${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/destroyToken`, {
    method: 'GET',
    credentials: 'include',
  });
  return await response.json();
};
export const getUser = async ({
  signal,
  username,
  perPage,
  page,
  axiosCancel = false,
}: {
  signal: any | undefined;
  username: string;
  perPage: number;
  page: number;
  axiosCancel: boolean;
}) => {
  if (username !== '') {
    const response = await fetch(
      `${readEnvironmentVariable(
        'UWEBSOCKET_ADDRESS'
      )}/users?username=${username}&page=${page}&per_page=${perPage}&axiosCancel=${axiosCancel}`,
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
  axiosCancel = false,
}: {
  signal: any | undefined;
  org: string;
  perPage: number;
  page: number;
  axiosCancel: boolean;
}) => {
  if (org !== '') {
    const response = await fetch(
      `${readEnvironmentVariable(
        'UWEBSOCKET_ADDRESS'
      )}/org?org=${org}&page=${page}&per_page=${perPage}&axiosCancel=${axiosCancel}`,
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
  const response = await fetch(`${readEnvironmentVariable('FS_ADDRESS')}/get_gql_properties`, {
    method: 'GET',
  });
  return await response.json();
};
export const markdownParsing = async (full_name: string, branch: string) => {
  const response = await fetch(
    `${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/markdown?full_name=${full_name}&branch=${branch}`,
    {
      method: 'GET',
    }
  );
  return await response.json();
};
export const session = async (end: boolean) => {
  const response = await fetch(`${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/start?&end=${end}`, {
    method: 'GET',
    credentials: 'include',
    keepalive: true,
  });
  return await response.json();
};
export const getRateLimitInfo = async () => {
  const response = await fetch(`${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/get_rate_limit`, {
    method: 'GET',
    credentials: 'include',
  });
  return await response.json();
};

export const verifyJWTToken = async (token: string, username: string, isLoggedIn: boolean) => {
  const response = await fetch(
    `${readEnvironmentVariable(
      'UWEBSOCKET_ADDRESS'
    )}/verifyJWTToken?token=${token}&username=${username}&isLoggedIn=${isLoggedIn}`,
    {
      method: 'GET',
    }
  );
  return await response.json();
};
export const requestGithubLogin = async (proxy_url: string, data: any) => {
  const response = await fetch(proxy_url, {
    method: 'POST',
    keepalive: true,
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return await response.json();
};
export const getSearchUsers = async (query: string) => {
  const response = await fetch(`${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/search_users?username=${query}`, {
    method: 'GET',
    credentials: 'include',
  });
  return (await response.json()) as SearchUser;
};
export const getSearchTopics = async ({
  axiosCancel = false,
  signal,
  topic,
}: {
  axiosCancel: boolean;
  signal: any | undefined;
  topic: string;
}) => {
  const response = await fetch(
    `${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/search_topics?topic=${topic}&axiosCancel=${axiosCancel}`,
    {
      method: 'GET',
      credentials: 'include',
      signal,
    }
  );
  return await response.json();
};
export const getElasticSearchBertAutocomplete = async (query: string) => {
  //TODO: instead of hitting the server all the time, use Redis https://www.linkedin.com/pulse/complete-guide-lighting-fast-autocomplete-search-suggestion-arya/ as buffer
  // so at startup, the server will send data to Kafka, then when the client online, we will tell Redis to fetch from Kafka storage.
  const response = await fetch(`${readEnvironmentVariable('PYTHON_BERT_AUTOCOMPLETE')}?q=${query}&docName=github`, {
    method: 'GET',
  });
  return await response.json();
};
export const getElasticSearchBert = async (query: string) => {
  //TODO: instead of hitting the server all the time, use Redis https://www.linkedin.com/pulse/complete-guide-lighting-fast-autocomplete-search-suggestion-arya/ as buffer
  // so at startup, the server will send data to Kafka, then when the client online, we will tell Redis to fetch from Kafka storage.
  const response = await fetch(`${readEnvironmentVariable('PYTHON_BERT')}?q=${query}&docName=github`, {
    method: 'GET',
  });
  return await response.json();
};
export const requestGithubGraphQLLogin = async (token: string) => {
  const response = await fetch(`${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/auth_graphql`, {
    method: 'POST',
    keepalive: true,
    credentials: 'include',
    body: JSON.stringify({
      token: token,
    }),
  });
  return await response.json();
};
export const convertToWebP = async (imgUrl: string) => {
  const response = await fetch(`${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/convert_to_webp?imgUrl=${imgUrl}`, {
    method: 'GET',
  });
  return await response.json();
};
export const getFile = async (filename: string) => {
  const response = await fetch(`${readEnvironmentVariable('FS_ADDRESS')}/get_github_languages?filename=${filename}`, {
    method: 'GET',
    headers: { 'Accept-Encoding': 'gzip' },
  });
  return await response.json();
};
export const getRepoImages = async ({
  axiosCancel = false,
  signal,
  data,
  topic,
  page,
}: {
  axiosCancel: boolean;
  signal: any | undefined;
  data: any[];
  topic: string;
  page: number;
}) => {
  //actually query_topic is not used at Node.Js but since we want to save this query to Redis, each request
  //must contain a different URL to save each request
  const response = await fetch(
    `${readEnvironmentVariable(
      'UWEBSOCKET_ADDRESS'
    )}/images_from_markdown?query_topic=${topic}&page=${page}&axiosCancel=${axiosCancel}`,
    {
      method: 'POST',
      keepalive: true,
      body: JSON.stringify({
        data: data,
      }),
      //Fastify not only supports async functions for use as controller code,
      // but it also automatically parses incoming requests into JSON if the Content-Type header suggests
      // the body is JSON. Thus, when using fetch request to Fastify, we need to use headers of content-type
      // so that the Json.stringify from client can be parsed into JSON, which will match our fluent-schema in Fastify (requires object, not string)
      // headers: new Headers({ 'content-type': 'application/json' }),
      signal,
    }
  );
  return await response.json();
};
export const crawlerPython = async ({
  signal,
  data,
  topic,
  page,
}: {
  signal: any | undefined;
  data: any[];
  topic: string;
  page: number;
}) => {
  const response = await fetch(`${readEnvironmentVariable('PYTHON_CRAWLER')}?query_topic=${topic}&page=${page}`, {
    method: 'POST',
    keepalive: true,
    credentials: 'include',
    body: JSON.stringify({
      data: data,
    }),
    signal,
  });
  return await response.json();
};
