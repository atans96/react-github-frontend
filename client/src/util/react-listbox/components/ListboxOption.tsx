import React, { useRef, useState, useEffect, forwardRef, HTMLAttributes, MutableRefObject } from 'react';
import PropTypes from 'prop-types';
import { useId } from '@reach/auto-id';
import { useListboxContext } from '../hooks/useListboxContext';
import { useMergeRefs } from '../hooks/useMergeRefs';
import { useSelectContext } from './index';

export interface IListboxOptionProps extends HTMLAttributes<HTMLLIElement> {
  value: string;
}

export interface IUseOptionIndexArgs {
  value: string;
  valuesRef: MutableRefObject<string[]>;
}

// Force additional render when index is found.
const useOptionIndex = ({ value, valuesRef }: IUseOptionIndexArgs) => {
  const [index, forceUpdate] = useState(-1);

  useEffect(() => {
    valuesRef.current.push(value);

    for (let i = valuesRef.current.length - 1; i >= 0; i--) {
      const currentValue = valuesRef.current[i];

      if (currentValue === value) {
        forceUpdate(i);
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return index;
};

export const ListboxOption = forwardRef<HTMLLIElement, IListboxOptionProps>((props, ref) => {
  const { value } = props;
  const isFinished = useRef(false);
  const id = `option--${value}--${useId()}`;
  const { options, optionsRef, valuesRef, getOptionProps } = useListboxContext();
  const index = useOptionIndex({ value, valuesRef });
  const optionRef = useRef<HTMLLIElement>(null);
  const mergedRef = useMergeRefs(ref, optionRef);
  const { dispatch } = useSelectContext();

  useEffect(() => {
    return () => {
      isFinished.current = true;
    };
  }, []);
  useEffect(() => {
    if (!isFinished.current) {
      dispatch({ type: 'increment_size' });
    }
  }, []);
  if (index === -1) {
    return <li>{props.children}</li>;
  }

  options.current[index] = { id, value, index };
  optionsRef.current[index] = optionRef;

  return <li {...getOptionProps({ ref: mergedRef, id, index, ...props })} />;
});

ListboxOption.propTypes = {
  /** A discrete value for the option. */
  value: PropTypes.string.isRequired,
};

ListboxOption.displayName = 'ListboxOption';
