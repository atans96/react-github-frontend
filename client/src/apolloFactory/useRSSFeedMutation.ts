import { GET_RSS_FEED } from '../graphql/queries';
import { GraphQLRSSFeedData } from '../typing/interface';
import { useApolloClient } from '@apollo/client';

export const useRSSFeedMutation = () => {
  const client = useApolloClient();
  return async function (data: GraphQLRSSFeedData) {
    const oldData: GraphQLRSSFeedData | null = (await client.cache.readQuery({ query: GET_RSS_FEED })) || null;
    if (
      oldData &&
      oldData.getRSSFeed.rss &&
      oldData.getRSSFeed.rss.length > 0 &&
      oldData.getRSSFeed.lastSeen &&
      oldData.getRSSFeed.lastSeen.length > 0
    ) {
      await client.cache.writeQuery({
        query: GET_RSS_FEED,
        data: {
          getRSSFeed: {
            rss: [...data.getRSSFeed.rss, ...oldData?.getRSSFeed?.rss],
            lastSeen: [...data.getRSSFeed.lastSeen, ...oldData?.getRSSFeed?.lastSeen],
          },
        },
      });
    } else {
      await client.cache.writeQuery({
        query: GET_RSS_FEED,
        data: {
          getRSSFeed: {
            rss: data.getRSSFeed.rss,
            lastSeen: data.getRSSFeed.lastSeen,
          },
        },
      });
    }
    return (await client.cache.readQuery({ query: GET_RSS_FEED })) as GraphQLRSSFeedData;
  };
};
