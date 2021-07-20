import { readEnvironmentVariable } from '../util';
import { IDataOne, SearchUser } from '../typing/interface';
import { ImagesDataProps, MergedDataProps } from '../typing/type';
import { Observable } from '../utilities/observables/Observable';
function getPaginationInfo(linksHeader = '') {
  const links = linksHeader.split(/\s*,\s*/); // splits and strips the urls
  return links.reduce(function (parsed_data: string[], link: any) {
    parsed_data[link.match(/rel="(.*?)"/)[1]] = link.match(/<(.*)>/)[1].match(/page=(.*?)\&/)[1];
    return parsed_data;
  }, {} as any);
}
function getNextURL(linksHeader = '') {
  const links = linksHeader.split(/\s*,\s*/); // splits and strips the urls
  return links.reduce(function (nextUrl: string, link) {
    if (link.search(/rel="next"/) !== -1) {
      return (link.match(/<(.*)>/) ?? [])[1];
    }

    return nextUrl;
  }, '');
}
export const getAllGraphQLNavBar = async (username: string) => {
  try {
    const response = await fetch(
      `${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/graphqlUserData?username=${username}`,
      {
        method: 'GET',
      }
    );
    return await response.json();
  } catch (e) {
    console.log(e);
  }
};
export const endOfSession = async (username: string, cacheData: any) => {
  try {
    const response = await fetch(
      `${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/end_of_session?username=${username}`,
      {
        method: 'POST',
        body: JSON.stringify({ data: cacheData }),
        keepalive: true,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
        },
      }
    );
    return await response.json();
  } catch (e) {
    console.log(e);
  }
};
export const getTopContributors = async (fullName: string) => {
  try {
    const response = await fetch(
      `${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/getTopContributors?full_name=${fullName}`,
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
    const response = await fetch(
      `${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/removeStarredMe?repoFullName=${repoFullName}`,
      {
        method: 'GET',
      }
    );
    return await response.json();
  } catch (e) {
    console.log(e);
  }
};
export const setStarredMe = async (repoFullName: string) => {
  try {
    const response = await fetch(
      `${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/setStarredMe?repoFullName=${repoFullName}`,
      {
        method: 'GET',
      }
    );
    return await response.json();
  } catch (e) {
    console.log(e);
  }
};
export const setTokenGQL = async (tokenGQL: string, username: string) => {
  try {
    const response = await fetch(`${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/setTokenGQL?username=${username}`, {
      method: 'GET',
      headers: {
        Authorization: `${tokenGQL}`,
      },
    });
    return await response.json();
  } catch (e) {
    console.log(e);
  }
};
export const getTokenGQL = async () => {
  try {
    const response = await fetch(`${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/getTokenGQL`, {
      method: 'GET',
    });
    return (await response.json()) as { tokenGQL: string };
  } catch (e) {
    console.log(e);
    return { tokenGQL: '' };
  }
};
export const removeTokenGQL = async () => {
  try {
    const response = await fetch(`${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/destroyTokenGQL`, {
      method: 'GET',
      credentials: 'include',
    });
    return await response.json();
  } catch (e) {
    console.log(e);
  }
};
export const removeToken = async () => {
  try {
    const response = await fetch(`${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/destroyToken`, {
      method: 'GET',
      credentials: 'include',
    });
    return await response.json();
  } catch (e) {
    console.log(e);
  }
};
let multiplier = 0;
let headers = {};
let last: any;
export const getUser = ({
  signal,
  username,
  perPage,
  page,
  raw = false,
  AcceptHeader = 'v3',
}: {
  signal: any | undefined;
  username: string;
  perPage: number;
  page: number;
  raw?: boolean;
  AcceptHeader?: string;
}) => {
  return new Observable((observer) => {
    last = last || '';
    fetch(`https://raw.githubusercontent.com/wa1618i/te/master/test.json`, {
      method: 'GET',
      signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/37.0.2062.94 Chrome/37.0.2062.94 Safari/537.36',
      },
    })
      .then((res: any) => {
        try {
          const reader = res!.body!.getReader();
          if (res.headers.link) {
            if ('last' in getPaginationInfo(res.headers.link)) {
              headers = getPaginationInfo(res.headers.link);
            } else {
              headers = {
                last: last - 1,
              };
            }
            if (perPage > 100) {
              multiplier += 1;
              const stillHasNextPage = perPage - multiplier * 100 > 0;
              const nextUrl = getNextURL(res.headers.link)
                ?.match(/([&\?]page=[0-9]*)/g)
                ?.shift()
                ?.split('=')
                .pop();
              if (nextUrl) {
                perPage = Number(nextUrl);
              }
              if (stillHasNextPage && nextUrl !== undefined) {
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
                  paginationInfoData: headers,
                });
                return getUser({ signal, username, perPage, page, raw, AcceptHeader });
              }
            }
          } else {
            headers = {
              next: 0,
              last: 1,
            };
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
            paginationInfoData: headers,
          });
          observer.complete();
        } catch (e) {
          observer.error(e);
          observer.complete();
        }
      })
      .catch((e) => {
        observer.error(e);
        observer.complete();
      });
  }) as Observable<{ iterator: any; paginationInfoData: any }>;
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
  try {
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
  } catch (e) {
    console.log(e);
  }
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
export const markdownParsing = async (full_name: string, branch: string) => {
  try {
    const response = await fetch(
      `${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/markdown?full_name=${full_name}&branch=${branch}`,
      {
        method: 'GET',
      }
    );
    return await response.json();
  } catch (e) {
    console.log(e);
    return undefined;
  }
};
export const session = async (end: boolean) => {
  try {
    const response = await fetch(`${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/start?&end=${end}`, {
      method: 'GET',
      credentials: 'include',
      keepalive: true,
    });
    return await response.json();
  } catch (e) {
    console.log(e);
    return { username: '', data: false };
  }
};
export const getRateLimitInfo = async () => {
  try {
    const response = await fetch(`${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/get_rate_limit`, {
      method: 'GET',
      credentials: 'include',
    });
    return await response.json();
  } catch (e) {
    console.log(e);
    return undefined;
  }
};
export const requestGithubLogin = async (proxy_url: string, data: any) => {
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
    });
    return await response.json();
  } catch (e) {
    console.log(e);
    return undefined;
  }
};
export const getSearchUsers = async (query: string) => {
  try {
    const response = await fetch(`${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/search_users?username=${query}`, {
      method: 'GET',
      credentials: 'include',
    });
    return (await response.json()) as SearchUser;
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
      `${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/search_topics?topic=${topic}&axiosCancel=${axiosCancel}`,
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
export const getElasticSearchBertAutocomplete = async (query: string) => {
  try {
    //TODO: instead of hitting the server all the time, use Redis https://www.linkedin.com/pulse/complete-guide-lighting-fast-autocomplete-search-suggestion-arya/ as buffer
    // so at startup, the server will send data to Kafka, then when the client online, we will tell Redis to fetch from Kafka storage.
    const response = await fetch(`${readEnvironmentVariable('PYTHON_BERT_AUTOCOMPLETE')}?q=${query}&docName=github`, {
      method: 'GET',
    });
    return await response.json();
  } catch (e) {
    console.log(e);
  }
};
export const getElasticSearchBert = async (query: string) => {
  try {
    //TODO: instead of hitting the server all the time, use Redis https://www.linkedin.com/pulse/complete-guide-lighting-fast-autocomplete-search-suggestion-arya/ as buffer
    // so at startup, the server will send data to Kafka, then when the client online, we will tell Redis to fetch from Kafka storage.
    const response = await fetch(`${readEnvironmentVariable('PYTHON_BERT')}?q=${query}&docName=github`, {
      method: 'GET',
    });
    return (await response.json()) as MergedDataProps[];
  } catch (e) {
    console.log(e);
  }
};
export const requestGithubGraphQLLogin = async (token: string) => {
  try {
    const response = await fetch(`${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/auth_graphql`, {
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
    });
    return (await response.json()) as { success: boolean };
  } catch (e) {
    console.log(e);
    return { success: false };
  }
};
export const convertToWebP = async (imgUrl: string) => {
  try {
    const response = await fetch(`${readEnvironmentVariable('UWEBSOCKET_ADDRESS')}/convert_to_webp?imgUrl=${imgUrl}`, {
      method: 'GET',
    });
    return (await response.json()) as { original: string };
  } catch (e) {
    console.log(e);
    return {
      original: '',
    };
  }
};
export const getFile = async (filename: string) => {
  try {
    const response = await fetch(`${readEnvironmentVariable('FS_ADDRESS')}/get_github_languages?filename=${filename}`, {
      method: 'GET',
      headers: { 'Accept-Encoding': 'gzip' },
    });
    return await response.json();
  } catch (e) {
    console.log(e);
    return undefined;
  }
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
  try {
    //actually query_topic is not used at Node.Js but since we want to save this query to Redis, each request
    //must contain a different URL to save each request
    const response = await fetch(
      `${readEnvironmentVariable(
        'UWEBSOCKET_ADDRESS'
      )}/images_from_markdown?query_topic=${topic}&page=${page}&axiosCancel=${axiosCancel}`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Content-Type': 'application/json',
        },
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
    return (await response.json()) as ImagesDataProps[];
  } catch (e) {
    console.log(e);
    return undefined;
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
