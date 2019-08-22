jest.mock('gatsby-source-filesystem');

const { createRemoteFileNode } = require('gatsby-source-filesystem');
const { onCreateNode } = require(`../gatsby-node`);

const getGatsbyNodeHelperMocks = () => ({
  actions: { createNode: jest.fn() },
  createNodeId: jest.fn().mockReturnValue('remoteFileIdHere'),
  store: {},
  cache: {},
});

describe('gatsby-plugin-remote-images', () => {
  const baseNode = {
    id: 'testing',
    parent: null,
    imageUrl: 'https://dummyimage.com/600x400/000/fff.png',
    internal: {
      contentDigest: 'testdigest',
      type: 'test',
      mediaType: 'image/png',
    }
  };
  const baseOptions = {
    nodeType: 'test',
    imagePath: 'imageUrl',
  };

  it('creates remote file node with defaults', () => {
    const node = {
      ...baseNode
    };
    const options = {
      ...baseOptions
    };
    const { actions, createNodeId, store, cache } = getGatsbyNodeHelperMocks();

    return onCreateNode({ node, actions, createNodeId, store, cache }, options).then(() => {
      expect(createNodeId).toHaveBeenCalledTimes(1);
      expect(createRemoteFileNode).toHaveBeenLastCalledWith({
        parentNodeId: 'testing',
        url: node.imageUrl,
        ext: null,
        store,
        cache,
        createNode: actions.createNode,
        createNodeId,
        auth: {},
      });
      expect(node['localImage___NODE']).toBe('remoteFileIdHere');
    });
  });

  it('can use the `name` option', () => {
    const node = {
      ...baseNode
    };
    const options = {
      ...baseOptions,
      name: 'myNewField',
    };
    const { actions, createNodeId, store, cache } = getGatsbyNodeHelperMocks();

    return onCreateNode({ node, actions, createNodeId, store, cache }, options).then(() => {
      expect(node[`${options.name}___NODE`]).toBe('remoteFileIdHere');
    });
  })

  it('can use the `ext` option', () => {
    const node = {
      ...baseNode,
      imageUrl: 'https://dummyimage.com/600x400/000/fff',
      internal: {
        contentDigest: 'testdigest',
        type: 'test',
        mediaType: 'image/jpg',
      }
    };
    const options = {
      ...baseOptions,
      ext: '.jpg',
    };
    const { actions, createNodeId, store, cache } = getGatsbyNodeHelperMocks();

    return onCreateNode({ node, actions, createNodeId, store, cache }, options).then(() => {
      expect(createNodeId).toHaveBeenCalledTimes(1);
      expect(createRemoteFileNode).toHaveBeenLastCalledWith({
        parentNodeId: 'testing',
        url: node.imageUrl + options.ext,
        ext: options.ext,
        store,
        cache,
        createNode: actions.createNode,
        createNodeId,
        auth: {},
      });
      expect(node['localImage___NODE']).toBe('remoteFileIdHere');
    });
  });

  it('can have nested arrays in `imagePath`', () => {
    const node = {
      ...baseNode,
      nodes: [{
        id: 'nested parent',
        imageUrl: 'https://dummyimage.com/600x400/000/fff.png',
      }],
      internal: {
        contentDigest: 'testdigest',
        type: 'test',
        mediaType: 'application/json',
      }
    };
    const options = {
      ...baseOptions,
      imagePath: 'nodes[].imageUrl',
    };
    const { actions, createNodeId, store, cache } = getGatsbyNodeHelperMocks();

    return onCreateNode({ node, actions, createNodeId, store, cache }, options).then(() => {
      expect(createNodeId).toHaveBeenCalledTimes(1);
      expect(createRemoteFileNode).toHaveBeenLastCalledWith({
        parentNodeId: 'nested parent',
        url: node.nodes[0].imageUrl,
        ext: null,
        store,
        cache,
        createNode: actions.createNode,
        createNodeId,
        auth: {},
      });
      expect(node.nodes[0]['localImage___NODE']).toBe('remoteFileIdHere');
    });
  });
})