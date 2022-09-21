import React from 'react';
import { Layout, Icon } from 'antd';

import Header from '../components/header';
import Breadcrumb from '../components/breadcrumb';
import Sidebar from '../components/sidebar';

const { Footer, Content } = Layout;
const MainLayout = ({ children, pageTitle }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Header />
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb pageTitle={pageTitle} />
          {children}
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          <Icon type="github" />
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
