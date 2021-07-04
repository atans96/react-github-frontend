import React, { useCallback, useState } from 'react';
import '../../DiscoverBody/CardDiscoverBody/ImagesCardStyle.scss';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import useCollapse from '../../hooks/useCollapse';
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

interface ImagesCard {
  renderImages: string[];
}
const ImagesCard: React.FC<ImagesCard> = ({ renderImages }) => {
  const [renderChildren, setRenderChildren] = useState(false);
  const [clicked, setClicked] = useState(false);
  const { getToggleProps, getCollapseProps } = useCollapse({
    defaultExpanded: false, // is the images already expanded in the first place?
  });

  const handleClickUnrenderImages = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setRenderChildren((prevState) => !prevState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // useRef() is basically useState({current: initialValue })[0] so no need to re-render the component

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setClicked((prev) => !prev);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
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
    </>
  );
};
ImagesCard.displayName = 'ImagesCard';
export default ImagesCard;
