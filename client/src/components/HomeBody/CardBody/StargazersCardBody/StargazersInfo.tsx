import React, { useEffect, useRef, useState } from 'react';
import Result from './StargazersInfoBody/Result';
import FilterResultSettings from './StargazersInfoBody/FilterResultSettings';
import { CloseIcon } from '../../../../util/icons';
import { SEARCH_FOR_MORE_REPOS, SEARCH_FOR_REPOS } from '../../../../graphql/queries';
import { Then } from '../../../../util/react-if/Then';
import { If } from '../../../../util/react-if/If';
import './StargazersInfoStyle.scss';

import { StargazerProps } from '../../../../typing/type';
import { useClickOutside } from '../../../../hooks/hooks';
import { dragMove } from '../../../../util';
import { useLocation } from 'react-router-dom';
import { useTrackedStateShared, useTrackedStateStargazers } from '../../../../selectors/stateContextSelector';
import { map } from 'async';
import { useApolloClient } from '@apollo/client';
import LanguageButtons from './LanguageButtons';

export interface StargazersInfo {
  getRootPropsCard: any;
  getRootProps: any;
  GQL_VARIABLES: any;
  isLoading: boolean;
  stargazers_count: number;
  modalWidth: string;
  setVisible: any;
}

const StargazersInfo = ({
  getRootPropsCard,
  getRootProps,
  GQL_VARIABLES,
  isLoading,
  stargazers_count,
  setVisible,
  modalWidth,
}: StargazersInfo) => {
  const [isLoadingFetchMore, setIsLoadingFetchMore] = useState(false);
  const stargazerModalRef = useRef<HTMLDivElement>(null);
  const [stateStargazers, dispatchStargazers] = useTrackedStateStargazers();
  const [stateShared] = useTrackedStateShared();
  const client = useApolloClient();

  const handleClickFilterResult = () => {
    setIsLoadingFetchMore(true);
    dispatchStargazers({
      type: 'REMOVE_ALL',
    });
  };

  const handleClickLoadMore = (event: React.MouseEvent<HTMLElement>) => {
    if (!isLoadingFetchMore) {
      event.preventDefault();
      event.stopPropagation();
      setIsLoadingFetchMore(true);
      if (stateShared.tokenGQL !== '') {
        client // return Promise
          .query({
            query: stateStargazers.hasNextPage.hasNextPage ? SEARCH_FOR_MORE_REPOS : SEARCH_FOR_REPOS,
            variables: stateStargazers.hasNextPage.hasNextPage
              ? { ...GQL_VARIABLES.GQL_pagination_variables }
              : { ...GQL_VARIABLES.GQL_variables },
            context: { clientName: 'github' },
          })
          .then((result) => {
            dispatchStargazers({
              type: 'STARGAZERS_HAS_NEXT_PAGE',
              payload: {
                hasNextPage: result.data.repository.stargazers.pageInfo || {},
              },
            });
            map(result.data.repository.stargazers.nodes, (node: any) => {
              const newNode = { ...node };
              newNode['isQueue'] = false;
              dispatchStargazers({
                type: 'STARGAZERS_ADDED',
                payload: {
                  stargazersData: newNode,
                },
              });
            });
          })
          .catch((e) => {
            throw new Error(e);
          })
          .finally(() => {
            setIsLoadingFetchMore(false);
          });
      }
    }
  };
  //don't close modal if the click is multivalue-cross from PureInputBody\MultiValueSearch.tsx or when you open drawerbar (hamburger)
  useClickOutside(stargazerModalRef, () => setVisible(false), ['multivalue-cross', 'hamburger', 'hamburger-parent']);
  const dragRef = useRef<HTMLDivElement>(null);
  const appendAlready = useRef<boolean>(false); //prevent re-execute dragMove

  const location = useLocation();

  useEffect(() => {
    if (dragRef.current && stargazerModalRef.current && !appendAlready.current && location.pathname === '/') {
      appendAlready.current = true;
      dragMove(stargazerModalRef.current.querySelectorAll('.SelectMenu-modal:not(.NonDrag)')[0], dragRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragRef.current]);
  return (
    <div className="SelectMenu" ref={stargazerModalRef}>
      <div className="SelectMenu-modal" style={{ width: modalWidth }}>
        <header className="SelectMenu-header" style={{ cursor: 'move' }} ref={dragRef}>
          <h3 className="SelectMenu-title">Stargazers Information</h3>
          <button className="SelectMenu-closeButton" type="button" onClick={() => setVisible(false)}>
            <CloseIcon />
          </button>
        </header>

        <div className="NonDrag">
          <FilterResultSettings
            props={getRootProps({
              onClick: handleClickFilterResult,
              params: { query: SEARCH_FOR_REPOS, variables: { ...GQL_VARIABLES.GQL_variables } },
              firstCallback: () => {
                setIsLoadingFetchMore(false);
              },
            })}
          />
        </div>
        <div className="SelectMenu-list">
          <table>
            <thead>
              <tr>
                <th style={{ width: '10%' }} className="sticky-column-table" />
                <th style={{ width: '100%' }} className="sticky-column-table" />
                <LanguageButtons />
              </tr>
            </thead>
            <If condition={!isLoading || !isLoadingFetchMore}>
              <Then>
                {stateStargazers.stargazersData.map((stargazer: StargazerProps, idx: number) => (
                  <Result
                    key={idx}
                    getRootPropsCard={getRootPropsCard}
                    stargazer={stargazer}
                    stateStargazers={stateStargazers}
                  />
                )) || <></>}
              </Then>
            </If>
          </table>
          <If condition={isLoadingFetchMore || isLoading}>
            <Then>
              <div className="SelectMenu-list" style={{ display: 'flex', padding: '5px' }}>
                <div className="loading-spinner" />
                <span>
                  Please wait<span className="one">.</span>
                  <span className="two">.</span>
                  <span className="three">.</span>
                </span>
              </div>
            </Then>
          </If>
        </div>

        {/* REMOVE THIS Since it will re-render the whole table, making scroll bar to reset, instead of stay at the current position */}
        {/* <If condition={isLoadingFetchMore}> */}
        {/*  <Then> */}
        {/*    <div className="SelectMenu-list"> */}
        {/*      <table className="table-layout"> */}
        {/*        <thead style={{ border: 'solid' }}> */}
        {/*        <th></th> */}
        {/*        <th style={{ width: '1%' }}> */}
        {/*          <span style={{ borderLeft: 'solid' }}>JavaScript</span> */}
        {/*        </th> */}
        {/*        </thead> */}
        {/*        <React.Fragment> */}
        {/*          {stateStargazers.stateStargazers.stargazersData.length > 0 && */}
        {/*          stateStargazers.stateStargazers.stargazersData.map((stargazer, idx) => { */}
        {/*            return <Result key={idx} stargazer={stargazer} getRootPropsCard={getRootPropsCard} />; */}
        {/*          })} */}
        {/*        </React.Fragment> */}
        {/*      </table> */}
        {/*      <div className="SelectMenu-list" style={{ display: 'flex', padding: '5px' }}> */}
        {/*        <div className="loading-spinner" /> */}
        {/*        <span> */}
        {/*          Please wait<span className="one">.</span> */}
        {/*          <span className="two">.</span> */}
        {/*          <span className="three">.</span> */}
        {/*        </span> */}
        {/*      </div> */}
        {/*    </div> */}
        {/*  </Then> */}
        {/* </If> */}

        <footer
          className="SelectMenu-footer"
          onClick={handleClickLoadMore}
          style={{ cursor: isLoadingFetchMore ? '' : 'pointer' }}
        >
          Load{' '}
          {stateStargazers.hasNextPage.hasNextPage
            ? `${
                stargazers_count - stateStargazers.stargazersUsers < stateStargazers.stargazersUsers
                  ? stargazers_count - stateStargazers.stargazersUsers
                  : stateStargazers.stargazersUsers
              }`
            : 0}{' '}
          More Users
        </footer>
        <footer className="SelectMenu-footer">
          Showing {stateStargazers.stargazersData.length} of {stargazers_count} Users
        </footer>
      </div>
    </div>
  );
};
export default StargazersInfo;
