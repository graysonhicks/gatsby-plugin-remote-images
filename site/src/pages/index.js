import React from 'react';

import MainLayout from '../layouts';

class IndexPage extends React.Component {
  render() {
    return (
      <MainLayout pageTitle="intro">
        <h2>Intro</h2>
        <p>
          This is a quick demo to show you the impact of Gatsby node's that do
          and don't have image fields that can be queried with `gatsby-image`.
          Wihout `gatsby-plugin-remote-images` these URLs remain as regular
          strings.
        </p>
      </MainLayout>
    );
  }
}

export default IndexPage;
