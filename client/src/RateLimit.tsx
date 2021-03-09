import React, { useEffect, useState } from 'react';
import RateLimitInfo from './RateLimitInfoBody/RateLimitInfo';
import { getRateLimitInfo } from './services';
import { dispatchRateLimit, dispatchRateLimitAnimation } from './store/dispatcher';
import { IState } from './typing/interface';
import { useApolloFactory } from './hooks/useApolloFactory';

interface RateLimitProps {
  state: IState;
  dispatch: any;
}

const RateLimit: React.FC<{ componentProps: RateLimitProps }> = (props) => {
  const [refetch, setRefetch] = useState(true);
  const { userData, userDataLoading, userDataError } = useApolloFactory().query.getUserData;
  useEffect(
    () => {
      // the first time Home component is mounting fetch it, otherwise it will use the data from store and
      // persist when switching the component
      dispatchRateLimitAnimation(false, props.componentProps.dispatch);
      getRateLimitInfo(
        !userDataLoading && !userDataError && userData && userData.getUserData ? userData.getUserData.token : ''
      ).then((data) => {
        if (data.rateLimit && data.rateLimitGQL) {
          dispatchRateLimitAnimation(true, props.componentProps.dispatch);
          dispatchRateLimit(data.rateLimit, data.rateLimitGQL, props.componentProps.dispatch);
        }
        setRefetch(false); // turn back to default after setting to true from RateLimitInfo
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      refetch,
      props.componentProps.state.mergedData.length,
      props.componentProps.state.searchUsers.length,
      userDataError,
      userDataLoading,
      userData,
    ]
  );
  return (
    <RateLimitInfo
      data={props.componentProps.state.rateLimit}
      setRefetch={setRefetch}
      rateLimitAnimationAdded={props.componentProps.state.rateLimitAnimationAdded}
    />
  );
};
export default RateLimit;
