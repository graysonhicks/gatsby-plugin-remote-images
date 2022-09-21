import React from 'react';

import { Breadcrumb } from 'antd';

const MainBreadcrumb = ({ pageTitle }) => (
  <Breadcrumb style={{ margin: '16px 0' }}>
    <Breadcrumb.Item>gatsby-plugin-remote-images</Breadcrumb.Item>
    <Breadcrumb.Item>{pageTitle}</Breadcrumb.Item>
  </Breadcrumb>
);

export default MainBreadcrumb;
