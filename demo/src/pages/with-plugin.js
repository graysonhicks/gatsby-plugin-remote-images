import { graphql } from 'gatsby'
import { GatsbyImage, getImage } from 'gatsby-plugin-image'

import React from 'react'
import Layout from '../layouts'

const WithPluginGatsby = ({ data }) => {
  return (
    <Layout>
      {data.allFoxNodes.edges.map(({ node }, i) => {
        const image = getImage(node.pluginImage)
        return (
          <GatsbyImage
            image={image}
            alt={`fox with new gatsby plugin ${i + 1}`}
            style={{ borderRadius: '10px', display: 'block' }}
          />
        )
      })}
    </Layout>
  )
}

export default WithPluginGatsby

export const withPluginGatsbyQuery = graphql`
  {
    allFoxNodes {
      edges {
        node {
          pluginImage: localImage {
            childImageSharp {
              gatsbyImageData(
                formats: [AUTO, WEBP, AVIF]
                placeholder: BLURRED
                aspectRatio: 1
                width: 600
                quality: 90
              )
            }
          }
        }
      }
    }
  }
`
