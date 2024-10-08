import React, { useRef, forwardRef, HTMLAttributes } from 'react';
import PropTypes from 'prop-types';
import { useMergeRefs } from '../hooks/useMergeRefs';
import { ListboxContext } from '../hooks/useListboxContext';
import { useListbox, IListboxProps } from '../hooks/useListbox';

export interface IListboxPropsAttributes
  extends Omit<HTMLAttributes<HTMLUListElement>, 'onChange' | 'onSelect'>,
    IListboxProps {}

// Maybe remove this when https://github.com/storybookjs/storybook/pull/10180 is merged.
/**
An [uncontrolled](https://gist.github.com/ryanflorence/e2fa045ad523f2228d34ce3f94df75b3) component is driven by _state_, while a
controlled component is driven by _props_. This listbox component's behavior is driven by internal state, and demonstrates uncontrolled
single-select behavior. The component accepts a `multiSelect` prop which toggles on multi-select behavior.
**/
export const Listbox = forwardRef<HTMLUListElement, IListboxPropsAttributes>((props, ref) => {
  const { onChange, onSelect, multiSelect, focusedIndex, selectedIndex, defaultSelectedIndex, children, ...restProps } =
    props;

  const listboxRef = useMergeRefs<HTMLUListElement>(ref);
  const valuesRef = useRef<string[]>([]);
  const currentIndexRef = useRef(0);

  const { options, optionsRef, getOptionProps, getListboxProps } = useListbox({
    onChange,
    onSelect,
    listboxRef,
    multiSelect,
    focusedIndex,
    selectedIndex,
    defaultSelectedIndex,
  });

  const value = {
    options,
    valuesRef,
    optionsRef,
    getOptionProps,
    currentIndexRef,
  };

  return (
    <ListboxContext.Provider value={value}>
      <ul {...getListboxProps({ ref: listboxRef, ...restProps })}>{children}</ul>
    </ListboxContext.Provider>
  );
});

Listbox.defaultProps = {
  multiSelect: false,
};

Listbox.propTypes = {
  /** A function that is called with the focused option when focused state changes. */
  onChange: PropTypes.func,
  /** A function that is called with the selected option when selected state changes. */
  onSelect: PropTypes.func,
  /** Turns on multi-select listbox behavior. Only useful for [uncontrolled](https://gist.github.com/ryanflorence/e2fa045ad523f2228d34ce3f94df75b3) listbox usages.*/
  multiSelect: PropTypes.bool,
  /** Sets the focused index. Only useful for [controlled](https://gist.github.com/ryanflorence/e2fa045ad523f2228d34ce3f94df75b3) listbox usages.*/
  focusedIndex: PropTypes.number,
  /** An index or array of indices of the selected value(s). Only useful for [controlled](https://gist.github.com/ryanflorence/e2fa045ad523f2228d34ce3f94df75b3) listbox usages.*/
  selectedIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.array]),
  /** Sets the default selected index. Only useful for [uncontrolled](https://gist.github.com/ryanflorence/e2fa045ad523f2228d34ce3f94df75b3) listbox usages.*/
  defaultSelectedIndex: PropTypes.number,
};

Listbox.displayName = 'Listbox';
