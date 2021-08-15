import React from 'react';
interface PrefetchKeepMountedLayoutProps {
  mountedCondition: boolean;
  render: () => React.ReactNode;
}
class PrefetchKeepMountedLayout extends React.PureComponent<PrefetchKeepMountedLayoutProps> {
  render() {
    const { mountedCondition, render } = this.props;
    return <div style={{ contentVisibility: mountedCondition ? 'visible' : 'hidden' }}>{render()}</div>;
  }
}
export default PrefetchKeepMountedLayout;
