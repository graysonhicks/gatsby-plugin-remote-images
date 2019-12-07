const { createRemoteFileNode } = require(`gatsby-source-filesystem`);

/**
 * Manipulate the original URL by appending a user-supplied extension and
 * running the result through the user-provided `prepareUrl` function.
 *
 * @param {Object} config the massageUrl config
 * @param {string} config.url the URL of the remote image
 * @param {Function} [config.prepareUrl] an optional function to manipulate the
 * URL
 * @param {string} [config.ext] an optional file extension to append to the URL
 * and image filename
 * @returns {string} the massaged version of the URL
 */
function massageUrl({ url, prepareUrl, ext }) {
  const urlWithExt = typeof ext === 'string' ? `${url}${ext}` : url;
  return typeof prepareUrl === 'function' ? prepareUrl(urlWithExt) : urlWithExt;
}

exports.createResolvers = (
  { actions, store, cache, createNodeId, createResolvers, reporter },
  pluginOptions
) => {
  const { createNode } = actions;
  const {
    nodeType,
    imageUrlField,
    imageFileField = 'localImage',
    auth = {},
    ext = null,
    prepareUrl = null,
  } = pluginOptions;

  const createRemoteFileNodeOptions = {
    store,
    cache,
    createNode,
    createNodeId,
    auth,
    ext,
    reporter,
  };

  const resolvers = {
    [nodeType]: {
      [imageFileField]: {
        type: 'File',
        resolve: async (source, _, context) => {
          if (!source[imageUrlField]) return null;
          const fileNode = await createRemoteFileNode({
            url: massageUrl({ url: source[imageUrlField], prepareUrl, ext }),
            parentNodeId: source.id,
            ...createRemoteFileNodeOptions,
          });
          return context.nodeModel.getNodeById({ id: fileNode.id });
        },
      },
    },
  };

  createResolvers(resolvers);
};
