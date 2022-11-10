import { Link } from 'gatsby'

import React, { useState } from 'react'
import Grid from '../components/grid'

const IndexPage = () => {
  return (
    <>
      <h2>Intro</h2>
      <p>
        This is a quick demo to show you the impact of Gatsby node's that do and
        don't have image fields that can be queried with `gatsby-image`. Without
        `gatsby-plugin-remote-images` these URLs remain as regular strings.
      </p>
      <Link to="/with-gatsby">Gatsby Images</Link>

      <Link to="/no-gatsby">Non-Gatsby Images</Link>
      <Link to="/with-plugin">Gatsby Plugin Images</Link>
    </>
  )
}

export default IndexPage
