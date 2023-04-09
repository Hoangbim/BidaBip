import React from "react";
import { Outlet } from "react-router-dom";
import HeaderComponent from "./HeaderComponent";
import { Footer } from "antd/es/layout/layout";

function Layout() {
  return (
    <div>
      <HeaderComponent />
      <Outlet />
      <Footer
        style={{
          textAlign: "center",
        }}
      >
        BIDA BIP
      </Footer>
    </div>
  );
}

export default Layout;
