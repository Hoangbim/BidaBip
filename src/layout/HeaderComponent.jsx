import { Layout } from "antd";

import { Header } from "antd/es/layout/layout";
import logo from "../assets/logo512.png";

const HeaderComponent = () => {
  return (
    <Layout className="layout">
      <Header
        style={{
          color: "aliceblue",
          textAlign: "center",
          backgroundColor: "#15827C ",
        }}
      >
        <img src={logo} style={{ height: "100%" }} alt="logo" />
      </Header>
    </Layout>
  );
};
export default HeaderComponent;
