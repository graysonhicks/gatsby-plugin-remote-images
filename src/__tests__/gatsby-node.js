const { onCreateNode } = require(`../gatsby-node`)

describe('gatsby-plugin-remote-images', () => {
  const actions = {
    createNode: jest.fn(),
  };
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
    imagePath: 'imageUrl'
  };
  const createNodeId = jest.fn().mockReturnValue('remoteFileIdHere');
  const store = {
    getState: jest.fn().mockReturnValue({program: { directory: './'}})
  }
  const cache = {
    get: jest.fn(),
    set: jest.fn()
  };

  it('creates remote file node with defaults', () => {
    const node = {
      ...baseNode
    }
    const options = {
      ...baseOptions
    };
    

    return onCreateNode({ node, actions, createNodeId, store, cache }, options).then(() => {
      const fileNode = actions.createNode.mock.calls[0][0]
      expect(actions.createNode).toHaveBeenCalledTimes(1);
      expect(createNodeId).toHaveBeenCalledTimes(1);
      expect(fileNode.ext).toBe('.png');
      expect(fileNode.url).toBe(node.imageUrl);
      expect(fileNode.internal.type).toBe('File');
      expect(fileNode.parent).toBe('testing');
      expect(node['localImage___NODE']).toBe('remoteFileIdHere');
    });
  });

  it('can use the name option', () => {
    const node = {
      ...baseNode
    }
    const options = {
      ...baseOptions,
      name: 'myNewField'
    };
    
    return onCreateNode({ node, actions, createNodeId, store, cache }, options).then(() => {
      const fileNode = actions.createNode.mock.calls[0][0]
      expect(node[`${options.name}___NODE`]).toBe('remoteFileIdHere');
    });
  })
  it('can use the ext option', () => {
    const node = {
      ...baseNode,
      imageUrl: 'https://dummyimage.com/600x400/000/fff',
      internal: {
        contentDigest: 'testdigest',
        type: 'test',
        mediaType: 'image/jpg',
      }
    }
    const options = {
      ...baseOptions,
      ext: '.jpg'
    };
    return onCreateNode({ node, actions, createNodeId, store, cache }, options).then(() => {
      const fileNode = actions.createNode.mock.calls[1][0];
      expect(fileNode.ext).toBe('.jpg');
    });
  });

})