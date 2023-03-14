'use strict';

const { createRemoteFileNode } = require(`gatsby-source-filesystem`);
const {
  addRemoteFilePolyfillInterface,
} = require('gatsby-plugin-utils/polyfill-remote-file');
const get = require('lodash/get');
const probe = require('probe-image-size');
let i = 0;
exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    nodeType: Joi.string().required(),
    imagePath: Joi.string().required(),
    name: Joi.string(),
    auth: Joi.object(),
    ext: Joi.string(),
    prepareUrl: Joi.function(),
    type: Joi.object(),
    silent: Joi.boolean(),
  });
};
const isImageCdnEnabled = () => {
  return (
    process.env.GATSBY_CLOUD_IMAGE_CDN === '1' ||
    process.env.GATSBY_CLOUD_IMAGE_CDN === 'true'
  );
};
exports.createSchemaCustomization = ({ actions, schema }) => {
  if (isImageCdnEnabled()) {
    const RemoteImageFileType = addRemoteFilePolyfillInterface(
      schema.buildObjectType({
        name: 'RemoteImageFile',
        fields: {
          id: 'ID!',
        },
        interfaces: ['Node', 'RemoteFile'],
        extensions: {
          infer: true,
        },
      }),
      {
        schema,
        actions,
      }
    );
    actions.createTypes([RemoteImageFileType]);
  }
};
exports.onCreateNode = async (
  { node, actions, store, cache, createNodeId, createContentDigest, reporter },
  options
) => {
  const { createNode } = actions;
  const {
    nodeType,
    imagePath,
    name = 'localImage',
    auth = {},
    ext = null,
    prepareUrl = null,
    type = 'object',
    silent = false,
  } = options;
  const createImageNodeOptions = {
    store,
    cache,
    createNode,
    createNodeId,
    createContentDigest,
    auth,
    ext,
    name,
    prepareUrl,
  };
  if (node.internal.type === nodeType) {
    // Check if any part of the path indicates the node is an array and splits at those indicators
    let imagePathSegments = [];
    if (imagePath.includes('[].')) {
      imagePathSegments = imagePath.split('[].');
    }
    if (imagePathSegments.length) {
      const urls = await getAllFilesUrls(imagePathSegments[0], node, {
        imagePathSegments,
        ...createImageNodeOptions,
      });
      await createImageNodes(
        urls,
        node,
        createImageNodeOptions,
        reporter,
        silent
      );
    } else if (type === 'array') {
      const urls = getPaths(node, imagePath, ext);
      await createImageNodes(
        urls,
        node,
        createImageNodeOptions,
        reporter,
        silent
      );
    } else {
      const url = getPath(node, imagePath, ext);
      await createImageNode(url, node, createImageNodeOptions, reporter);
    }
  }
};
function getPaths(node, path, ext = null) {
  const value = get(node, path);
  if (value) {
    return value.map(url => (ext ? url + ext : url));
  }
}

// Returns value from path, adding extension when supplied
function getPath(node, path, ext = null) {
  const value = get(node, path);
  return ext ? value + ext : value;
}

// Returns a unique cache key for a given node ID
function getCacheKeyForNodeId(nodeId) {
  return `gatsby-plugin-remote-images-${nodeId}`;
}
async function createImageNodes(urls, node, options, reporter, silent) {
  const { name, imagePathSegments, prepareUrl, ...restOfOptions } = options;
  let fileNode;
  if (!urls) {
    return;
  }
  const fileNodes = (
    await Promise.all(
      urls.map(async (url, index) => {
        if (typeof prepareUrl === 'function') {
          url = prepareUrl(url);
        }
        try {
          fileNode = await createRemoteFileNode({
            ...restOfOptions,
            url,
            parentNodeId: node.id,
          });
          reporter.verbose(`Created image from ${url}`);
        } catch (e) {
          if (!silent) {
            reporter.error(`gatsby-plugin-remote-images ERROR:`, new Error(e));
          }
        }
        return fileNode;
      })
    )
  ).filter(fileNode => !!fileNode);

  // Store the mapping between the current node and the newly created File node
  if (fileNodes.length) {
    // This associates the existing node (of user-specified type) with the new
    // File nodes created via createRemoteFileNode. The new File nodes will be
    // resolved dynamically through the Gatsby schema customization
    // createResolvers API and which File node gets resolved for each new field
    // on a given node of the user-specified type is determined by the contents
    // of this mapping. The keys are based on the ID of the parent node (of
    // user-specified type) and the values are each a nested mapping of the new
    // image File field name to the ID of the new File node.
    const cacheKey = getCacheKeyForNodeId(node.id);
    const existingFileNodeMap = await options.cache.get(cacheKey);
    await options.cache.set(cacheKey, {
      ...existingFileNodeMap,
      [name]: fileNodes.map(({ id }) => id),
    });
  }
}

// Creates a file node and associates the parent node to its new child
async function createImageNode(url, node, options, reporter, silent) {
  const { name, imagePathSegments, prepareUrl, ...restOfOptions } = options;
  let fileNodeId;
  let fileNode;
  if (typeof prepareUrl === 'function') {
    url = prepareUrl(url);
  }
  try {
    if (isImageCdnEnabled()) {
      fileNodeId = options.createNodeId(`RemoteImageFile >>> ${node.id}`);
      const metadata = await probe(url);
      await options.createNode({
        id: fileNodeId,
        parent: node.id,
        url: url,
        filename: `${node.id}.${metadata.type}`,
        height: metadata.height,
        width: metadata.width,
        mimeType: metadata.mime,
        internal: {
          type: 'RemoteImageFile',
          contentDigest: node.internal.contentDigest,
        },
      });
      if (!silent) {
        reporter.verbose(`Created RemoteImageFile node from ${url}`);
      }
    } else {
      fileNode = await createRemoteFileNode({
        ...restOfOptions,
        url,
        parentNodeId: node.id,
      });
      fileNodeId = fileNode.id;
      if (!silent) {
        reporter.verbose(`Created image from ${url}`);
      }
    }
  } catch (e) {
    if (!silent) {
      reporter.error(`gatsby-plugin-remote-images ERROR:`, new Error(e));
    }
    ++i;
    fileNode = await options.createNode(
      {
        id: options.createNodeId(`${i}`),
        parent: node.id,
        internal: {
          type: 'File',
          mediaType: 'application/octet-stream',
          contentDigest: options.createContentDigest(`${i}`),
        },
      },
      {
        name: 'gatsby-source-filesystem',
      }
    );
  }

  // Store the mapping between the current node and the newly created File node
  if (fileNode || isImageCdnEnabled()) {
    // This associates the existing node (of user-specified type) with the new
    // File nodes created via createRemoteFileNode. The new File nodes will be
    // resolved dynamically through the Gatsby schema customization
    // createResolvers API and which File node gets resolved for each new field
    // on a given node of the user-specified type is determined by the contents
    // of this mapping. The keys are based on the ID of the parent node (of
    // user-specified type) and the values are each a nested mapping of the new
    // image File field name to the ID of the new File node.
    const cacheKey = getCacheKeyForNodeId(node.id);
    const existingFileNodeMap = await options.cache.get(cacheKey);
    await options.cache.set(cacheKey, {
      ...existingFileNodeMap,
      [name]: fileNode ? fileNode.id : fileNodeId,
    });
  }
}

// Recursively traverses objects/arrays at each path part, and return an array of urls
async function getAllFilesUrls(path, node, options) {
  if (!path || !node) {
    return;
  }
  const { imagePathSegments, ext } = options;
  const pathIndex = imagePathSegments.indexOf(path),
    isPathToLeafProperty = pathIndex === imagePathSegments.length - 1,
    nextValue = getPath(node, path, isPathToLeafProperty ? ext : null);

  // @TODO: Need logic to handle if the leaf node is an array to then shift
  // to the function of createImageNodes.
  return Array.isArray(nextValue) && !isPathToLeafProperty
    ? // Recursively call function with next path segment for each array element
      (
        await Promise.all(
          nextValue.map(item =>
            getAllFilesUrls(imagePathSegments[pathIndex + 1], item, options)
          )
        )
      ).reduce((arr, row) => arr.concat(row), [])
    : // otherwise, handle leaf node
      nextValue;
}
exports.createResolvers = ({ cache, createResolvers }, options) => {
  const { nodeType, imagePath, name = 'localImage', type = 'object' } = options;
  if (type === 'array' || imagePath.includes('[].')) {
    const resolvers = {
      [nodeType]: {
        [name]: {
          type: isImageCdnEnabled() ? '[RemoteImageFile]' : '[File]',
          resolve: async (source, _, context) => {
            const fileNodeMap = await cache.get(
              getCacheKeyForNodeId(source.id)
            );
            if (!fileNodeMap || !fileNodeMap[name]) {
              return [];
            }
            return fileNodeMap[name].map(id =>
              context.nodeModel.getNodeById({
                id,
              })
            );
          },
        },
      },
    };
    createResolvers(resolvers);
  } else {
    const resolvers = {
      [nodeType]: {
        [name]: {
          type: isImageCdnEnabled() ? 'RemoteImageFile' : 'File',
          resolve: async (source, _, context) => {
            const fileNodeMap = await cache.get(
              getCacheKeyForNodeId(source.id)
            );
            if (!fileNodeMap) return null;
            return context.nodeModel.getNodeById({
              id: fileNodeMap[name],
            });
          },
        },
      },
    };
    createResolvers(resolvers);
  }
};
