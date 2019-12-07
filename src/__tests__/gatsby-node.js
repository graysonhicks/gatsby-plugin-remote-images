jest.mock('gatsby-source-filesystem');

const { createRemoteFileNode } = require('gatsby-source-filesystem');
const { createResolvers } = require(`../gatsby-node`);

const getGatsbyNodeHelperMocks = () => ({
  actions: { createNode: jest.fn() },
  createNodeId: jest.fn().mockReturnValue('remoteFileIdHere'),
  createResolvers: jest.fn(),
  store: {},
  cache: {},
  reporter: {},
});

const mockContext = {
  nodeModel: {
    getNodeById: jest.fn(),
  },
};

describe('gatsby-plugin-remote-images', () => {
  const baseSourceNode = {
    id: 'testing',
    parent: null,
    imageUrl: 'https://dummyimage.com/600x400/000/fff.png',
    internal: {
      contentDigest: 'testdigest',
      type: 'test',
      mediaType: 'image/png',
    },
  };

  const basePluginOptions = {
    nodeType: 'test',
    imageUrlField: 'imageUrl',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates remote file node with defaults', async () => {
    const sourceNode = { ...baseSourceNode };
    const pluginOptions = { ...basePluginOptions };
    const {
      actions,
      createNodeId,
      createResolvers: mockCreateResolvers,
      store,
      cache,
      reporter,
    } = getGatsbyNodeHelperMocks();

    createResolvers(
      {
        actions,
        store,
        cache,
        createNodeId,
        createResolvers: mockCreateResolvers,
        reporter,
      },
      pluginOptions
    );

    expect(mockCreateResolvers).toHaveBeenCalledTimes(1);
    expect(mockCreateResolvers).toHaveBeenCalledWith({
      [pluginOptions.nodeType]: {
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
      mockCreateResolvers.mock.calls[0][0][pluginOptions.nodeType].localImage
        .resolve;

    expect(fileNodeResolver(sourceNode, null, mockContext)).resolves.toEqual({
      id: 'newFileNode',
    });
  });

  it('can use the `imageFileField` option', () => {
    const pluginOptions = {
      ...basePluginOptions,
      imageFileField: 'myNewImageFileField',
    };
    const {
      actions,
      createNodeId,
      createResolvers: mockCreateResolvers,
      store,
      cache,
      reporter,
    } = getGatsbyNodeHelperMocks();

    createResolvers(
      {
        actions,
        store,
        cache,
        createNodeId,
        createResolvers: mockCreateResolvers,
        reporter,
      },
      pluginOptions
    );

    expect(mockCreateResolvers).toHaveBeenCalledTimes(1);
    expect(mockCreateResolvers).toHaveBeenCalledWith({
      [pluginOptions.nodeType]: {
        [pluginOptions.imageFileField]: {
          type: 'File',
          resolve: expect.any(Function),
        },
      },
    });
  });

  it('can use the `ext` option', async () => {
    const sourceNode = {
      ...baseSourceNode,
      imageUrl: 'https://dummyimage.com/600x400/000/fff',
      internal: {
        contentDigest: 'testdigest',
        type: 'test',
        mediaType: 'image/jpg',
      },
    };
    const pluginOptions = {
      ...basePluginOptions,
      ext: '.jpg',
    };
    const {
      actions,
      createNodeId,
      createResolvers: mockCreateResolvers,
      store,
      cache,
      reporter,
    } = getGatsbyNodeHelperMocks();

    createResolvers(
      {
        actions,
        store,
        cache,
        createNodeId,
        createResolvers: mockCreateResolvers,
        reporter,
      },
      pluginOptions
    );

    expect(mockCreateResolvers).toHaveBeenCalledTimes(1);
    const fileNodeResolver =
      mockCreateResolvers.mock.calls[0][0][pluginOptions.nodeType].localImage
        .resolve;
    await fileNodeResolver(sourceNode, null, mockContext);

    expect(createNodeId).toHaveBeenCalledTimes(1);
    expect(createRemoteFileNode).toHaveBeenCalledTimes(1);
    expect(createRemoteFileNode).toHaveBeenCalledWith({
      parentNodeId: 'testing',
      url: sourceNode.imageUrl + pluginOptions.ext,
      ext: pluginOptions.ext,
      store,
      cache,
      reporter,
      createNode: actions.createNode,
      createNodeId,
      auth: {},
    });
  });

  it('can use the `prepareUrl` option', async () => {
    const sourceNode = {
      ...baseSourceNode,
      imageUrl: 'https://dummyimage.com/600x400/000/fff',
      internal: {
        contentDigest: 'testdigest',
        type: 'test',
        mediaType: 'image/jpg',
      },
    };
    const pluginOptions = {
      ...basePluginOptions,
      prepareUrl: url => `${url}-prepared`,
    };
    const {
      actions,
      createNodeId,
      createResolvers: mockCreateResolvers,
      store,
      cache,
      reporter,
    } = getGatsbyNodeHelperMocks();

    createResolvers(
      {
        actions,
        store,
        cache,
        createNodeId,
        createResolvers: mockCreateResolvers,
        reporter,
      },
      pluginOptions
    );

    expect(mockCreateResolvers).toHaveBeenCalledTimes(1);
    const fileNodeResolver =
      mockCreateResolvers.mock.calls[0][0][pluginOptions.nodeType].localImage
        .resolve;
    await fileNodeResolver(sourceNode, null, mockContext);

    expect(createNodeId).toHaveBeenCalledTimes(1);
    expect(createRemoteFileNode).toHaveBeenCalledTimes(1);
    expect(createRemoteFileNode).toHaveBeenCalledWith({
      parentNodeId: 'testing',
      url: `${sourceNode.imageUrl}-prepared`,
      ext: null,
      store,
      cache,
      reporter,
      createNode: actions.createNode,
      createNodeId,
      auth: {},
    });
  });
});
