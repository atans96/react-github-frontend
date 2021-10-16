import React, { useEffect, useRef, useState } from 'react';
interface KeepMountedLayoutProps {
  mountedCondition: boolean;
  render: () => React.ReactNode;
}
const KeepMountedLayout: React.FC<KeepMountedLayoutProps> = ({ render, mountedCondition }) => {
  const hasBeenMounted = useRef<boolean>(mountedCondition);
  const [mount, setMount] = useState(mountedCondition);
  const interval = useRef<any>();

  useEffect(() => {
    //delay the unmounted after the user navigate away from page
    clearInterval(interval.current);
    interval.current = setInterval(() => {
      setMount(hasBeenMounted.current);
    }, 15000);
  }, [hasBeenMounted.current]);

  useEffect(() => {
    hasBeenMounted.current = mountedCondition;
    if (mountedCondition && !mount) setMount(true);
  }, [mountedCondition]);

  return mountedCondition ? (
    <div style={{ contentVisibility: mountedCondition ? 'visible' : 'hidden' }}>{mount ? render() : null}</div>
  ) : (
    <></>
  );
};
export default KeepMountedLayout;
