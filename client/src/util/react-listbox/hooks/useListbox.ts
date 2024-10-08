import {
  useRef,
  useState,
  useEffect,
  useReducer,
  Dispatch,
  RefObject,
  FocusEvent,
  KeyboardEvent,
  MutableRefObject,
  HTMLProps,
} from 'react';
import { useFindItemToFocus } from './useFindItemToFocus';
import { KEY_CODES, composeEventHandlers, focusElement } from '../utils';
import { SelectActionTypes } from '../components';

export const FOCUS_OPTION = 'focus option';
export const SELECT_OPTION = 'select option';
export const MULTI_SELECT_OPTION = 'multi select option';

export interface IOption {
  id: string;
  index: number;
  value: string;
}

export interface IFocusOption {
  type: typeof FOCUS_OPTION;
  payload: IOption;
}

export interface ISelectOption {
  type: typeof SELECT_OPTION;
  payload: IOption;
}

export interface IMultiSelectOption {
  type: typeof MULTI_SELECT_OPTION;
  payload: IOption;
}

export type ListboxActionTypes = IFocusOption | ISelectOption | IMultiSelectOption;

export type SelectedValues = { [key: string]: IOption };

export interface IControlledListboxState {
  focusedIndex?: number;
  selectedIndex?: number | number[];
}

export interface IListboxState {
  focusedId: string;
  focusedIndex: number;
  focusedValue: string;
  selectedId: string;
  selectedIndex: number;
  selectedValue: string;
  selectedValues: SelectedValues;
}

export type ReducerType = (state: IListboxState, action: ListboxActionTypes) => IListboxState;

export interface IGetOptionProps extends HTMLProps<HTMLLIElement> {
  index?: number;
  value: string;
}

export interface IGetListboxProps extends HTMLProps<HTMLUListElement> {}

export interface IUseListboxReturnValue {
  getOptionProps: (props: IGetOptionProps) => HTMLProps<HTMLLIElement>;
  getListboxProps: (props: IGetListboxProps) => HTMLProps<HTMLUListElement>;
  options: MutableRefObject<IOption[]>;
  optionsRef: MutableRefObject<RefObject<HTMLLIElement>[]>;
}

export interface IDefaultProps {
  defaultSelectedIndex?: number;
}

export interface IListboxProps {
  onChange?: (option: IOption) => void;
  onSelect?: (value: IOption | SelectedValues, exclude: boolean) => void;
  multiSelect?: boolean;
  focusedIndex?: number;
  defaultSelectedIndex?: number;
  selectedIndex?: number | number[];
}

export interface IUseListboxProps extends IListboxProps {
  listboxRef: RefObject<HTMLUListElement>;
}

export interface IControlledHandlerArgs extends IListboxProps {
  state: IControlledListboxState;
  options: MutableRefObject<IOption[]>;
  listboxRef: RefObject<HTMLUListElement>;
  optionsRef: MutableRefObject<MutableRefObject<HTMLLIElement>[]>;
  dispatch: Dispatch<SelectActionTypes>;
}

export interface IHandlerArg extends IListboxProps {
  state: IListboxState;
  dispatch: Dispatch<ListboxActionTypes>;
  options: MutableRefObject<IOption[]>;
  optionsRef: MutableRefObject<MutableRefObject<HTMLLIElement>[]>;
  listboxRef: RefObject<HTMLUListElement>;
}

export type UseListboxType = (props: IUseListboxProps) => IUseListboxReturnValue;

const reducer: ReducerType = (state, action) => {
  const { id, index, value } = action.payload;

  switch (action.type) {
    case FOCUS_OPTION:
      return {
        ...state,
        focusedId: id,
        focusedIndex: index,
        focusedValue: value,
      };
    case SELECT_OPTION:
      return {
        ...state,
        selectedId: id,
        selectedIndex: index,
        selectedValue: value,
      };
    case MULTI_SELECT_OPTION:
      const { selectedValues } = state;
      const option = { id, index, value };
      let nextSelectedValues = {
        ...selectedValues,
        [value]: option,
      };

      if (selectedValues[value]) {
        const { [value]: _, ...restSelectedValues } = nextSelectedValues;
        nextSelectedValues = restSelectedValues;
      }

      return {
        ...state,
        selectedId: id,
        selectedIndex: index,
        selectedValues: nextSelectedValues,
      };
  }
};

const initialState = {
  focusedId: '',
  focusedIndex: -1,
  focusedValue: '',
  selectedId: '',
  selectedIndex: -1,
  selectedValue: '',
  selectedValues: {},
};

const handleClick =
  ({ dispatch, options, multiSelect }: IHandlerArg, index: number) =>
  (e: FocusEvent<HTMLUListElement>) => {
    const option = options.current[index];
    dispatch({ type: FOCUS_OPTION, payload: option });
    if (multiSelect) {
      dispatch({ type: MULTI_SELECT_OPTION, payload: option });
    } else {
      dispatch({ type: SELECT_OPTION, payload: option });
    }
  };

const handleClickControlled =
  ({ options, onChange, onSelect }: IControlledHandlerArgs, index: number) =>
  (e: FocusEvent<HTMLUListElement>) => {
    const option = options.current[index];
    onChange && onChange(option);
    onSelect && onSelect(option, false);
  };

const handleFocus =
  ({
    state,
    dispatch,
    options,
    listboxRef,
    optionsRef,
    multiSelect,
    defaultSelectedIndex,
    focusedIndex: controlledFocusedIndex,
  }: IHandlerArg) =>
  (e: FocusEvent<HTMLUListElement>) => {
    let option;

    if (typeof defaultSelectedIndex === 'number') {
      option = options.current[defaultSelectedIndex];
    } else {
      option = options.current[0];
    }

    if (state.focusedValue === '' && options.current.length) {
      dispatch({ type: FOCUS_OPTION, payload: option });
      if (!multiSelect) {
        dispatch({ type: SELECT_OPTION, payload: option });
      }
    }

    if (controlledFocusedIndex !== undefined && controlledFocusedIndex > -1) {
      if (optionsRef.current.length) {
        focusElement(optionsRef.current[controlledFocusedIndex].current, listboxRef.current);
      }
    }
  };

const handleKeyDownControlled =
  ({ state, options, onChange, onSelect, listboxRef, optionsRef, dispatch }: IControlledHandlerArgs) =>
  (e: KeyboardEvent<HTMLUListElement>) => {
    const key = e.which || e.keyCode;

    if (key === KEY_CODES.TAB) return;

    const { focusedIndex } = state;

    if (focusedIndex === undefined || focusedIndex < 0) return;

    e.preventDefault();

    switch (key) {
      case KEY_CODES.UP:
        if (focusedIndex > 0) {
          const nextIndex = focusedIndex - 1;
          focusElement(optionsRef.current[nextIndex].current, listboxRef.current);
          const option = options.current[nextIndex];
          onChange && onChange(option);
        }
        break;
      case KEY_CODES.DOWN:
        if (focusedIndex !== options.current.length - 1) {
          const nextIndex = focusedIndex + 1;
          focusElement(optionsRef.current[nextIndex].current, listboxRef.current);
          const option = options.current[nextIndex];
          onChange && onChange(option);
        }
        break;
      case KEY_CODES.RETURN:
        const option = options.current[focusedIndex];
        onSelect && onSelect(option, true);
        break;
    }
  };

const handleKeyDown =
  ({ state, dispatch, options, multiSelect, listboxRef, optionsRef }: IHandlerArg) =>
  (e: KeyboardEvent<HTMLUListElement>) => {
    const key = e.which || e.keyCode;

    if (key === KEY_CODES.TAB) return;

    const { focusedIndex } = state;

    e.preventDefault();

    switch (key) {
      case KEY_CODES.UP:
        if (focusedIndex > 0) {
          const nextIndex = focusedIndex - 1;
          focusElement(optionsRef.current[nextIndex].current, listboxRef.current);
          const option = options.current[nextIndex];
          if (multiSelect) {
            dispatch({ type: FOCUS_OPTION, payload: option });
          } else {
            dispatch({ type: FOCUS_OPTION, payload: option });
            dispatch({ type: SELECT_OPTION, payload: option });
          }
        }
        break;
      case KEY_CODES.DOWN:
        if (focusedIndex !== options.current.length - 1) {
          const nextIndex = focusedIndex + 1;
          focusElement(optionsRef.current[nextIndex].current, listboxRef.current);
          const option = options.current[nextIndex];
          if (multiSelect) {
            dispatch({ type: FOCUS_OPTION, payload: option });
          } else {
            dispatch({ type: FOCUS_OPTION, payload: option });
            dispatch({ type: SELECT_OPTION, payload: option });
          }
        }
        break;
      case KEY_CODES.RETURN:
        const option = options.current[focusedIndex];
        dispatch({ type: FOCUS_OPTION, payload: option });
        if (multiSelect) {
          dispatch({ type: MULTI_SELECT_OPTION, payload: option });
        }
        break;
      case KEY_CODES.HOME:
        const firstOption = options.current[0];
        dispatch({ type: FOCUS_OPTION, payload: firstOption });
        dispatch({ type: SELECT_OPTION, payload: firstOption });
        break;
      case KEY_CODES.END:
        const lastOption = options.current[options.current.length - 1];
        dispatch({ type: FOCUS_OPTION, payload: lastOption });
        dispatch({ type: SELECT_OPTION, payload: lastOption });
        break;
    }
  };

function initialStateFn(defaultProps: IDefaultProps) {
  const { defaultSelectedIndex } = defaultProps;

  if (typeof defaultSelectedIndex !== 'number') {
    return initialState;
  }

  return {
    ...initialState,
    selectedIndex: defaultSelectedIndex,
  };
}

export const useListbox: UseListboxType = ({
  onChange,
  onSelect,
  multiSelect,
  listboxRef,
  defaultSelectedIndex,
  focusedIndex: controlledFocusedIndex,
  selectedIndex: controlledSelectedIndex,
}) => {
  const isControlled = controlledSelectedIndex != null || controlledFocusedIndex != null;
  const options = useRef<IOption[]>([]);
  const optionsRef = useRef<MutableRefObject<HTMLLIElement>[]>([]);
  const defaultProps = { defaultSelectedIndex };
  const [state, dispatch] = useReducer(reducer, defaultProps, initialStateFn);
  const handlerArgs = {
    state,
    dispatch,
    options,
    onChange,
    onSelect,
    multiSelect,
    optionsRef,
    listboxRef,
    defaultSelectedIndex,
    focusedIndex: controlledFocusedIndex,
  };
  const controlledHandlerArgs = {
    state: {
      focusedIndex: controlledFocusedIndex,
      selectedIndex: controlledSelectedIndex,
    },
    options,
    dispatch,
    onChange,
    onSelect,
    optionsRef,
    listboxRef,
  } as IControlledHandlerArgs;

  const { focusedIndex, selectedIndex, selectedValue, selectedValues } = state;

  useEffect(() => {
    if (!isControlled) {
      if (multiSelect) {
        onSelect && onSelect(selectedValues, false);
      } else {
        const option = options.current[selectedIndex];
        selectedIndex > -1 && option && onSelect && onSelect(option, false);
      }
    }
  }, [onSelect, multiSelect, selectedIndex, selectedValues, selectedValue, isControlled]);

  useEffect(() => {
    if (!isControlled) {
      const option = options.current[focusedIndex];
      focusedIndex > -1 && option && onChange && onChange(option);
    }
  }, [onChange, focusedIndex, isControlled]);

  const onFound = (index: number) => {
    const option = options.current[index];

    dispatch({ type: FOCUS_OPTION, payload: option });
    dispatch({ type: SELECT_OPTION, payload: option });

    if (isControlled && option) {
      onSelect && onSelect(option, false);
    }

    focusElement(optionsRef.current[index].current, listboxRef.current);
  };

  const onFindItemToFocus = useFindItemToFocus(listboxRef, onFound);

  const getOptionProps = ({
    id,
    ref,
    index,
    value,
    onClick,
    ...restProps
  }: IGetOptionProps): HTMLProps<HTMLLIElement> => {
    if (index === undefined) {
      throw new Error('An index is required for getOptionProps.');
    }

    let ariaSelected = false;

    if (isControlled) {
      if (Array.isArray(controlledSelectedIndex)) {
        if (controlledSelectedIndex.includes(index)) {
          ariaSelected = true;
        }
      }
      if (index === controlledSelectedIndex) {
        ariaSelected = true;
      }
    } else {
      if (multiSelect) {
        if (id === (selectedValues[value] && selectedValues[value].id)) {
          ariaSelected = true;
        }
      } else if (index === selectedIndex) {
        ariaSelected = true;
      }
    }

    return {
      id,
      ref,
      role: 'option',
      'aria-selected': ariaSelected,
      onClick: composeEventHandlers(
        onClick,
        isControlled ? handleClickControlled(controlledHandlerArgs, index) : handleClick(handlerArgs, index)
      ),
      ...restProps,
    };
  };

  const [controlledActiveDescendant, setControlledActiveDescendant] = useState<string>();

  // Does not have a dependencies array so that active-descendant
  // can be up-to-date after initial render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (controlledFocusedIndex !== undefined && listboxRef.current && controlledFocusedIndex > -1) {
      setControlledActiveDescendant(listboxRef.current.children[controlledFocusedIndex].id);
    }
  });

  const getListboxProps = ({ ref, onFocus, onKeyDown, ...restProps }: HTMLProps<HTMLUListElement>) => ({
    ref,
    tabIndex: 0,
    role: 'listbox',
    'aria-activedescendant': isControlled ? controlledActiveDescendant : state.focusedId || undefined,
    onFocus: composeEventHandlers(onFocus, handleFocus(handlerArgs)),
    onKeyDown: composeEventHandlers(
      onKeyDown,
      onFindItemToFocus,
      isControlled ? handleKeyDownControlled(controlledHandlerArgs) : handleKeyDown(handlerArgs)
    ),
    ...restProps,
  });

  return {
    options,
    optionsRef,
    getOptionProps,
    getListboxProps,
  };
};
