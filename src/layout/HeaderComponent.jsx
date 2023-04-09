import { Button, Dropdown, Layout, Space, theme } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Header } from "antd/es/layout/layout";
import { useSelector } from "react-redux";
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
  const userName = useSelector((state) => state.users.name);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  return (
    <Layout className="layout">
      <Header>BIDA BỊP</Header>
    </Layout>
  );
};
export default HeaderComponent;
