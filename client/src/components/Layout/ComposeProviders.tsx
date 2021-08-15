import React from 'react';

interface Props {
  components: Array<React.JSXElementConstructor<React.PropsWithChildren<any>>>;
  children: React.ReactNode;
}

function ComposeProviders(props: Props) {
  const { components = [], children } = props;

  return (
    <React.Fragment>
      {components.reduceRight((acc, Comp) => {
        return <Comp>{acc}</Comp>;
      }, children)}
    </React.Fragment>
  );
}
export default ComposeProviders;
