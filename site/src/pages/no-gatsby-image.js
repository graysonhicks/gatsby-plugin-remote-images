import React from 'react';
import { graphql } from 'gatsby';

import MainLayout from '../layouts';

class WithoutPage extends React.Component {
  render() {
    console.log(this.props);

    const { data } = this.props;
    return (
      <MainLayout pageTitle="with no plugin">
        <h2>Without gatsby-plugin-remote-images used on image field</h2>
        <p>See a difference?</p>
        {data.allFoxNodes.edges.map(({ node }) => (
          <img src={node.image} style={{ width: '25%' }} alt="" />
        ))}
        <p>
          Here is the query we have to use when the image field is just a string
          with an absolute path to an image:
        </p>
        <pre>{`
          allFoxNodes {
            edges {
              node {
                image
              }
            }
          }
          `}</pre>
      </MainLayout>
    );
  }
}

export default WithoutPage;

export const withoutQuery = graphql`
  {
    allFoxNodes {
      edges {
        node {
          image
        }
      }
    }
  }
`;
