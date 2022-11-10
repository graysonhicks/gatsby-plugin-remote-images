import { graphql } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'

import React from 'react'
import Layout from '../layouts'

const WithGatsby = ({ data }) => {
  return (
    <Layout>
      {data.allFoxNodes.edges.map(({ node }, i) => (
        <GatsbyImage
          image={node.localImage.childImageSharp.gatsbyImageData}
          alt={`fox with gatsby plugin ${i + 1}`}
          style={{ borderRadius: '10px' }}
        />
      ))}
    </Layout>
  )
}

export default WithGatsby

export const withGatsbyQuery = graphql`
  {
    allFoxNodes {
      edges {
        node {
          localImage {
            childImageSharp {
              gatsbyImageData(width: 600, quality: 90, layout: CONSTRAINED)
            }
          }
        }
      }
    }
  }
`
