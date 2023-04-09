import { Button, Dropdown, Layout, Space, theme } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Header } from "antd/es/layout/layout";

const items = [
  {
    key: "1",
    label: "signout",
  },
  {
    key: "2",
    label: "view log",
  },
];

const HeaderComponent = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  return (
    <Layout className="layout">
      <Header>BIDA BIP</Header>
    </Layout>
  );
};
export default HeaderComponent;
