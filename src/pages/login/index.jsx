import { Button, Col, Input, Row, Divider } from "antd";
import React, { useState } from "react";
import { baseUrl } from "../dasboard";
import { useNavigate } from "react-router-dom";
import { handleError, saveTableInfo, saveUserInfo } from "../../hooks/useHttp";

function LoginPage() {
  const [userName, setUserName] = useState("");
  const [inputTableId, setInputTableId] = useState("");
  const navigate = useNavigate();

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
        saveUserInfo(userName);
        saveTableInfo(tableId);
        navigate(`${tableId}`);
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

  return (
    <div style={{ padding: "50px 16px" }}>
      <Row>
        <Col span={24} style={{ marginBottom: 16 }}>
          <Input
            size="large"
            value={userName}
            onChange={onUserNameChange}
            placeholder="Enter your name"
          />
        </Col>

        {userName && (
          <>
            <Col span={24} style={{ marginBottom: 16 }}>
              <Button size="large" type="primary" onClick={onCreateTable}>
                CREATE A TABLE
              </Button>
            </Col>

            <Col span={24}>
              <Divider />
            </Col>
            <Col span={24} style={{ marginBottom: 16 }}>
              <Input
                size="large"
                placeholder="Table Id"
                value={inputTableId}
                onChange={(e) => {
                  setInputTableId(e.target.value);
                }}
              ></Input>
            </Col>
            <Col span={12} style={{ marginBottom: 16 }}>
              <Button
                size="large"
                type="primary"
                onClick={() => {
                  joinTableHandler(inputTableId);
                }}
              >
                JOIN TABLE
              </Button>
            </Col>
            <Col span={12}>
              <Button
                size="large"
                type="primary"
                onClick={() => {
                  saveUserInfo(userName);
                  saveTableInfo(inputTableId);
                  navigate(`over-view/${inputTableId}`);
                }}
              >
                Watch
              </Button>
            </Col>
          </>
        )}
      </Row>
    </div>
  );
}

export default LoginPage;
