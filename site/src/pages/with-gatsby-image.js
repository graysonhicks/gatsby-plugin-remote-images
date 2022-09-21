import React from 'react';
import Img from 'gatsby-image';
import { graphql } from 'gatsby';

import MainLayout from '../layouts';

class WithPage extends React.Component {
  render() {
    const { data } = this.props;
    return (
      <MainLayout pageTitle="with plugin">
        <h2>With gatsby-plugin-remote-images used on image field</h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {data.allFoxNodes.edges.map(({ node }) => (
            <div style={{ width: '25%' }}>
              <Img fluid={node.localImage.childImageSharp.fluid} />
            </div>
          ))}
        </div>
      </MainLayout>
    );
  }
}

export default WithPage;

export const withoutQuery = graphql`
  {
    allFoxNodes {
      edges {
        node {
          localImage {
            childImageSharp {
              fluid(maxWidth: 500) {
                ...GatsbyImageSharpFluid
              }
            }
          }
        }
      }
    }
  }
`;
