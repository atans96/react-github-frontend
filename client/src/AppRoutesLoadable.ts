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
export const LoadingEye = Loadable({
  loading: Empty,
  loader: () => import(/* webpackChunkName: "LoadingEye" */ './components/LoadingEye'),
  delay: 300, // 0.3 seconds
});
export const LoginGQL = Loadable({
  loading: Empty,
  loader: () => import(/* webpackChunkName: "LoginGQL" */ './components/HomeBody/CardBody/StargazersCardBody/LoginGQL'),
  delay: 300, // 0.3 seconds
});
export const BottomNavigationBar = Loadable({
  loading: Empty,
  loader: () => import(/* webpackChunkName: "BottomNavigationBar" */ './components/HomeBody/BottomNavigationBar'),
  delay: 300, // 0.3 seconds
});
export const ScrollToTopLayout = Loadable({
  loading: Empty,
  loader: () => import(/* webpackChunkName: "ScrollToTopLayout" */ './components/Layout/ScrollToTopLayout'),
  delay: 300, // 0.3 seconds
});
