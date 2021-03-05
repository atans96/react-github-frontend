import React from 'react'
import PropTypes from 'prop-types'
import SRLContextComponent from './SRLContext'
import SRLWrapper from './SRLWrapper'
import SRLLightbox from './SRLLightbox'
import { useLightbox } from './SRLHooks'

const SimpleReactLightbox = ({ children }) => {
  return (
    <SRLContextComponent>
      {children}
      <SRLLightbox />
    </SRLContextComponent>
  )
}

SimpleReactLightbox.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired
}

export { useLightbox, SRLWrapper }
export default SimpleReactLightbox
