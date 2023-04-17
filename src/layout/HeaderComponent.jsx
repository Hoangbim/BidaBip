import { Dropdown, Layout } from "antd";

import { Header } from "antd/es/layout/layout";
import logo from "../assets/logo512.png";
import { ReactComponent as LanguageSvg } from "../assets/images/header/language.svg";
import { ReactComponent as ViVnSvg } from "../assets/images/header/vi_VN.svg";
import { ReactComponent as EnUsSvg } from "../assets/images/header/en_US.svg";
import { useDispatch, useSelector } from "react-redux";
import { usersAction } from "../store";
import { saveLocale } from "../hooks/useHttp";

const HeaderComponent = () => {
  const dispatch = useDispatch();
  const locale = useSelector((state) => state.users.locale);
  const selectLocale = ({ key }) => {
    dispatch(usersAction.setLocale(key));
    saveLocale(key);
  };
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

        <Dropdown
          menu={{
            onClick: (info) => selectLocale(info),
            items: [
              {
                key: "vi_VN",
                icon: <ViVnSvg />,
                disabled: locale === "vi_VN",
                label: "Tiếng việt",
              },
              {
                key: "en_US",
                icon: <EnUsSvg />,
                disabled: locale === "en_US",
                label: "English",
              },
            ],
          }}
        >
          <span>
            <LanguageSvg
              id="language-change"
              style={{
                scale: "1.5",
                marginBottom: 10,

                translate: "40px 0",
              }}
            />
          </span>
        </Dropdown>
      </Header>
    </Layout>
  );
};
export default HeaderComponent;
