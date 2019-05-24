const { createRemoteFileNode } = require(`gatsby-source-filesystem`)
const get = require('lodash/get')

exports.onCreateNode = async (
  { node, actions, store, cache, createNodeId },
  options
) => {
  const { createNode } = actions
  const {
    nodeType,
    imagePath,
    name = 'localImage',
    auth = {},
    ext = null,
  } = options

  let fileNode
  if (node.internal.type === nodeType) {

    const url = ext ? `${get(node, imagePath)}${ext}` : get(node, imagePath)
    if (!url) {
      return 
    }

    try {
      fileNode = await createRemoteFileNode({
        url,
        parentNodeId: node.id,
        store,
        cache,
        createNode,
        createNodeId,
        auth,
        ext,
      })
    } catch (e) {
      console.error('gatsby-plugin-remote-images ERROR:', e)
    }
  }
  // Adds a field `localImage` or custom name to the node
  // ___NODE appendix tells Gatsby that this field will link to another node
  if (fileNode) {
    node[`${name}___NODE`] = fileNode.id
  }
}
