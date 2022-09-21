const gatsbyFs = jest.genMockFromModule('gatsby-source-filesystem');

/**
 * Thinly mocks `createRemoteFileNode` to test internal touchpoints,
 * which expect the returned value to have a generated `id` prop via `createNodeId`
 */
gatsbyFs.createRemoteFileNode = jest.fn(({ createNodeId }) => ({
  id: createNodeId(),
}));

module.exports = gatsbyFs;
