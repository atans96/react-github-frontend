import React from 'react';
import { FeedPostSkeletonProps, useFeedPostSkeletonStyles } from './CardSkeletonStyle';

interface CardSkeleton {
  props?: any;
}
const CardSkeleton: React.FC<CardSkeleton> = React.forwardRef(() => {
  const styleProps: FeedPostSkeletonProps = {} as any;
  const classes = useFeedPostSkeletonStyles(styleProps);

  return (
    <div className={classes.container}>
      <div className={classes.headerSkeleton}>
        <div className={classes.avatarSkeleton} />
        <div className={classes.headerTextSkeleton}>
          <div className={classes.primaryTextSkeleton} />
          <div className={classes.secondaryTextSkeleton} />
        </div>
      </div>
      <div className={classes.mediaSkeleton} />
    </div>
  );
});
CardSkeleton.displayName = 'CardSkeleton';
export default CardSkeleton;
