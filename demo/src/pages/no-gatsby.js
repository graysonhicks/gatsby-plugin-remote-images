import { graphql } from 'gatsby'
import React from 'react'
import Layout from '../layouts'

const NoGatsby = ({ data }) => {
  return (
    <Layout>
      {data.allFoxNodes.edges.map(({ node }, i) => (
        <img
          src={node.image}
          alt={`fox without gatsby plugin ${i + 1}`}
          style={{ borderRadius: '10px', width: '100%' }}
        />
      ))}
    </Layout>
  )
}

export default NoGatsby

export const noGatsbyQuery = graphql`
  {
    allFoxNodes {
      edges {
        node {
          image
        }
      }
    }
  }
`
