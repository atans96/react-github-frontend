import React from 'react'

class memoryStore {
  private _data: any = new Map();
  get (key: string) {
    if (!key) {
      return null
    }

    return this._data.get(key) || null
  }

  set (key: string, data: { x: number; y: number }) {
    if (!key) {
      return
    }
    return this._data.set(key, data)
  }
}

/**
 * Component that will save and restore Window scroll position.
 */
interface ScrollPositionProps {
  scrollKey: string;
  children?(...args: any): React.ReactNode | React.ReactNode[];
  scrollStore?: any;
}
export default class ScrollPositionManager extends React.Component<ScrollPositionProps> {
  private _target: any;
  static defaultProps = { scrollStore: new memoryStore() };
  constructor (props: ScrollPositionProps) {
    super(props)
    this.connectScrollTarget = this.connectScrollTarget.bind(this)
    this.restoreScrollPosition = this.restoreScrollPosition.bind(this)
    this._target = window
  }

  connectScrollTarget (node: any) {
    this._target = node
  }

  restoreScrollPosition (pos?: any) {
    pos = pos || this.props.scrollStore.get(this.props.scrollKey)
    if (this._target && pos) {
      scroll(this._target, pos.x, pos.y)
    }
  }

  saveScrollPosition (key?: string) {
    if (this._target) {
      const pos = getScrollPosition(this._target)
      key = key || this.props.scrollKey
      this.props.scrollStore.set(key, pos)
    }
  }

  componentDidMount () {
    this.restoreScrollPosition()
  }

  componentWillReceiveProps (nextProps: { scrollKey: string }) {
    if (this.props.scrollKey !== nextProps.scrollKey) {
      this.saveScrollPosition()
    }
  }

  componentDidUpdate (prevProps: { scrollKey: string }) {
    if (this.props.scrollKey !== prevProps.scrollKey) {
      this.restoreScrollPosition()
    }
  }

  componentWillUnmount () {
    this.saveScrollPosition()
  }

  render () {
    const { children = null, ...props } = this.props
    return children && children({ ...props, connectScrollTarget: this.connectScrollTarget })
  }
}
function scroll (target: any, x: number, y: number) {
  if (target instanceof window.Window) {
    target.scrollTo(x, y)
  } else {
    target.scrollLeft = x
    target.scrollTop = y
  }
}

function getScrollPosition (target: { scrollX: any; scrollY: any; scrollLeft: any; scrollTop: any }) {
  if (target instanceof window.Window) {
    return { x: target.scrollX, y: target.scrollY }
  }

  return { x: target.scrollLeft, y: target.scrollTop }
}
