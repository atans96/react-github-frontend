import React from 'react';
interface KeepMountedLayoutProps {
  mountedCondition: boolean;
  render: () => React.ReactNode;
}
class KeepMountedLayout extends React.Component<KeepMountedLayoutProps> {
  hasBeenMounted = false;
  render() {
    const { mountedCondition, render } = this.props;
    this.hasBeenMounted = this.hasBeenMounted || mountedCondition;
    return <div style={{ display: mountedCondition ? '' : 'none' }}>{this.hasBeenMounted ? render() : null}</div>;
  }
}
export default KeepMountedLayout;
