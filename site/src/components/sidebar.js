import React from 'react';
import { Layout, Menu, Icon } from 'antd';
import { Link } from 'gatsby';
const { Sider } = Layout;

class Sidebar extends React.Component {
  state = {
    collapsed: false,
  };

  onCollapse = collapsed => {
    this.setState({ collapsed });
  };
  render() {
    return (
      <Sider
        collapsible
        collapsed={this.state.collapsed}
        onCollapse={this.onCollapse}
      >
        <div className="logo" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key="1">
            <Link to="/">
              <Icon type="pushpin" />
              <span>Intro</span>
            </Link>
          </Menu.Item>
          <Menu.Item key="2">
            <Link to="/with-gatsby-image">
              <Icon type="smile" />
              <span>See it Work</span>
            </Link>
          </Menu.Item>
          <Menu.Item key="3">
            <Link to="/no-gatsby-image">
              <Icon type="frown" />
              <span>And Not Work :(</span>
            </Link>
          </Menu.Item>
        </Menu>
      </Sider>
    );
  }
}

export default Sidebar;
