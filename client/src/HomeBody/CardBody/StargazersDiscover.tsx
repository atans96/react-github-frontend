import React, { useCallback } from 'react';
import { MergedDataProps } from '../../typing/type';
import { isEqualObjects } from '../../util';
import StargazersCardDiscover from './StargazersCardDiscover';

interface StargazersDiscoverProps {
  data: MergedDataProps;
  githubDataId: number;
}

const StargazersDiscover = React.memo<StargazersDiscoverProps>(
  ({ githubDataId, data }) => {
    const stargazerCountMemoized = useCallback(() => {
      return data.stargazers_count;
    }, [data.stargazers_count]);
    return <StargazersCardDiscover stargazerCount={stargazerCountMemoized()} githubDataId={githubDataId} />;
  },
  (prevProps: any, nextProps: any) => {
    return isEqualObjects(prevProps.data, nextProps.data);
  }
);
StargazersDiscover.displayName = 'StargazersDiscover';
export default StargazersDiscover;
