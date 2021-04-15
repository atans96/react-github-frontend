import { useReducer } from 'react';
import { initialStateShared, reducerShared } from '../store/Shared/reducer';
import { initialState, reducer } from '../store/Home/reducer';
import { initialStateStargazers, reducerStargazers } from '../store/Staargazers/reducer';
import { initialStateDiscover, reducerDiscover } from '../store/Discover/reducer';
import { initialStateManageProfile, reducerManageProfile } from '../store/ManageProfile/reducer';
import { initialStateRateLimit, reducerRateLimit } from '../store/RateLimit/reducer';
import { createContainer } from 'react-tracked';

export const { Provider: StateSharedProvider, useTracked: useTrackedStateShared } = createContainer(() =>
  useReducer(reducerShared, initialStateShared)
);
export const { Provider: StateProvider, useTracked: useTrackedState } = createContainer(() =>
  useReducer(reducer, initialState)
);
export const { Provider: StateStargazersProvider, useTracked: useTrackedStateStargazers } = createContainer(() =>
  useReducer(reducerStargazers, initialStateStargazers)
);
export const { Provider: StateDiscoverProvider, useTracked: useTrackedStateDiscover } = createContainer(() =>
  useReducer(reducerDiscover, initialStateDiscover)
);
export const { Provider: StateManageProfileProvider, useTracked: useTrackedStateManageProfile } = createContainer(() =>
  useReducer(reducerManageProfile, initialStateManageProfile)
);
export const { Provider: StateRateLimitProvider, useTracked: useTrackedStateRateLimit } = createContainer(() =>
  useReducer(reducerRateLimit, initialStateRateLimit)
);
