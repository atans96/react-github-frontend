import Loadable from 'react-loadable';
import Empty from './components/Layout/EmptyLayout';

export const HomeLoadable = Loadable({
  loading: Empty,
  delay: 300, // 0.3 seconds
  loader: () => import(/* webpackChunkName: "Home" */ './components/Home'),
});
export const LoginLoadable = Loadable({
  loading: Empty,
  delay: 300, // 0.3 seconds
  loader: () => import(/* webpackChunkName: "Login" */ './components/Login'),
});
export const DiscoverLoadable = Loadable({
  loading: Empty,
  delay: 300, // 0.3 seconds
  loader: () => import(/* webpackChunkName: "Discover" */ './components/Discover'),
});
export const DetailsLoadable = Loadable({
  loading: Empty,
  delay: 300, // 0.3 seconds
  loader: () => import(/* webpackChunkName: "Details" */ './components/Details'),
});
export const ManageProfileLoadable = Loadable({
  loading: Empty,
  delay: 300, // 0.3 seconds
  loader: () => import(/* webpackChunkName: "ManageProfile" */ './components/ManageProfile'),
});

export const NotFoundLoadable = Loadable({
  loading: Empty,
  delay: 300, // 0.3 seconds
  loader: () => import(/* webpackChunkName: "NotFound" */ './components/NotFound'),
});
export const SearchBarLoadable = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "SearchBar" */ './components/SearchBar'),
});
