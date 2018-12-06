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
    `gatsby-plugin-remote-images`
  ]
}
```s