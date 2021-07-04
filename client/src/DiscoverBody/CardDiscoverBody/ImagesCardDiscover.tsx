import React, { useCallback, useEffect, useState } from 'react';
import './ImagesCardStyle.scss';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import { isEqualObjects } from '../../util';
import useCollapse from '../../hooks/useCollapse';
import { useLocation } from 'react-router-dom';
import { createRenderElement } from '../../Layout/MasonryLayout';
import { loadable } from '../../loadable';

const ImageComponentLayout = (condition: boolean, args: { renderImages: string[]; handleClick: any }) =>
  loadable({
    importFn: () =>
      import('../../Layout/ImageComponentLayout').then((module) =>
        args.renderImages.slice(0, 2).map((image: string) => {
          return createRenderElement(module.default, {
            handleClick: args.handleClick,
            key: image,
            urlLink: image,
          });
        })
      ),
    cacheId: 'ImageComponentLayout',
    condition: condition,
    empty: () => <></>,
  });
const ImageComponentLayout1 = (condition: boolean, args: { renderImages: string[]; handleClick: any }) =>
  loadable({
    importFn: () =>
      import('../../Layout/ImageComponentLayout').then((module) =>
        args.renderImages.slice(2).map((image: string) => {
          return createRenderElement(module.default, {
            handleClick: args.handleClick,
            key: image,
            urlLink: image,
          });
        })
      ),
    cacheId: 'ImageComponentLayout',
    condition: condition,
    empty: () => <></>,
  });
const ImagesModalLayout = (
  condition: boolean,
  args: {
    renderImages: string[];
    handleClick: (e: React.MouseEvent) => void;
    clicked: boolean;
  }
) =>
  loadable({
    importFn: () =>
      import('../../Layout/ImagesModalLayout').then((module) =>
        createRenderElement(module.default, {
          ...args,
        })
      ),
    condition,
    cacheId: 'ImagesModalLayout',
    empty: () => <></>,
  });

interface ImagesCardProps {
  index: number;
  imagesMapDataDiscover: Map<number, any>;
  setRenderImages: React.Dispatch<React.SetStateAction<string[]>>;
  renderImages: string[];
}

const ImagesCardDiscover: React.FC<ImagesCardProps> = ({
  index,
  imagesMapDataDiscover,
  renderImages,
  setRenderImages,
}) => {
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

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setClicked((prev) => !prev);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClickUnrenderImages = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setRenderChildren((prevState) => !prevState);
  }, []);

  return (
    <React.Fragment>
      <div style={{ textAlign: 'center' }}>
        {ImageComponentLayout(renderImages.length > 0, { renderImages, handleClick })}
      </div>
      <div {...getCollapseProps({ style: { textAlign: 'center' } })}>
        {ImageComponentLayout1(renderChildren && renderImages.length > 0, { renderImages, handleClick })}
      </div>
      <ListItem button {...getToggleProps({ onClick: handleClickUnrenderImages })}>
        <ListItemIcon>
          <SupervisorAccountIcon />
        </ListItemIcon>
        <ListItemText primary={`${renderChildren ? 'Hide' : 'Load'} ${renderImages.length} More Images`} />
        {renderChildren ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      {ImagesModalLayout(clicked, {
        clicked: clicked,
        renderImages: renderImages,
        handleClick: handleClick,
      })}
    </React.Fragment>
  );
};
ImagesCardDiscover.displayName = 'ImagesCardDiscover';
export default ImagesCardDiscover;
