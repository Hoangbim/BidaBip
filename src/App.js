import { Routes, Route } from "react-router-dom";

import "./App.css";
import Layout from "./layout/Layout";

import DashBoard from "./pages/dasboard";
import LoginPage from "./pages/login";
import OverView from "./pages/overview";
import { IntlProvider } from "react-intl";
import localeMessages from "./locale/messages";
import { useSelector } from "react-redux";

function App() {
  const locale = useSelector((state) => state.users.locale);
  return (
    <IntlProvider
      messages={localeMessages[locale]}
      locale="en"
      defaultLocale="en"
    >
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LoginPage />} />
          <Route path=":id" element={<DashBoard />} />
          <Route path="*" element={<div>not found</div>} />
          <Route path="over-view/:tableId" element={<OverView />} />
        </Route>
      </Routes>
    </IntlProvider>
  );
}

export default App;
