import { Button, Col, Input, Row, notification } from "antd";
import React, { useEffect, useState } from "react";
import { baseUrl } from "../dasboard";
import { useNavigate } from "react-router-dom";

import {
  getUserInfo,
  handleError,
  saveTableInfo,
  saveUserInfo,
} from "../../hooks/useHttp";
import { useIntl } from "react-intl";

import QrReader from "react-qr-scanner";

function LoginPage() {
  const [userName, setUserName] = useState("");
  const [inputTableId, setInputTableId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { formatMessage } = useIntl();
  const [openQr, setOpenQr] = useState(false);
  const [isHttps, setIsHttps] = useState(false);

  //test scanner area react-qr-scanner////
  useEffect(() => {
    const currentLocation = window.location.href;

    setIsHttps(currentLocation.split(":")[0] === "https" ? true : false);
  }, []);

  const delay = 300;

  const previewStyle = { height: 240, width: 320 };

  const handlerScanWebcam = (result) => {
    if (result) {
      setOpenQr(false);
      const id = result?.text.split("/")[1];
      navigate(`${id}`);
    }
  };

  const handlerScanCodeError = (err) => {
    console.log("err", err);
    navigate("/");
  };
  ///////////////end test area//////////////////

  useEffect(() => {
    const savedUserName = getUserInfo();
    if (savedUserName) {
      setIsLoggedIn(true);
      setUserName(savedUserName);
    }
  }, []);

  const onUserNameChange = (e) => {
    setUserName(e.target.value);
  };

  const joinTableHandler = async (tableId) => {
    try {
      const res = await fetch(
        `${baseUrl}/tables/${tableId}/players/${userName}`,
        {
          method: "POST",
        }
      );

      if (res.status === 200) {
        saveTableInfo(tableId);
        navigate(`${tableId}`);
      }
      if (res.status === 404) {
        const data = await res.json();
        const errMess = data.message;

        notification.error({
          message: errMess,
          placement: "top",
        });
      }
    } catch (e) {
      handleError(e);
    }
  };

  const onCreateTable = async () => {
    try {
      const res = await fetch(`${baseUrl}/tables/bip01`, {
        method: "POST",
      });
      const data = await res.json();
      if (data) {
        joinTableHandler(data.id);
      }
    } catch (e) {
      handleError(e);
    }
  };

  const loginHandler = () => {
    setIsLoggedIn(true);
    saveUserInfo(userName);
  };
  const logoutHandler = () => {
    setIsLoggedIn(false);
    setUserName("");
    localStorage.clear();
  };

  return (
    <div style={{ padding: "50px 16px", textAlign: "center" }}>
      <Row>
        {!isLoggedIn && (
          <>
            <Col span={24} style={{ marginBottom: 16 }}>
              <Input
                size="large"
                value={userName}
                onChange={onUserNameChange}
                placeholder={formatMessage({ id: "placeHolder.enterName" })}
              />
            </Col>
            <Col span={24} style={{ marginBottom: 16 }}>
              <Button
                size="large"
                type="primary"
                onClick={loginHandler}
                disabled={userName ? false : true}
                style={{ backgroundColor: "var(--primary-color)" }}
              >
                {formatMessage({ id: "title.login" })}
              </Button>
            </Col>
          </>
        )}

        {isLoggedIn && (
          <>
            <div
              style={{
                display: "flex",
                width: "70%",
                margin: "0 auto",
                justifyContent: "center",
              }}
            >
              <p style={{ fontWeight: "bolder" }}>
                {formatMessage({ id: "title.welcome" })} {userName}!&nbsp;&nbsp;
              </p>
              <p
                onClick={logoutHandler}
                style={{ color: "var(--primary-color)", scale: "0.7" }}
              >
                ({formatMessage({ id: "title.logout" })})
              </p>
            </div>
            <Col span={24} style={{ marginBottom: 16 }}>
              <p>{formatMessage({ id: "message.nowYouCan" })}</p>
            </Col>
            <Col span={24} style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                onClick={onCreateTable}
                style={{
                  backgroundColor: "var(--primary-color)",
                  translate: "-10px 0",
                }}
              >
                {formatMessage({ id: "button.create" })}
              </Button>
              <Button
                type="primary"
                onClick={() => setOpenQr(openQr === true ? false : true)}
                style={{
                  backgroundColor: "var(--primary-color)",
                  translate: "10px 0",
                }}
                disabled={!isHttps}
              >
                {formatMessage({ id: "button.scanQrCode" })}
              </Button>
            </Col>

            {/* ------------------------------ qr scanner --------------------- */}

            {openQr && (
              <div style={{ width: "80%", margin: "0 auto" }}>
                <QrReader
                  delay={delay}
                  style={previewStyle}
                  onError={handlerScanCodeError}
                  onScan={handlerScanWebcam}
                  constraints={{
                    facingMode: { exact: "environment" },
                  }}
                />
              </div>
            )}

            {/* ------------------------------ qr scanner-------------------- */}

            <Col span={24} style={{ marginBottom: 16 }}>
              <p>{formatMessage({ id: "message.or" })}</p>
            </Col>

            <Col span={24} style={{ marginBottom: 16 }}>
              <Input
                size="large"
                placeholder={formatMessage({ id: "placeHolder.enterTableId" })}
                value={inputTableId}
                onChange={(e) => {
                  setInputTableId(e.target.value);
                }}
              ></Input>
            </Col>
            <Col span={12} style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                onClick={() => {
                  joinTableHandler(inputTableId);
                }}
                style={{ backgroundColor: "var(--primary-color)" }}
                disabled={inputTableId ? false : true}
              >
                {formatMessage({ id: "button.joinTable" })}
              </Button>
            </Col>
            <Col span={12}>
              <Button
                type="primary"
                onClick={async () => {
                  // saveUserInfo(userName);
                  const res = await fetch(`${baseUrl}/tables/${inputTableId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                  });
                  const data = await res.json();

                  if (res.status === 200) {
                    saveTableInfo(inputTableId);
                    navigate(`/over-view/${inputTableId}`);
                  }
                  if (!res.ok) {
                    const errMess = data.message;

                    console.log("res", data);
                    notification.error({
                      message: errMess,
                      placement: "top",
                    });
                  }
                }}
                style={{ backgroundColor: "var(--primary-color)" }}
                disabled={inputTableId ? false : true}
              >
                {formatMessage({ id: "button.watch" })}
              </Button>
            </Col>
          </>
        )}
      </Row>
    </div>
  );
}

export default LoginPage;
