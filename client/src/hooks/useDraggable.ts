import _ from 'lodash';
import $ from 'cash-dom';
import { useState } from 'react';

export const useDraggable = (drawerRef: any, drawerWidthClient = 200, direction = 'e') => {
  const [drawerWidth, setDrawerWidth] = useState(drawerWidthClient);
  const handleDrag = (e: any, ui: any) => {
    const factor = direction === 'e' || direction === 's' ? -1 : 1;

    // modify the size based on the drag delta
    const delta = direction === 'e' || direction === 'w' ? ui.deltaX : ui.deltaY;
    setDrawerWidth(Math.max(drawerWidthClient, drawerWidth - delta * factor));
  };

  const handleDragEnd = () => {
    validateSize();
  };
  const dragHandlers = {
    onDrag: handleDrag,
    onStop: _.debounce(handleDragEnd, 100),
  };
  const validateSize = () => {
    // Or if our size doesn't equal the actual content size, then we
    // must have pushed past the min size of the content, so resize back
    //let minSize = isHorizontal ? $(actualContent).outerWidth(true) : $(actualContent).outerHeight(true);
    if (drawerRef!.current) {
      let minSize =
        direction === 'e' || direction === 'w' ? drawerRef!.current.scrollWidth : drawerRef!.current.scrollHeight;

      const margins =
        direction === 'e' || direction === 'w'
          ? $(drawerRef!.current).outerWidth(true) - $(drawerRef!.current).outerWidth()
          : $(drawerRef!.current).outerHeight(true) - $(drawerRef!.current).outerHeight();
      minSize += margins;

      if (drawerWidth !== minSize) {
        setDrawerWidth(minSize);
      }
    }
  };
  return { dragHandlers, drawerWidth };
};
