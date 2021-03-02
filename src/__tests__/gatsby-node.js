jest.mock('gatsby-source-filesystem');

const { createRemoteFileNode } = require('gatsby-source-filesystem');
const { onCreateNode, createResolvers } = require(`../gatsby-node`);

const getGatsbyNodeHelperMocks = () => ({
  actions: { createNode: jest.fn() },
  createNodeId: jest.fn().mockReturnValue('remoteFileIdHere'),
  createResolvers: jest.fn(),
  reporter: {
    activityTimer: jest.fn().mockReturnValue({
      start: jest.fn(),
      end: jest.fn(),
    }),
  },
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
      reporter,
    } = getGatsbyNodeHelperMocks();

    await onCreateNode(
      { node, actions, createNodeId, store, cache, reporter },
      options
    );
    expect(createNodeId).toHaveBeenCalledTimes(1);
    expect(createRemoteFileNode).toHaveBeenLastCalledWith({
      parentNodeId: baseNode.id,
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
    const {
      actions,
      createNodeId,
      store,
      cache,
      reporter,
    } = getGatsbyNodeHelperMocks();

    await onCreateNode(
      { node, actions, createNodeId, store, cache, reporter },
      options
    );
    expect(createNodeId).toHaveBeenCalledTimes(1);
    expect(createRemoteFileNode).toHaveBeenLastCalledWith({
      parentNodeId: baseNode.id,
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
    const {
      actions,
      createNodeId,
      store,
      cache,
      reporter,
    } = getGatsbyNodeHelperMocks();

    await onCreateNode(
      { node, actions, createNodeId, store, cache, reporter },
      options
    );
    expect(createNodeId).toHaveBeenCalledTimes(1);
    expect(createRemoteFileNode).toHaveBeenLastCalledWith({
      parentNodeId: baseNode.id,
      url: node.nodes[0].imageUrl,
      ext: null,
      store,
      cache,
      createNode: actions.createNode,
      createNodeId,
      auth: {},
    });
  });

  it('can have arrays at the leaf nodes', async () => {
    const node = {
      ...baseNode,
      imageUrls: [
        'https://dummyimage.com/600x400/000/fff.png',
        'https://dummyimage.com/600x400/000/fff.png',
      ],
      internal: {
        contentDigest: 'testdigest',
        type: 'test',
        mediaType: 'application/json',
      },
    };
    const options = {
      ...baseOptions,
      imagePath: 'imageUrls',
      type: 'array',
    };
    const {
      actions,
      createNodeId,
      store,
      cache,
      reporter,
    } = getGatsbyNodeHelperMocks();

    await onCreateNode(
      { node, actions, createNodeId, store, cache, reporter },
      options
    );
    expect(createNodeId).toHaveBeenCalledTimes(2);
    expect(createRemoteFileNode).toHaveBeenLastCalledWith({
      parentNodeId: baseNode.id,
      url: node.imageUrls[1],
      ext: null,
      store,
      cache,
      createNode: actions.createNode,
      createNodeId,
      auth: {},
    });
  });

  it('can have nested arrays in `imagePath` AND an array at the leaf node', async () => {
    const node = {
      ...baseNode,
      nodes: [
        {
          id: 'nested parent',
          imageUrls: [
            'https://dummyimage.com/600x400/000/fff.png',
            'https://dummyimage.com/600x400/000/fff.png',
          ],
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
      imagePath: 'nodes[].imageUrls',
      type: 'array',
    };
    const {
      actions,
      createNodeId,
      store,
      cache,
      reporter,
    } = getGatsbyNodeHelperMocks();

    await onCreateNode(
      { node, actions, createNodeId, store, cache, reporter },
      options
    );
    expect(createNodeId).toHaveBeenCalledTimes(2);
    expect(createRemoteFileNode).toHaveBeenLastCalledWith({
      parentNodeId: baseNode.id,
      url: node.nodes[0].imageUrls[1],
      ext: null,
      store,
      cache,
      createNode: actions.createNode,
      createNodeId,
      auth: {},
    });
  });

  it('can have nested arrays in `imagePath` with multiple elements in array', async () => {
    const node = {
      ...baseNode,
      nodes: [
        {
          id: 'nested parent',
          imageUrl: 'https://dummyimage.com/600x400/000/fff.png',
        },
        {
          id: 'another',
          imageUrl: 'https://dummyimage.com/600x400/000/ddd.png',
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
    const {
      actions,
      createNodeId,
      store,
      cache,
      reporter,
    } = getGatsbyNodeHelperMocks();

    await onCreateNode(
      { node, actions, createNodeId, store, cache, reporter },
      options
    );
    expect(createNodeId).toHaveBeenCalledTimes(2);
    expect(createRemoteFileNode).toHaveBeenLastCalledWith({
      parentNodeId: baseNode.id,
      url: node.nodes[1].imageUrl,
      ext: null,
      store,
      cache,
      createNode: actions.createNode,
      createNodeId,
      auth: {},
    });
    expect(cache.set).toHaveBeenCalledTimes(1);
  });

  it('can have multiple path levels', async () => {
    const node = {
      ...baseNode,
      ancestor: {
        nodes: [
          {
            id: 'nested parent',
            imageUrl: 'https://dummyimage.com/600x400/000/fff.png',
          },
          {
            id: 'another',
            imageUrl: 'https://dummyimage.com/600x400/000/ddd.png',
          },
        ],
      },
      internal: {
        contentDigest: 'testdigest',
        type: 'test',
        mediaType: 'application/json',
      },
    };
    const options = {
      ...baseOptions,
      imagePath: 'ancestor.nodes[].imageUrl',
    };
    const {
      actions,
      createNodeId,
      store,
      cache,
      reporter,
    } = getGatsbyNodeHelperMocks();

    await onCreateNode(
      { node, actions, createNodeId, store, cache, reporter },
      options
    );
    expect(createNodeId).toHaveBeenCalledTimes(2);
    expect(createRemoteFileNode).toHaveBeenLastCalledWith({
      parentNodeId: baseNode.id,
      url: node.ancestor.nodes[1].imageUrl,
      ext: null,
      store,
      cache,
      createNode: actions.createNode,
      createNodeId,
      auth: {},
    });
    expect(cache.set).toHaveBeenCalledTimes(1);
  });

  it('creates remote files node with defaults when an array is in path', async () => {
    const node = {
      ...baseNode,
      ancestor: {
        nodes: [
          {
            id: 'nested parent',
            imageUrl: 'https://dummyimage.com/600x400/000/fff.png',
          },
          {
            id: 'another',
            imageUrl: 'https://dummyimage.com/600x400/000/ddd.png',
          },
        ],
      },
    };
    const options = {
      ...baseOptions,
      imagePath: 'ancestor.nodes[].imageUrl',
    };
    const {
      actions,
      createNodeId,
      createResolvers: mockCreateResolvers,
      store,
      cache,
      reporter,
    } = getGatsbyNodeHelperMocks();

    await onCreateNode(
      { node, actions, createNodeId, store, cache, reporter },
      options
    );
    expect(createNodeId).toHaveBeenCalledTimes(2);

    createResolvers({ cache, createResolvers: mockCreateResolvers }, options);
    expect(mockCreateResolvers).toHaveBeenCalledTimes(1);
    expect(mockCreateResolvers).toHaveBeenLastCalledWith({
      [options.nodeType]: {
        localImage: {
          type: '[File]',
          resolve: expect.any(Function),
        },
      },
    });
  });
});
