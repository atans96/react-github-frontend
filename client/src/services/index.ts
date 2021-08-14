import { detectBrowser, readEnvironmentVariable } from '../util';
import { IDataOne } from '../typing/interface';
import { ImagesDataProps, MergedDataProps } from '../typing/type';
import { Observable } from '../utilities/observables/Observable';
import { noop } from '../util/util';
export const getAllGraphQLNavBar = async (username: string, signal: any) => {
  try {
    const response = await fetch(
      `https://${readEnvironmentVariable('GOLANG_HOST')}:${readEnvironmentVariable(
        'GOLANG_PORT'
      )}/server_uwebsocket/graphqlUserData?username=${username}`,
      {
        method: 'GET',
        signal,
      }
    );
    return await response.json();
  } catch (e) {
    console.log(e);
  }
};
export const getRSSFeed = async (rssUrl: string) => {
  try {
    const response = await fetch(
      `https://${readEnvironmentVariable('GOLANG_HOST')}:${readEnvironmentVariable(
        'GOLANG_PORT'
      )}/rssFeed?rssUrl=${rssUrl}`,
      {
        method: 'GET',
        keepalive: true,
        credentials: 'include',
      }
    );
    return await response.json();
  } catch (e) {
    console.log(e);
  }
};
export const endOfSession = async (username: string, cacheData: any) => {
  try {
    if (Object.keys(cacheData).length > 0) {
      const response = await fetch(
        `https://${readEnvironmentVariable('GOLANG_HOST')}:${readEnvironmentVariable(
          'GOLANG_PORT'
        )}/server_uwebsocket/end_of_session`,
        {
          method: 'POST',
          body: JSON.stringify({ data: cacheData, username }),
          credentials: 'include',
        }
      );
      return await response.json();
    }
  } catch (e) {
    console.log(e);
  }
};
export const getTopContributors = async (fullName: string) => {
  try {
    const response = await fetch(
      `https://${readEnvironmentVariable('GOLANG_HOST')}:${readEnvironmentVariable(
        'GOLANG_PORT'
      )}/server_uwebsocket/getTopContributors?full_name=${fullName}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );
    return await response.json();
  } catch (e) {
    console.log(e);
    return undefined;
  }
};
export const removeStarredMe = async (repoFullName: string) => {
  try {
    fetch(`https://api.github.com/user/starred/${repoFullName}`, {
      method: 'GET',
      headers: {
        Authorization: `${localStorage.getItem('token_type')} ${localStorage.getItem('access_token')}`,
      },
    }).then(noop);
  } catch (e) {
    console.log(e);
  }
};
export const setStarredMe = async (repoFullName: string) => {
  try {
    fetch(`https://api.github.com/user/starred/${repoFullName}`, {
      method: 'PUT',
      headers: {
        Authorization: `${localStorage.getItem('token_type')} ${localStorage.getItem('access_token')}`,
      },
    }).then(noop);
  } catch (e) {
    console.log(e);
  }
};
export const setTokenGQL = async (tokenGQL: string, username: string) => {
  try {
    const response = await fetch(
      `https://${readEnvironmentVariable('GOLANG_HOST')}:${readEnvironmentVariable(
        'GOLANG_PORT'
      )}/server_uwebsocket/setTokenGQL?username=${username}`,
      {
        method: 'GET',
        headers: {
          Authorization: `${tokenGQL}`,
        },
      }
    );
    return await response.json();
  } catch (e) {
    console.log(e);
  }
};
export const getTokenGQL = async (signal: any) => {
  try {
    const response = await fetch(
      `https://${readEnvironmentVariable('GOLANG_HOST')}:${readEnvironmentVariable(
        'GOLANG_PORT'
      )}/server_uwebsocket/getTokenGQL`,
      {
        method: 'GET',
        signal,
      }
    );
    return (await response.json()) as { tokenGQL: string };
  } catch (e) {
    console.log(e);
    return { tokenGQL: '' };
  }
};
export const removeTokenGQL = async () => {
  try {
    const response = await fetch(
      `https://${readEnvironmentVariable('GOLANG_HOST')}:${readEnvironmentVariable(
        'GOLANG_PORT'
      )}/server_uwebsocket/destroyTokenGQL`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );
    return await response.json();
  } catch (e) {
    console.log(e);
  }
};
export const removeToken = async () => {
  try {
    const response = await fetch(
      `https://${readEnvironmentVariable('GOLANG_HOST')}:${readEnvironmentVariable(
        'GOLANG_PORT'
      )}/server_uwebsocket/destroyToken`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );
    return await response.json();
  } catch (e) {
    console.log(e);
  }
};
let multiplier = 0;
let lastUrls: any = {};
export const getUser = ({
  signal,
  username,
  perPage,
  page,
  org = false,
  raw = false,
  AcceptHeader = 'v3',
  url = undefined,
}: {
  signal: any | undefined;
  username: string;
  perPage: number;
  page: number;
  org?: boolean;
  raw?: boolean;
  AcceptHeader?: string;
  url?: string;
}) => {
  return new Observable((observer) => {
    function execute() {
      let validUrl =
        url ||
        (org
          ? `https://api.github.com/orgs/${username}/repos?page=${page}&per_page=${perPage}`
          : `https://api.github.com/users/${username}/starred?page=${page}&per_page=${perPage}`);
      if (!lastUrls[validUrl]) {
        lastUrls[validUrl] = setInterval(() => {
          delete lastUrls[validUrl];
        }, 300000);
        return fetch(validUrl, {
          method: 'GET',
          signal,
          headers: {
            Authorization: `${localStorage.getItem('token_type')} ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json;charset=UTF-8',
            'User-Agent': `${detectBrowser()}`,
            Accept: `application/vnd.github.${AcceptHeader}${
              raw ? '.raw' : '+json'
            },application/vnd.github.mercy-preview+json,application/vnd.github.nebula-preview+json`,
          },
        })
          .then((res: any) => {
            try {
              const reader = res!.body!.getReader();
              if (perPage > 100) {
                multiplier += 1;
                if (perPage - multiplier * 100 > 0) {
                  page += 1;
                  observer.next({
                    iterator: async function* () {
                      while (true) {
                        const { done, value } = await reader.read();
                        if (done) {
                          break;
                        }
                        yield value; //pause the while loop until the caller below continue to call iterator again
                      }
                    },
                  });
                  execute();
                }
              }
              observer.next({
                iterator: async function* () {
                  while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                      break;
                    }
                    yield value; //pause the while loop until the caller below continue to call iterator again
                  }
                },
              });
              observer.complete();
              return true;
            } catch (e) {
              observer.error(e);
              observer.complete();
              return true;
            }
          })
          .catch((e) => {
            observer.error(e);
            observer.complete();
            return true;
          });
      } else {
        return new Promise((resolve) => resolve(true));
      }
    }
    execute().then(noop);
  }) as Observable<{ iterator: any }>;
};
export const getValidGQLProperties = async () => {
  try {
    const response = await fetch(`${readEnvironmentVariable('FS_ADDRESS')}/get_gql_properties`, {
      method: 'GET',
    });
    return await response.json();
  } catch (e) {
    console.log(e);
    return undefined;
  }
};
export const markdownParsing = async (full_name: string, branch: string, signal: any) => {
  try {
    const response = await fetch(
      `https://${readEnvironmentVariable('GOLANG_HOST')}:${readEnvironmentVariable(
        'GOLANG_PORT'
      )}/server_uwebsocket/markdown?full_name=${full_name}&branch=${branch}`,
      {
        method: 'GET',
        signal,
      }
    );
    return await response.json();
  } catch (e) {
    console.log(e);
    return undefined;
  }
};
export const session = async (end: boolean, signal?: any) => {
  try {
    const response = await fetch(
      `https://${readEnvironmentVariable('GOLANG_HOST')}:${readEnvironmentVariable('GOLANG_PORT')}/start?&end=${end}`,
      {
        method: 'GET',
        credentials: 'include',
        keepalive: true,
        signal,
      }
    );
    try {
      return await response.json();
    } catch (e) {
      return undefined;
    }
  } catch (e) {
    console.log(e);
    return { username: '', data: false };
  }
};
export const getRateLimitInfo = async ({
  signal,
  AcceptHeader = 'v3',
  raw = false,
}: {
  signal?: any;
  AcceptHeader?: string;
  raw?: boolean;
}) => {
  try {
    const response = await fetch(`https://api.github.com/rate_limit`, {
      method: 'GET',
      signal,
      headers: {
        Authorization: `${localStorage.getItem('token_type')} ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json;charset=UTF-8',
        'User-Agent': `${detectBrowser()}`,
        Accept: `application/vnd.github.${AcceptHeader}${
          raw ? '.raw' : '+json'
        },application/vnd.github.mercy-preview+json,application/vnd.github.nebula-preview+json`,
      },
    });
    return await response.json();
  } catch (e) {
    console.log(e);
    return undefined;
  }
};
export const requestGithubLogin = async (proxy_url: string, data: any, signal: any) => {
  try {
    const response = await fetch(proxy_url, {
      method: 'POST',
      keepalive: true,
      credentials: 'include',
      headers: {
        //trigger preflight request to browser
        'Content-Type': 'application/json',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
      },
      body: JSON.stringify(data),
      signal,
    });
    return await response.text();
  } catch (e) {
    console.log(e);
    return undefined;
  }
};
export const getSearchUsers = async ({
  query,
  signal,
  AcceptHeader = 'v3',
  raw = false,
}: {
  query: string;
  signal: any;
  AcceptHeader?: string;
  raw?: boolean;
}) => {
  try {
    const response = await fetch(`https://api.github.com/search/users?q=${query}`, {
      method: 'GET',
      signal,
      headers: {
        Authorization: `${localStorage.getItem('token_type')} ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json;charset=UTF-8',
        'User-Agent': `${detectBrowser()}`,
        Accept: `application/vnd.github.${AcceptHeader}${
          raw ? '.raw' : '+json'
        },application/vnd.github.mercy-preview+json,application/vnd.github.nebula-preview+json`,
      },
    });
    return await response.json();
  } catch (e) {
    console.log(e);
    return undefined;
  }
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
  try {
    const response = await fetch(
      `https://${readEnvironmentVariable('GOLANG_HOST')}:${readEnvironmentVariable(
        'GOLANG_PORT'
      )}/server_uwebsocket/search_topics?topic=${topic}&axiosCancel=${axiosCancel}`,
      {
        method: 'GET',
        credentials: 'include',
        signal,
      }
    );
    return (await response.json()) as IDataOne;
  } catch (e) {
    console.log(e);
    return undefined;
  }
};
export const subscribeToApollo = async ({
  signal,
  subscription,
}: {
  signal: any | undefined;
  subscription: PushSubscription;
}) => {
  try {
    const response = await fetch(`${readEnvironmentVariable('GRAPHQL_ADDRESS')}/subscribe/`, {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: {
        'Content-Type': 'application/json',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
      },
      signal,
      credentials: 'include',
    });
    return await response.json();
  } catch (e) {
    console.log(e);
    return undefined;
  }
};
export const getElasticSearchBertAutocomplete = async (query: string, signal: any) => {
  try {
    //TODO: instead of hitting the server all the time, use Redis https://www.linkedin.com/pulse/complete-guide-lighting-fast-autocomplete-search-suggestion-arya/ as buffer
    // so at startup, the server will send data to Kafka, then when the client online, we will tell Redis to fetch from Kafka storage.
    const response = await fetch(`${readEnvironmentVariable('PYTHON_BERT_AUTOCOMPLETE')}?q=${query}&docName=github`, {
      method: 'GET',
      signal,
    });
    return await response.json();
  } catch (e) {
    console.log(e);
  }
};
export const getElasticSearchBert = async (query: string, signal: any) => {
  try {
    //TODO: instead of hitting the server all the time, use Redis https://www.linkedin.com/pulse/complete-guide-lighting-fast-autocomplete-search-suggestion-arya/ as buffer
    // so at startup, the server will send data to Kafka, then when the client online, we will tell Redis to fetch from Kafka storage.
    const response = await fetch(`${readEnvironmentVariable('PYTHON_BERT')}?q=${query}&docName=github`, {
      method: 'GET',
      signal,
    });
    return (await response.json()) as MergedDataProps[];
  } catch (e) {
    console.log(e);
  }
};
export const requestGithubGraphQLLogin = async (token: string) => {
  try {
    const response = await fetch(
      `https://${readEnvironmentVariable('GOLANG_HOST')}:${readEnvironmentVariable(
        'GOLANG_PORT'
      )}/server_uwebsocket/auth_graphql`,
      {
        method: 'POST',
        keepalive: true,
        credentials: 'include',
        headers: {
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
        }),
      }
    );
    return (await response.json()) as { success: boolean };
  } catch (e) {
    console.log(e);
    return { success: false };
  }
};
export const convertToWebP = async (imgUrl: string) => {
  try {
    const response = await fetch(
      `https://${readEnvironmentVariable('GOLANG_HOST')}:${readEnvironmentVariable(
        'GOLANG_PORT'
      )}/convert_to_webp?imgUrl=${imgUrl}`,
      {
        method: 'GET',
      }
    );
    return (await response.json()) as { original: string };
  } catch (e) {
    console.log(e);
    return {
      original: '',
    };
  }
};
export const getFile = async (filename: string, signal: any) => {
  try {
    const response = await fetch(
      `https://${readEnvironmentVariable('GOLANG_HOST')}:${readEnvironmentVariable('GOLANG_PORT')}/${filename}`,
      {
        method: 'GET',
        headers: { 'Accept-Encoding': 'gzip' },
        signal,
      }
    );
    return await response.json();
  } catch (e) {
    console.log(e);
    return undefined;
  }
};
export const getRepoImages = async ({ signal, data }: { signal: any | undefined; data: any[] }) => {
  if (data) {
    try {
      //actually query_topic is not used at Node.Js but since we want to save this query to Redis, each request
      //must contain a different URL to save each request
      const response = await fetch(
        `https://${readEnvironmentVariable('GOLANG_HOST')}:${readEnvironmentVariable(
          'GOLANG_PORT'
        )}/images_from_markdown`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          keepalive: true,
          body: JSON.stringify({
            data,
          }),
          //Fastify not only supports async functions for use as controller code,
          // but it also automatically parses incoming requests into JSON if the Content-Type header suggests
          // the body is JSON. Thus, when using fetch request to Fastify, we need to use headers of content-type
          // so that the Json.stringify from client can be parsed into JSON, which will match our fluent-schema in Fastify (requires object, not string)
          // headers: new Headers({ 'content-type': 'application/json' }),
          signal,
        }
      );
      return (await response.json()) as ImagesDataProps[];
    } catch (e) {
      console.log(e);
      return undefined;
    }
  }
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
  try {
    const response = await fetch(`${readEnvironmentVariable('PYTHON_CRAWLER')}?query_topic=${topic}&page=${page}`, {
      method: 'POST',
      keepalive: true,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
      },
      body: JSON.stringify({
        data: data,
      }),
      signal,
    });
    return (await response.json()) as {
      webLink: string;
      profile: {
        bio: string;
        homeLocation: string;
        twitter: string;
        url: string;
        worksFor: string;
      };
    };
  } catch (e) {
    console.log(e);
    return {
      webLink: '',
      profile: {
        bio: '',
        homeLocation: '',
        twitter: '',
        url: '',
        worksFor: '',
      },
    };
  }
};
