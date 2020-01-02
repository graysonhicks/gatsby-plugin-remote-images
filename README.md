# :floppy_disk: gatsby-plugin-remote-images

Download images from any string field on another node so that those images can
be queried with `gatsby-image`.

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
        nodeType: 'myNodes',
        imagePath: 'path.to.image',
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
        // The node type that has the images you want to grab.
        // This is generally the camelcased version of the word
        // after the 'all' in GraphQL ie. allMyImages type is myImages
        nodeType: 'myNodes',
        // For simple object traversal, this is the string path to the image you
        // want to use, relative to the node.
        // This uses lodash .get, see [docs for accepted formats here](https://lodash.com/docs/4.17.11#get).
        // For traversing objects with arrays at given depths, see [how to handle arrays below](#traversing-objects-with-arrays)
        imagePath: 'path.to.image',
        // ** ALL OPTIONAL BELOW HERE: **
        // Name you want to give new image field on the node.
        // Defaults to 'localImage'.
        name: 'theNewImageField',
        // Adds htaccess authentication to the download request if passed in.
        auth: { htaccess_user: `USER`, htaccess_pass: `PASSWORD` },
        // Sets the file extension. Useful for APIs that separate the image file path
        // from its extension. Or for changing the extention.  Defaults to existing
        // file extension.
        ext: '.jpg',
        // Allows modification of the URL per image if needed. Expects a function
        // taking the original URL as a parameter and returning the desired URL.
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
allMyNodes {
    edges {
      node {
        id
        imageUrl
      }
    }
  }
```

_Absolute imageUrl NOT available to gatsby-image_

```javascript
allMyNodes: [
  {
    node: {
      id: 123,
      imageUrl: 'http://remoteimage.com/url.jpg',
    },
  },
];
```

_Relative imageUrl IS available to gatsby-image_

```javascript
allMyNodes: [
  {
    node: {
      id: 123,
      imageUrl: 'localImages/url.jpg',
    },
  },
];
```

If you don't control the API that you are hitting (many third party APIs return
a field with a string to an absolute path for an image), this means those image
aren't run through gatsby-image and you lose all of the benefits.

To get the images and make them available for the above example, follow the
install instructions and your config should look like this:

```javascript
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-remote-images`,
      options: {
        nodeType: 'myNodes',
        imagePath: 'imageUrl',
        // OPTIONAL: Name you want to give new image field on the node.
        // Defaults to 'localImage'.
        name: 'allItemImages',
      },
    },
  ],
};
```

Now, if we query `allMyNodes` we can query as we would any gatsby-image node:

```graphql
allMyNodes {
  edges {
    node {
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
```

#### Note on `gatsby-source-graphql`

Due to the way `gatsby-source-graphql` creates nodes, it is currently impossible
for any transformer type plugin to traverse the data from that plugin.
[Please read this issue for explanation](https://github.com/gatsbyjs/gatsby/issues/8404).
As soon as that as fixed in `gatsby-source-graphql`, this plugin will be tested
to make sure it works with it as well.

### Traversing objects with arrays

Since some GraphQL APIs will send back objects with nested arrays where your
target data lives, `gatsby-plugin-remote-images` also supports traversing
objects that have arrays at arbitrary depths. To opt in to this feature, add an
array literal, `[]`, to the end of the node you want to indicate is an array.

##### Note: arrays of image urls at leaf nodes are currently not supported

Given an object structure like this:

```javascript
allMyNodes {
  nodes: [
    {
      imageUrl: 'https://...'
    },
    ...
  ]
}
```

To get the images and make them available for the above example, your config
should look like this:

```javascript
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-remote-images`,
      options: {
        nodeType: 'myNodes',
        imagePath: 'nodes[].imageUrl',
      },
    },
  ],
};
```

Now, if we query `allMyNodes` we can query as we would any gatsby-image node:

```graphql
allMyNodes {
  nodes {
    localImage {
      childImageSharp {
        fluid(maxWidth: 400, maxHeight: 250) {
          ...GatsbyImageSharpFluid
        }
      }
    }
  }
}
```

##### Note: While `lodash .get` doesn't natively support this syntax, it is still used to traverse the object structure, so [the documentation for `.get`](https://lodash.com/docs/4.17.11#get) still applies in full.
