import React from 'react';
interface PrefetchKeepMountedLayoutProps {
  mountedCondition: boolean;
  render: () => React.ReactNode;
}
class PrefetchKeepMountedLayout extends React.Component<PrefetchKeepMountedLayoutProps> {
  render() {
    const { mountedCondition, render } = this.props;
    return <div style={{ display: mountedCondition ? '' : 'none' }}>{render()}</div>;
  }
}
export default PrefetchKeepMountedLayout;
