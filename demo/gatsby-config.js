module.exports = {
  siteMetadata: {
    title: 'Gatsby Antd Starter',
  },
  plugins: [
    {
      resolve: `gatsby-plugin-remote-images`,
      options: {
        nodeType: 'foxNodes',
        imagePath: 'image',
      },
    },
    {
      resolve: `gatsby-plugin-remote-images`,
      options: {
        nodeType: 'multiImageFoxNodes',
        imagePath: 'images',
        type: 'array',
      },
    },
    {
      resolve: `gatsby-plugin-remote-images`,
      options: {
        nodeType: 'noImagesFoxNodes',
        imagePath: 'images',
      },
    },
    'gatsby-plugin-image',
    'gatsby-plugin-react-helmet',
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'gatsby-starter-default',
        short_name: 'starter',
        start_url: '/',
        background_color: '#663399',
        theme_color: '#663399',
        display: 'minimal-ui',
        icon: 'src/gatsby.jpg',
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.app/offline
    // 'gatsby-plugin-offline',
  ],
}
