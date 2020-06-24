jest.mock('gatsby-source-filesystem');

const { createRemoteFileNode } = require('gatsby-source-filesystem');
const { onCreateNode, createResolvers } = require(`../gatsby-node`);

const getGatsbyNodeHelperMocks = () => ({
  actions: { createNode: jest.fn() },
  createNodeId: jest.fn().mockReturnValue('remoteFileIdHere'),
  createResolvers: jest.fn(),
  store: {},
  cache: {
    get: jest.fn().mockReturnValue({
      resolve: { id: 'newFileNode' },
    }),
    set: jest.fn().mockReturnValue({
      resolve: { id: 'newFileNode' },
    }),
  },
});

const mockContext = {
  nodeModel: {
    getNodeById: jest.fn(),
  },
};

describe('gatsby-plugin-remote-images', () => {
  const baseNode = {
    id: 'testing',
    parent: null,
    imageUrl: 'https://dummyimage.com/600x400/000/fff.png',
    internal: {
      contentDigest: 'testdigest',
      type: 'test',
      mediaType: 'image/png',
    },
  };
  const baseOptions = {
    nodeType: 'test',
    imagePath: 'imageUrl',
  };

  it('creates remote file node with defaults', async () => {
    const node = {
      ...baseNode,
    };
    const options = {
      ...baseOptions,
    };
    const {
      actions,
      createNodeId,
      createResolvers: mockCreateResolvers,
      store,
      cache,
    } = getGatsbyNodeHelperMocks();

    await onCreateNode({ node, actions, createNodeId, store, cache }, options);
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

    createResolvers({ cache, createResolvers: mockCreateResolvers }, options);
    expect(mockCreateResolvers).toHaveBeenCalledTimes(1);
    expect(mockCreateResolvers).toHaveBeenLastCalledWith({
      [options.nodeType]: {
        localImage: {
          type: 'File',
          resolve: expect.any(Function),
        },
      },
    });

    mockContext.nodeModel.getNodeById.mockResolvedValueOnce({
      id: 'newFileNode',
    });
    const fileNodeResolver =
      mockCreateResolvers.mock.calls[0][0][options.nodeType].localImage.resolve;

    expect(fileNodeResolver(baseNode, null, mockContext)).resolves.toEqual({
      id: 'newFileNode',
    });
  });

  it('can use the `name` option', () => {
    const options = {
      ...baseOptions,
      name: 'myNewField',
    };
    const { createResolvers: mockCreateResolvers } = getGatsbyNodeHelperMocks();

    createResolvers({ createResolvers: mockCreateResolvers }, options);
    expect(mockCreateResolvers).toHaveBeenLastCalledWith({
      [options.nodeType]: {
        [options.name]: {
          type: 'File',
          resolve: expect.any(Function),
        },
      },
    });
  });

  it('can use the `ext` option', async () => {
    const node = {
      ...baseNode,
      imageUrl: 'https://dummyimage.com/600x400/000/fff',
      internal: {
        contentDigest: 'testdigest',
        type: 'test',
        mediaType: 'image/jpg',
      },
    };
    const options = {
      ...baseOptions,
      ext: '.jpg',
    };
    const { actions, createNodeId, store, cache } = getGatsbyNodeHelperMocks();

    await onCreateNode({ node, actions, createNodeId, store, cache }, options);
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
  });

  it('can have nested arrays in `imagePath`', async () => {
    const node = {
      ...baseNode,
      nodes: [
        {
          id: 'nested parent',
          imageUrl: 'https://dummyimage.com/600x400/000/fff.png',
        },
      ],
      internal: {
        contentDigest: 'testdigest',
        type: 'test',
        mediaType: 'application/json',
      },
    };
    const options = {
      ...baseOptions,
      imagePath: 'nodes[].imageUrl',
    };
    const { actions, createNodeId, store, cache } = getGatsbyNodeHelperMocks();

    await onCreateNode({ node, actions, createNodeId, store, cache }, options);
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
  });
});
