import React, { useEffect, useState } from 'react';
import './ImagesCardStyle.scss';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import useCollapse from '../../hooks/useCollapse';
import { useLocation } from 'react-router-dom';
import Loadable from 'react-loadable';
import { LoadingBig } from '../../LoadingBig';
import { useStableCallback } from '../../util';
import { useDeepMemo } from '../../hooks/useDeepMemo';
import { RepoInfoProps } from '../../typing/type';

const ImageComponentLayout = Loadable({
  loading: LoadingBig,
  delay: 300,
  loader: () => import(/* webpackChunkName: "ImageComponentLayoutDiscover" */ '../../Layout/ImageComponentLayout'),
});

const ImagesModalLayout = Loadable({
  loading: LoadingBig,
  delay: 300,
  loader: () => import(/* webpackChunkName: "ImagesModalLayoutDiscover" */ '../../Layout/ImagesModalLayout'),
});

interface ImagesCardProps {
  index: number;
  imagesMapDataDiscover: Map<number, any>;
}

const ImagesCardDiscover: React.FC<ImagesCardProps> = React.memo(
  ({ index, imagesMapDataDiscover }) => {
    const [renderChildren, setRenderChildren] = useState(false);
    const [clicked, setClicked] = useState(false);

    const { getToggleProps, getCollapseProps } = useCollapse({
      defaultExpanded: false, // is the images already expanded in the first place?
    });

    const location = useLocation();

    useEffect(() => {
      let isCancelled = false;
      if (location.pathname === '/discover' && !isCancelled && imagesMapDataDiscover.size > 0) {
        const temp = imagesMapDataDiscover.get(index)?.value ?? [];
        setRenderImages(temp);
        return () => {
          isCancelled = true;
        };
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imagesMapDataDiscover]);

    const handleClick = useStableCallback((e: React.MouseEvent) => {
      e.preventDefault();
      return setClicked((prev) => !prev);
    });

    const handleClickUnrenderImages = useStableCallback((e: React.MouseEvent) => {
      e.preventDefault();
      return setRenderChildren((prevState) => !prevState);
    });
    const [renderImages, setRenderImages] = useState<string[]>([]);

    useEffect(() => {
      let isCancelled = false;
      if (location.pathname === '/discover' && !isCancelled && imagesMapDataDiscover.size > 0) {
        const temp = imagesMapDataDiscover.get(index)?.value ?? [];
        setRenderImages(temp);
        return () => {
          isCancelled = true;
        };
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imagesMapDataDiscover]);
    return (
      <React.Fragment>
        <div style={{ textAlign: 'center' }}>
          {renderImages.length > 0 &&
            useDeepMemo(() => {
              return renderImages
                .slice(0, 2)
                .map((image: string, idx) => (
                  <ImageComponentLayout key={idx} urlLink={image} handleClick={handleClick} />
                ));
            }, [renderImages])}
        </div>
        <div {...getCollapseProps({ style: { textAlign: 'center' } })}>
          {renderChildren &&
            renderImages.length > 0 &&
            useDeepMemo(() => {
              return renderImages
                .slice(2)
                .map((image: string, idx) => (
                  <ImageComponentLayout key={idx} urlLink={image} handleClick={handleClick} />
                ));
            }, [renderImages])}
        </div>
        <ListItem button {...getToggleProps({ onClick: handleClickUnrenderImages })}>
          <ListItemIcon>
            <SupervisorAccountIcon />
          </ListItemIcon>
          <ListItemText primary={`${renderChildren ? 'Hide' : 'Load'} ${renderImages.length} More Images`} />
          {renderChildren ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        {clicked && <ImagesModalLayout clicked={clicked} handleClick={handleClick} renderImages={renderImages} />}
      </React.Fragment>
    );
  },
  (prevProps: any, nextProps: any) => {
    return prevProps.imagesMapDataDiscover.size === nextProps.imagesMapDataDiscover.size;
  }
);
ImagesCardDiscover.displayName = 'ImagesCardDiscover';
export default ImagesCardDiscover;
