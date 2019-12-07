# :floppy_disk: gatsby-plugin-remote-images

Download images from any string field on a node so that those images can be
queried and used with
[`gatsby-image`](https://www.gatsbyjs.org/packages/gatsby-image/).

### Usage

#### Install

First, install the plugin.

`npm install --save gatsby-plugin-remote-images`

#### Config

Second, set up the `gatsby-config.js` with the plugin. The most common config
would be this:

```javascript
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-remote-images`,
      options: {
        nodeType: 'myNode',
        imageUrlField: 'imageUrl',
      },
    },
  ],
};
```

However, you may need more optional config, which is documented here.

```javascript
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-remote-images`,
      options: {
        // The node type that has the images you want to grab. For top-level
        // nodes, this is often the camel-cased version of the word after the
        // 'all' in GraphQL (e.g. the node type of the nodes `allMyImage` type
        // is `myImage`). For other nodes, you will need to identify the type
        // by examining the schema.
        nodeType: 'myNode',
        // This is the field on each 'myNode' that contains the URL to the
        // image.
        imageUrlField: 'imageUrl',
        //
        // ** ALL OPTIONAL BELOW HERE: **
        //
        // Name you want to give new image file field on the node.
        imageFileField: 'theNewImageField', // default: 'localImage'
        // Adds htaccess authentication to the download request if passed in.
        auth: { htaccess_user: `USER`, htaccess_pass: `PASSWORD` },
        // Sets the file extension. Useful for APIs that separate the image file
        // path from its extension. Or for changing the extension.  Defaults to
        // existing file extension.
        ext: '.jpg',
        // Allows modification of the URL per image if needed. Expects a
        // function taking the original URL as a parameter and returning the
        // desired URL. Note: the url passed in to this function already
        // includes the extension from the 'ext' option (if provided).
        prepareUrl: url => (url.startsWith('//') ? `https:${url}` : url),
      },
    },
  ],
};
```

### Why?

Why do you need this plugin? The fantastic gatsby-image tool only works on
_relative_ paths. This lets you use it on images from an API with an _absolute_
path. For example, look at these two response from one GraphQL query:

_Query_

```graphql
{
  allMyNode {
    edges {
      node {
        id
        imageUrl
      }
    }
  }
}
```

_Absolute imageUrl NOT available to gatsby-image_

```json
{
  "allMyNode": {
    "edges": [
      {
        "node": {
          "id": 123,
          "imageUrl": "http://remoteimage.com/url.jpg"
        }
      }
    ]
  }
}
```

_Relative imageUrl IS available to gatsby-image_

```json
{
  "allMyNode": {
    "edges": [
      {
        "node": {
          "id": 123,
          "imageUrl": "localImages/url.jpg"
        }
      }
    ]
  }
}
```

If you don't control the API that you are hitting (many third party APIs return
a field with a string to an absolute path for an image), this means those image
aren't run through
[`gatsby-transformer-sharp`](https://www.gatsbyjs.org/packages/gatsby-transformer-sharp/)
and you lose all of the benefits.

To get the images and make them available for the above example, follow the
install instructions and your config should look like this:

```javascript
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-remote-images`,
      options: {
        nodeType: 'myNode',
        imageUrlField: 'imageUrl',
        // OPTIONAL: Name you want to give new image file field on the node.
        imageFileField: 'imageFile', // default: 'localImage'
      },
    },
  ],
};
```

Now, if we query `allMyNode` we get a `File` node with a `childImageSharp` field
(provided by `gatsby-transformer-sharp`) and it's ready for use with
`gatsby-image`:

```graphql
{
  allMyNode {
    edges {
      node {
        id
        imageUrl # required! You must include this in your query.
        localImage {
          childImageSharp {
            fluid(maxWidth: 400, maxHeight: 250) {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    }
  }
}
```

### Migrating from older versions

For instructions on migrating from a previous major version of this plugin,
please see the [migration guide](MIGRATION.md).
