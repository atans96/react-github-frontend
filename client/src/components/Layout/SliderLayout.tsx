import React, { useEffect, useImperativeHandle, useRef } from 'react';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core';
import { useDebouncedValue } from '../../util/util';

interface StyleProps {
  sliderWidth: number;
  inputWidth: number;
}
const useStyles = makeStyles<Theme, StyleProps>({
  root: {
    width: (props) => props.sliderWidth,
  },
  input: {
    width: (props) => props.inputWidth,
  },
});
let marks: any[] = [];
for (let i = 10; i < 101; i += 10) {
  marks.push(Object.assign({}, { value: i }));
}
for (let i = 200; i < 1001; i += 100) {
  marks.push(Object.assign({}, { value: i }));
}
interface InputSlider {
  type: string;
  dispatch: (args: any) => void;
  defaultValue: number;
  icon?: any;
  maxSliderRange?: number;
  minSliderRange?: number;
  shouldShowInput?: boolean;
  sliderWidth: number;
  inputWidth: number;
  ref?: any;
}
const InputSlider: React.FC<InputSlider> = React.forwardRef(
  (
    {
      type,
      dispatch,
      defaultValue,
      icon,
      maxSliderRange = 100,
      minSliderRange = 1,
      shouldShowInput = true,
      sliderWidth,
      inputWidth,
    },
    ref
  ) => {
    const [value, setValue] = React.useState(defaultValue);
    const styleProps: StyleProps = { sliderWidth: sliderWidth, inputWidth: inputWidth };
    const classes = useStyles(styleProps);
    const isFinished = useRef(false);
    const handleSliderChange = (event: any, newValue: any) => {
      localStorage.setItem(type, newValue);
      if (newValue <= minSliderRange || !newValue) {
        setValue(minSliderRange); // don't set dispatcher here since it will trigger re-render to all component that
      } else {
        setValue(newValue);
      }
    };
    const debouncedValue = useDebouncedValue(value, 1000);
    useEffect(() => {
      return () => {
        isFinished.current = true;
      };
    }, []);

    useEffect(() => {
      if (!isFinished.current && debouncedValue && debouncedValue >= 0) {
        handleInputChange(value);
      }
    }, [debouncedValue]);

    const handleInputChange = (value: number) => {
      setValue(value);
      dispatch(value);
      localStorage.setItem(type, String(value));
    };

    const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopPropagation();
      e.persist();
      setValue(Number(e.currentTarget.value));
    };
    const shouldShowInputFn = () => {
      return (
        <div style={{ marginLeft: '1em' }}>
          <Grid item>
            <Input
              className={classes.input}
              value={value}
              margin="dense"
              onChange={(e) => onInputChange(e)}
              onBlur={(e) => {
                e.preventDefault();
                e.stopPropagation();
                dispatch(value);
              }}
              inputProps={{
                step: 100,
                min: { minSliderRange },
                max: { maxSliderRange },
                type: 'number',
                'aria-labelledby': 'input-slider',
              }}
            />
          </Grid>
        </div>
      );
    };
    useImperativeHandle(
      ref,
      () => ({
        getState() {
          return value;
        },
      }),
      [value]
    );
    return (
      <div className={classes.root}>
        <Grid container alignItems="center">
          <div style={{ marginRight: '1em' }}>
            <Grid item>{icon}</Grid>
          </div>
          <Grid item xs>
            <Slider
              value={value}
              defaultValue={10}
              onMouseUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                dispatch(value);
              }}
              onChange={handleSliderChange}
              aria-labelledby="discrete-slider"
              step={null}
              min={10}
              max={1000}
              marks={marks}
            />
          </Grid>
          {shouldShowInput && shouldShowInputFn()}
        </Grid>
      </div>
    );
  }
);
InputSlider.displayName = 'InputSlider';
export default InputSlider;
