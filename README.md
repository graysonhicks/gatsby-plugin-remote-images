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
        // The node type that has the images you want to grab.
        nodeType: 'yourTargetNode',
        // String that is path to the image you want to use, relative to the node.
        // This uses lodash .get, see docs for accepted formats [here](https://lodash.com/docs/4.17.11#get).
        imagePath: 'path.to.image',
        // OPTIONAL: Name you want to give new image field on the node.
        // Defaults to 'localImage'.
        name: 'theNewImageField',
        // OPTIONAL
        // Adds htaccess authentication to the download request if passed in.
        auth: { htaccess_user: `USER`, htaccess_pass: `PASSWORD` },
        // OPTIONAL
        // Sets the file extension. Useful for APIs that separate the image file path
        // from its extension. Or for changing the extention.  Defaults to existing
        // file extension.
        ext: ".jpg",
      },
    },
  ]
}
```

