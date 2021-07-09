import { useRef, useState } from 'react';

export function useForceUpdate() {
  const setState = useState(emptyObj)[1];
  return useRef(() => setState({})).current;
}

const emptyObj = {};
