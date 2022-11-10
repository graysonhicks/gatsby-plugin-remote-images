import React from 'react'
import Grid from '../components/grid'

const Layout = ({ children }) => {
  return (
    <div>
      <Grid>{children}</Grid>
    </div>
  )
}

export default Layout
