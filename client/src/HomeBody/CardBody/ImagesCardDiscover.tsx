import React, { useCallback, useEffect, useRef, useState } from 'react';
import './ImagesCardStyle.scss';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import { Loading } from '../../util';
import useCollapse from '../../hooks/useCollapse';
import { Then } from '../../util/react-if/Then';
import { If } from '../../util/react-if/If';
import ImagesModalLayout from '../../Layout/ImagesModalLayout';
import { ImageComponentLayout } from '../../Layout/ImageComponentLayout';
import { useLocation } from 'react-router-dom';

interface ImagesCardProps {
  index: number;
  visible: boolean;
  imagesMapDataDiscover: Map<number, any>;
}

const ImagesCardDiscover: React.FC<ImagesCardProps> = ({ index, visible, imagesMapDataDiscover }) => {
  const [renderChildren, setRenderChildren] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [renderImages, setRenderImages] = useState<string[]>([]);

  const { getToggleProps, getCollapseProps } = useCollapse({
    defaultExpanded: false, // is the images already expanded in the first place?
  });

  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/discover') {
      let isCancelled = false;
      if (!isCancelled && imagesMapDataDiscover.size > 0) {
        const temp = imagesMapDataDiscover.get(index)?.value ?? [];
        setRenderImages(temp);
      }
      return () => {
        isCancelled = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagesMapDataDiscover, location.pathname]);

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
      <If condition={imagesMapDataDiscover.size === 0 && renderImages.length === 0}>
        <Then>
          <div style={{ textAlign: 'center' }}>
            <Loading />
          </div>
        </Then>
      </If>
      <If condition={imagesMapDataDiscover.size > 0}>
        <Then>
          <div style={{ textAlign: 'center' }}>
            {renderImages.length > 0 &&
              renderImages.slice(0, 2).map((image: string, idx: number) => {
                return <ImageComponentLayout handleClick={handleClick} visible={visible} key={idx} urlLink={image} />;
              })}
          </div>
          <div {...getCollapseProps({ style: { textAlign: 'center' } })}>
            {renderChildren &&
              renderImages.length > 0 &&
              renderImages.slice(2).map((image: string, idx: number) => {
                return <ImageComponentLayout handleClick={handleClick} visible={visible} key={idx} urlLink={image} />;
              })}
          </div>
          <ListItem button {...getToggleProps({ onClick: handleClickUnrenderImages })}>
            <ListItemIcon>
              <SupervisorAccountIcon />
            </ListItemIcon>
            <ListItemText primary={`${renderChildren ? 'Hide' : 'Load'} ${renderImages.length} More Images`} />
            {renderChildren ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
        </Then>
      </If>
      <ImagesModalLayout clicked={clicked} renderImages={renderImages} handleClick={handleClick} />
    </React.Fragment>
  );
};
ImagesCardDiscover.displayName = 'ImagesCardDiscover';
export default ImagesCardDiscover;
