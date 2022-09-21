# Welcome to Gatsby Plugin Remote Images contributing guide <!-- omit in toc -->

Thank you for your interest in contributing to the Gatsby Plugin Remote Images .

## Getting started

- Read the [README](README.md) to get an overview of the plugin.
- Browse the
  [issues](https://github.com/graysonhicks/gatsby-plugin-remote-images/issues)
  and
  [discussions](https://github.com/graysonhicks/gatsby-plugin-remote-images/discussions)
  already taking place to familiarize yourself with the state of the project.

## Contribute with code

You may either solve an exciting
[issue](https://github.com/graysonhicks/gatsby-plugin-remote-images/issues), or
create a new
[issue](https://github.com/graysonhicks/gatsby-plugin-remote-images/issues/new).

Either way, make sure to outline your plan of action and get some feedback
before spending too much time on your solution.

If you are new to open source code contributions, here are some links to get you
started:

- [Set up Git](https://docs.github.com/en/get-started/quickstart/set-up-git)
- [Collaborating with pull requests](https://docs.github.com/en/github/collaborating-with-pull-requests)

### Fork, Clone and Install

1. Fork this repository
2. Clone the fork to your local machine:
   `git clone git@github.com:graysonhicks/gatsby-plugin-remote-images.git`
3. Move into repo folder: `cd gatsby-plugin-remote-images`
4. Install packages: `yarn`

#### Yarn Workspace

The project uses
[yarn workspace](https://classic.yarnpkg.com/lang/en/docs/workspaces/) to host
the plugin and demo codes in one repository.

When installing dependencies, make sure to include `workspace plugin` or
`workspace demo` to the command so that dependencies are added to the correct
workspace: `yarn workspace plugin add lodash`.

Important note from the yarn workspace docs:

> Be careful when publishing packages in a workspace. If you are preparing your
> next release and you decided to use a new dependency but forgot to declare it
> in the package.json file, your tests might still pass locally if another
> package already downloaded that dependency into the workspace root. However,
> it will be broken for consumers that pull it from a registry, since the
> dependency list is now incomplete so they have no way to download the new
> dependency. Currently, there is no way to throw a warning in this scenario.

### Development

Run demo: `yarn develop`

### Testing

Run tests: `yarn test` Run tests in watch mode: `yarn watch`
