const fetch = require('node-fetch')
const crypto = require(`crypto`)

const foxFetcher = () =>
  fetch(`https://source.unsplash.com/300x300/?fox`).then(res => res)

exports.sourceNodes = async ({ actions }) => {
  const { createNode } = actions
  const foxCount = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

  const foxes = await Promise.all(
    foxCount.map(async () => {
      return await foxFetcher()
    })
  )
  foxes.forEach((fox, i) => {
    createNode({
      image: fox.url,
      id: `foxNode${i}`,
      parent: null,
      children: [],
      internal: {
        type: `foxNodes`,
        contentDigest: crypto
          .createHash(`md5`)
          .update(JSON.stringify(fox.url))
          .digest(`hex`),
      },
    })
  })

  foxes.forEach((fox, i) => {
    const otherImage = i > 0 ? foxes[i - 1].url : fox.url

    createNode({
      images: [fox.url, otherImage],
      id: `multiImageFoxNode${i}`,
      parent: null,
      children: [],
      internal: {
        type: `multiImageFoxNodes`,
        contentDigest: crypto
          .createHash(`md5`)
          .update(JSON.stringify(fox.url))
          .digest(`hex`),
      },
    })
  })

  createNode({
    id: `noImagesFoxNode`,
    parent: null,
    children: [],
    internal: {
      type: `noImagesFoxNodes`,
      contentDigest: crypto
        .createHash(`md5`)
        .update(JSON.stringify('noImagesFoxNode'))
        .digest(`hex`),
    },
  })

  return
}
