const { createRemoteFileNode } = require(`gatsby-source-filesystem`);
const get = require('lodash/get');

exports.onCreateNode = async (
  { node, actions, store, cache, createNodeId, reporter },
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
  } = options;
  const createImageNodeOptions = {
    store,
    cache,
    createNode,
    createNodeId,
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
      await createImageNodes(urls, node, createImageNodeOptions, reporter);
    } else if (type === 'array') {
      const urls = getPaths(node, imagePath, ext);
      await createImageNodes(urls, node, createImageNodeOptions, reporter);
    } else {
      const url = getPath(node, imagePath, ext);
      await createImageNode(url, node, createImageNodeOptions, reporter);
    }
    downloadingFilesActivity.end();
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

async function createImageNodes(urls, node, options, reporter) {
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
          reporter.verbose(`Created image from ${url}`)
        } catch (e) {
          reporter.error(`gatsby-plugin-remote-images ERROR:`, new Error(e))
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
async function createImageNode(url, node, options, reporter) {
  const { name, imagePathSegments, prepareUrl, ...restOfOptions } = options;
  let fileNode;

  if (!url) {
    return;
  }

  if (typeof prepareUrl === 'function') {
    url = prepareUrl(url);
  }

  try {
    fileNode = await createRemoteFileNode({
      ...restOfOptions,
      url,
      parentNodeId: node.id,
    });
    reporter.verbose(`Created image from ${url}`)
  } catch (e) {
    reporter.error(`gatsby-plugin-remote-images ERROR:`, new Error(e))
  }

  // Store the mapping between the current node and the newly created File node
  if (fileNode) {
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
      [name]: fileNode.id,
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
          type: '[File]',
          resolve: async (source, _, context) => {
            const fileNodeMap = await cache.get(
              getCacheKeyForNodeId(source.id)
            );
            if (!fileNodeMap || !fileNodeMap[name]) {
              return [];
            }
            return fileNodeMap[name].map(id =>
              context.nodeModel.getNodeById({ id })
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
          type: 'File',
          resolve: async (source, _, context) => {
            const fileNodeMap = await cache.get(
              getCacheKeyForNodeId(source.id)
            );
            return context.nodeModel.getNodeById({ id: fileNodeMap[name] });
          },
        },
      },
    };
    createResolvers(resolvers);
  }
};
