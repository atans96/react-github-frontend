import React, { useImperativeHandle } from 'react';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core';

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

interface InputSlider {
  type: string;
  dispatch: React.Dispatch<any>;
  dispatcher: (xx: any, x: React.Dispatch<any>) => void;
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
      dispatcher,
      defaultValue,
      icon,
      maxSliderRange = 100,
      minSliderRange = 1,
      shouldShowInput = false,
      sliderWidth,
      inputWidth,
    },
    ref
  ) => {
    const [value, setValue] = React.useState(defaultValue);
    const styleProps: StyleProps = { sliderWidth: sliderWidth, inputWidth: inputWidth };
    const classes = useStyles(styleProps);
    const handleSliderChange = (event: any, newValue: any) => {
      localStorage.setItem(type, newValue);
      if (newValue <= minSliderRange || !newValue) {
        setValue(minSliderRange); // don't set dispatcher here since it will trigger re-render to all component that
        // use useContext in the component
      } else {
        setValue(newValue);
      }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(parseInt(event.target.value));
      localStorage.setItem(type, event.target.value);
    };
    const shouldShowInputFn = () => {
      return (
        <div style={{ marginLeft: '1em' }}>
          <Grid item>
            <Input
              className={classes.input}
              value={value}
              margin="dense"
              onChange={handleInputChange}
              onBlur={() => dispatcher(value, dispatch)}
              inputProps={{
                step: 1,
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
              min={minSliderRange}
              max={maxSliderRange}
              value={value}
              onChange={handleSliderChange}
              onMouseUp={() => dispatcher(value, dispatch)}
              aria-labelledby="input-slider"
            />
          </Grid>
          {shouldShowInput && shouldShowInputFn()}
        </Grid>
      </div>
    );
  }
);
InputSlider.defaultProps = {
  shouldShowInput: true,
  maxSliderRange: 100,
  minSliderRange: 1,
};
InputSlider.displayName = 'InputSlider';
export default InputSlider;
