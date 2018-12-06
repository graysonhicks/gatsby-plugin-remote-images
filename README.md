# gatsby-plugin-remote-images
Download images from any string field on another node so that those images can be queried with `gatsby-image`.

### Usage
#### Install
First, install the plugin.

`npm install --save gatsby-plugin-remote-images`

#### Config
Second, set up the `gatsby-config.js` with the plugin.
```javascript
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-remote-images`,
      options: {
        // Node type you want to grab.
        nodeType: 'drupalNodes',
        // Name you want to give new image nodes
        name: 'drupalImages',
        // Path to image url on node to grab.
        urlField: 'thumbnail.src',
        // Additional fields you want to map over to new image nodes.
        fields: ['alt', 'caption']
      },
    },
  ]
}
```

