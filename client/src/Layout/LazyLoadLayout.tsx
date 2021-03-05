import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

interface Direction {
  top: number;
  left: number;
  bottom: number;
  right: number;
}
interface Measurement extends Direction {
  width?: number;
  height?: number;
}
type Placement = 'top' | 'right' | 'bottom' | 'left';
interface Offset {
  direction: Placement;
  value: number;
}
function isVisibleWithOffset (offset: Offset, rect: Direction, containmentRect: Direction) {
  const offsetDir = offset.direction
  const offsetVal = offset.value

  // Rules for checking different kind of offsets. In example if the element is
  // 90px below viewport and offsetTop is 100, it is considered visible.
  switch (offsetDir) {
    case 'top':
      return (
        containmentRect.top + offsetVal < rect.top &&
        containmentRect.bottom > rect.bottom &&
        containmentRect.left < rect.left &&
        containmentRect.right > rect.right
      )

    case 'left':
      return (
        containmentRect.left + offsetVal < rect.left &&
        containmentRect.bottom > rect.bottom &&
        containmentRect.top < rect.top &&
        containmentRect.right > rect.right
      )

    case 'bottom':
      return (
        containmentRect.bottom - offsetVal > rect.bottom &&
        containmentRect.left < rect.left &&
        containmentRect.right > rect.right &&
        containmentRect.top < rect.top
      )

    case 'right':
      return (
        containmentRect.right - offsetVal > rect.right &&
        containmentRect.left < rect.left &&
        containmentRect.top < rect.top &&
        containmentRect.bottom > rect.bottom
      )
  }
}
function normalizeRect (rect: Measurement) {
  if (rect.width === undefined) {
    rect.width = rect.right - rect.left
  }

  if (rect.height === undefined) {
    rect.height = rect.bottom - rect.top
  }

  return rect
}
interface VisibilitySensorProps {
  onChange?: (isVisible: boolean) => void; // no defined in defaultProps so make it optional here
  active: boolean; // because active is defined in defaultProps, you no need to to specify it at Card.tsx despite Props being required
  partialVisibility?: boolean | Placement;
  delayedCall?: boolean;
  offset: Offset & Direction;
  scrollCheck?: boolean;
  scrollDelay?: number;
  scrollThrottle?: number;
  resizeCheck?: boolean;
  resizeDelay?: number;
  resizeThrottle?: number;
  intervalCheck?: boolean;
  intervalDelay?: number;
  containment?: any;
  minTopValue?: number;
  forceCheck?: boolean;
}
interface VisibilitySensorStates {
  isVisible: boolean | 0 | null | undefined;
  visibilityRect: Partial<Direction>;
}
export default class VisibilitySensor extends React.Component<VisibilitySensorProps, VisibilitySensorStates> {
  static defaultProps = {
    active: true,
    partialVisibility: false,
    minTopValue: 0,
    scrollCheck: false,
    scrollDelay: 250,
    scrollThrottle: -1,
    resizeCheck: false,
    resizeDelay: 250,
    resizeThrottle: -1,
    intervalCheck: true,
    intervalDelay: 100,
    delayedCall: false,
    offset: {},
    containment: null,
    children: <span />
  };

  static propTypes = {
    onChange: PropTypes.func,
    active: PropTypes.bool,
    partialVisibility: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['top', 'right', 'bottom', 'left'])]),
    delayedCall: PropTypes.bool,
    offset: PropTypes.oneOfType([
      PropTypes.shape({
        top: PropTypes.number,
        left: PropTypes.number,
        bottom: PropTypes.number,
        right: PropTypes.number
      }),
      // deprecated offset property
      PropTypes.shape({
        direction: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
        value: PropTypes.number
      })
    ]),
    scrollCheck: PropTypes.bool,
    scrollDelay: PropTypes.number,
    scrollThrottle: PropTypes.number,
    resizeCheck: PropTypes.bool,
    resizeDelay: PropTypes.number,
    resizeThrottle: PropTypes.number,
    intervalCheck: PropTypes.bool,
    intervalDelay: PropTypes.number,
    containment: typeof window !== 'undefined' ? PropTypes.instanceOf(window.Element) : PropTypes.any,
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    minTopValue: PropTypes.number
  };

  private debounceCheck: {} | undefined | null;
  private interval: any;
  private node: any;

  constructor (props: VisibilitySensorProps) {
    super(props)

    this.state = {
      isVisible: null,
      visibilityRect: {}
    }
  }

  componentDidMount () {
    this.node = ReactDOM.findDOMNode(this) as Element
    if (this.props.active) {
      this.startWatching()
    }
  }

  componentWillUnmount () {
    this.stopWatching()
  }

  componentDidUpdate (prevProps: VisibilitySensorProps) {
    // re-register node in componentDidUpdate if children diffs [#103]
    this.node = ReactDOM.findDOMNode(this) as Element

    if (this.props.active && !prevProps.active) {
      this.setState({
        isVisible: null,
        visibilityRect: {}
      })

      this.startWatching()
    } else if (!this.props.active) {
      this.stopWatching()
    }
  }

  getContainer = () => {
    return this.props.containment || window
  };

  addEventListener = (
    target: { addEventListener: (arg0: any, arg1: () => void) => void },
    event: string | number,
    delay: any,
    throttle?: number
  ): void => {
    if (!this.debounceCheck) {
      this.debounceCheck = {}
    }

    let timeout: any
    let func

    const later = () => {
      timeout = null
      this.check()
    }

    if (throttle && throttle > -1) {
      func = () => {
        if (!timeout) {
          timeout = setTimeout(later, throttle || 0)
        }
      }
    } else {
      func = () => {
        clearTimeout(timeout)
        timeout = setTimeout(later, delay || 0)
      }
    }

    const info = {
      target: target,
      fn: func,
      getLastTimeout: () => {
        return timeout
      }
    }

    target.addEventListener(event, info.fn)
    this.debounceCheck[event] = info
  };

  startWatching = () => {
    if (this.debounceCheck || this.interval) {
      return
    }

    if (this.props.intervalCheck) {
      this.interval = setInterval(this.check, this.props.intervalDelay)
    }

    if (this.props.scrollCheck) {
      this.addEventListener(this.getContainer(), 'scroll', this.props.scrollDelay, this.props.scrollThrottle)
    }

    if (this.props.resizeCheck) {
      this.addEventListener(window, 'resize', this.props.resizeDelay, this.props.resizeThrottle)
    }

    // if dont need delayed call, check on load ( before the first interval fires )
    !this.props.delayedCall && this.check()
  };

  stopWatching = () => {
    if (this.debounceCheck) {
      // clean up event listeners and their debounce callers
      for (const debounceEvent in this.debounceCheck) {
        if (this.debounceCheck.hasOwnProperty(debounceEvent)) {
          const debounceInfo = this.debounceCheck[debounceEvent]

          clearTimeout(debounceInfo.getLastTimeout())
          debounceInfo.target.removeEventListener(debounceEvent, debounceInfo.fn)

          this.debounceCheck[debounceEvent] = null
        }
      }
    }
    this.debounceCheck = null

    if (this.interval) {
      this.interval = clearInterval(this.interval)
    }
  };

  roundRectDown (rect: Measurement) {
    return {
      top: Math.floor(rect.top),
      left: Math.floor(rect.left),
      bottom: Math.floor(rect.bottom),
      right: Math.floor(rect.right),
      width: undefined,
      height: undefined
    }
  }

  /**
   * Check if the element is within the visible viewport
   */
  check = () => {
    const el = this.node
    let rect
    let containmentRect

    // if the component has rendered to null, dont update visibility
    if (!el) {
      return this.state
    }

    rect = normalizeRect(this.roundRectDown(el.getBoundingClientRect()))

    if (this.props.containment) {
      const containmentDOMRect = this.props.containment.getBoundingClientRect()
      containmentRect = {
        top: containmentDOMRect.top,
        left: containmentDOMRect.left,
        bottom: containmentDOMRect.bottom,
        right: containmentDOMRect.right
      }
    } else {
      containmentRect = {
        top: 0,
        left: 0,
        bottom: window.innerHeight || document.documentElement.clientHeight,
        right: window.innerWidth || document.documentElement.clientWidth
      }
    }

    // Check if visibility is wanted via offset?
    const offset = this.props.offset || {}
    const hasValidOffset = typeof offset === 'object'

    if (hasValidOffset) {
      containmentRect.top += offset.top || 0
      containmentRect.left += offset.left || 0
      containmentRect.bottom -= offset.bottom || 0
      containmentRect.right -= offset.right || 0
    }

    const visibilityRect = {
      top: rect.top >= containmentRect.top,
      left: rect.left >= containmentRect.left,
      bottom: rect.bottom <= containmentRect.bottom,
      right: rect.right <= containmentRect.right
    } as any

    // https://github.com/joshwnj/react-visibility-sensor/pull/114
    const hasSize = rect.height && rect.height > 0 && rect.width && rect.width > 0

    let isVisible =
      hasSize && visibilityRect.top && visibilityRect.left && visibilityRect.bottom && visibilityRect.right

    // check for partial visibility
    if (hasSize && this.props.partialVisibility) {
      let partialVisible =
        rect.top <= containmentRect.bottom &&
        rect.bottom >= containmentRect.top &&
        rect.left <= containmentRect.right &&
        rect.right >= containmentRect.left

      // account for partial visibility on a single edge
      if (typeof this.props.partialVisibility === 'string') {
        partialVisible = visibilityRect[this.props.partialVisibility]
      }

      // if we have minimum top visibility set by props, lets check, if it meets the passed value
      // so if for instance element is at least 200px in viewport, then show it.
      isVisible = this.props.minTopValue
        ? partialVisible && rect.top <= containmentRect.bottom - this.props.minTopValue
        : partialVisible
    }

    // Deprecated options for calculating offset.
    if (typeof offset.direction === 'string' && typeof offset.value === 'number') {
      console.warn(
        '[notice] offset.direction and offset.value have been deprecated. They still work for now, but will be removed in next major version. Please upgrade to the new syntax: { %s: %d }',
        offset.direction,
        offset.value
      )

      isVisible = isVisibleWithOffset(offset, rect, containmentRect)
    }

    let state = this.state
    // notify the parent when the value changes
    if (this.state.isVisible !== isVisible) {
      state = {
        isVisible: isVisible,
        visibilityRect: visibilityRect
      }
      this.setState(state)
      if (this.props.onChange && isVisible) this.props.onChange(isVisible)
    }

    return state
  };

  render () {
    if (this.props.children instanceof Function) {
      return this.props.children({
        isVisible: this.state.isVisible,
        visibilityRect: this.state.visibilityRect
      })
    }
    return React.Children.only(this.props.children)
  }
}
