import React, {
  forwardRef,
  useEffect,
  useReducer,
  useContext,
  useCallback,
  createContext,
  Dispatch,
  HTMLAttributes,
} from 'react';
import { useId } from '@reach/auto-id';
import { Listbox, IListboxPropsAttributes } from './Listbox';
import { IOption, SelectedValues } from '../hooks/useListbox';
import { ListboxOption, IListboxOptionProps } from './ListboxOption';
import { KEY_CODES } from '../utils';
import { useMergeRefs } from '../hooks/useMergeRefs';

const initialState = {
  id: '',
  index: 0,
  value: '',
  expanded: false,
  size: 0,
};

const EXPAND = 'expand';
const RESET_SIZE = 'reset_size';
const INCREMENT_SIZE = 'increment_size';
const COLLAPSE = 'collapse';
const SELECT_INDEX = 'select index';
const SELECT_OPTION = 'select option';
const INITIAL_SELECT_OPTION = 'initial render select';

interface IExpand {
  type: typeof EXPAND;
}

interface IRESET_SIZE {
  type: typeof RESET_SIZE;
}

interface IINCREMENT_SIZE {
  type: typeof INCREMENT_SIZE;
}

interface ICollapse {
  type: typeof COLLAPSE;
}

interface ISelectIndex {
  type: typeof SELECT_INDEX;
  payload: number;
}

interface ISelectOption {
  type: typeof SELECT_OPTION;
  payload: IOption | SelectedValues;
}

interface IInitialSelectOption {
  type: typeof INITIAL_SELECT_OPTION;
  payload: { value: string };
}

export type SelectActionTypes =
  | ISelectOption
  | IExpand
  | ICollapse
  | IInitialSelectOption
  | ISelectIndex
  | IRESET_SIZE
  | IINCREMENT_SIZE;

type ReducerType = (state: typeof initialState, action: SelectActionTypes) => typeof initialState;

interface ISelectContext {
  id: string;
  value: string;
  index: number;
  size?: number;
  labelId: string;
  buttonId: string;
  listboxId: string;
  expanded?: boolean;
  dispatch: Dispatch<SelectActionTypes>;
  onChange: (option: IOption | SelectedValues) => void;
  onSelects: (option: IOption | SelectedValues, exclude: boolean) => void;
}

const SelectContext = createContext<ISelectContext | undefined>(undefined);

export const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (context === undefined) {
    throw new Error('useSelectContext must be used within a SelectContext.Provider');
  }

  return context;
};

export const List = forwardRef<HTMLUListElement, IListboxPropsAttributes>((props, ref) => {
  const { index, labelId, buttonId, listboxId, expanded, dispatch, onChange, onSelects } = useSelectContext();

  const onSelect = useCallback(
    (option: IOption | SelectedValues, excluded: boolean) => {
      if (expanded) {
        dispatch({ type: 'select option', payload: option });
        onSelects(option, excluded);
      }
    },
    [expanded, dispatch, onSelects]
  );

  const onChanges = useCallback(
    (option: IOption | SelectedValues) => {
      if (expanded) {
        dispatch({ type: 'select option', payload: option });
        onChange(option);
      }
    },
    [expanded, dispatch, onChange]
  );

  const listboxRef = useMergeRefs<HTMLUListElement>(ref);

  useEffect(() => {
    if (expanded && listboxRef.current) {
      listboxRef.current.focus();
    }
  }, [expanded, listboxRef]);

  return (
    <Listbox
      id={listboxId}
      ref={listboxRef}
      onSelect={onSelect}
      onChange={onChanges}
      selectedIndex={props.selectedIndex ? props.selectedIndex : index}
      focusedIndex={typeof props.selectedIndex === 'number' ? props.selectedIndex : index}
      aria-labelledby={labelId}
      onKeyDown={(e) => {
        if (e.keyCode === KEY_CODES.RETURN || e.keyCode === KEY_CODES.ESC) {
          e.preventDefault();
          dispatch({ type: 'collapse' });
          document.getElementById(buttonId)?.focus();
        }

        if (e.keyCode === KEY_CODES.UP) {
          e.preventDefault();
          if (index > 0) {
            dispatch({ type: 'select index', payload: index - 1 });
          }
        }

        if (e.keyCode === KEY_CODES.DOWN) {
          if (listboxRef.current) {
            if (index < listboxRef.current?.children.length - 1) {
              e.preventDefault();
              dispatch({ type: 'select index', payload: index + 1 });
            }
          }
        }
      }}
      {...props}
      style={{ display: expanded ? 'block' : 'none', ...props.style }}
    />
  );
});

export const Option = forwardRef<HTMLLIElement, IListboxOptionProps>((props, ref) => {
  const { dispatch, value } = useSelectContext();
  const mergedRef = useMergeRefs(ref);

  useEffect(() => {
    if (!value) {
      dispatch({
        type: 'initial render select',
        payload: { value: props.value },
      });
    }
  }, [value, props.value, dispatch]);

  return <ListboxOption ref={mergedRef} {...props} />;
});

const reducer: ReducerType = (state, action) => {
  switch (action.type) {
    case 'increment_size':
      return {
        ...state,
        size: state.size + 1,
      };
    case 'reset_size':
      return {
        ...state,
        size: 0,
      };
    case 'expand':
      return {
        ...state,
        expanded: true,
      };
    case 'collapse':
      return {
        ...state,
        expanded: false,
      };
    case 'initial render select':
      if (state.value !== '') {
        return state;
      }
      return {
        ...state,
        ...action.payload,
      };
    case 'select option':
      return {
        ...state,
        ...action.payload,
      };
    case 'select index':
      return {
        ...state,
        index: action.payload,
      };
    default:
      return state;
  }
};

export interface ISelectProps {
  expanded?: boolean;
  onChange: (option: IOption | SelectedValues) => void;
  onSelects: (option: IOption | SelectedValues, exclude: boolean) => void;
}
export const Select: React.FC<ISelectProps> = ({ expanded, onChange, onSelects, children }) => {
  const id = useId();
  const labelId = `select-label-${id}`;
  const buttonId = `select-button-${id}`;
  const listboxId = `select-listbox-${id}`;
  const [state, dispatch] = useReducer(reducer, initialState);
  const controlled = expanded != null;
  const context = {
    ...state,
    labelId,
    buttonId,
    listboxId,
    expanded: controlled ? expanded : state.expanded,
    onChange,
    onSelects,
    dispatch,
    controlled,
  };

  return <SelectContext.Provider value={context}>{children}</SelectContext.Provider>;
};
