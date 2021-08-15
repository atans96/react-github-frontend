import React from 'react';
import './index.scss';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { StateProvider, StateSharedProvider } from './selectors/stateContextSelector';
import ComposeProviders from './components/Layout/ComposeProviders';
import DbCtx from './db/db.ctx';
import CustomApolloProvider from './ApolloProvider';
import AppRoutes from './AppRoutes';
// const ManageProfile = React.lazy(() => import('./ManageProfile'));
const rootEl = document.getElementById('root'); // from index.html <div id="root"></div>
const Main = () => {
  //make sure that SuggestedRepoImagesContainer.Provider is below CustomApolloProvider since it's using ApolloContext.Provider in order to use useQuery hook
  return (
    <Router>
      <StateProvider>
        <StateSharedProvider>
          <CustomApolloProvider>
            <ComposeProviders components={[DbCtx.Provider]}>
              <AppRoutes />
            </ComposeProviders>
          </CustomApolloProvider>
        </StateSharedProvider>
      </StateProvider>
    </Router>
  );
};
window.addEventListener('unhandledrejection', function (promiseRejectionEvent) {
  console.log(promiseRejectionEvent);
});
window.onunhandledrejection = function (event: PromiseRejectionEvent) {
  console.log(event.reason);
};
ReactDOM.render(<Main />, rootEl);
