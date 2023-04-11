import React, { useEffect, useState } from "react";
import { Button, Row, Tag, Col, Table, Typography, List, Modal } from "antd";
import Title from "antd/es/typography/Title";

import { getTableInfo, getUserInfo } from "../../hooks/useHttp";
import { useAsyncError, useNavigate } from "react-router-dom";

export const baseUrl = "https://biabip.ntbinh.me";
const logUrl = "https://api.biabip.cc";
function OverView() {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState();
  const [tableId, setTableId] = useState();

  const tId = getTableInfo();
  const currentUser = getUserInfo();

  const [logData, setLogData] = useState("");

  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (!tId || !currentUser) {
      navigate("/");
    }
  }, [tId, currentUser]);

  const fetchTableData = async () => {
    const res = await fetch(`${baseUrl}/tables/${tId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    // return;
    if (data) {
      setTableId(data.id);
      const players = Object.keys(data.players).map(
        (item) => data.players[item]
      );

      const convertedData = players.map((item) => {
        return { ...item, key: item.id };
      });

      setTableData(convertedData);
      const history = Object.keys(data.history).map(
        (item) => data.history[item]
      );

      const convertedHistory = history.map((item) => {
        return { ...item, key: item.id };
      });

      const gameLog = convertedHistory.map((item, i) => {
        return ` ${i}: ${item.fromPlayerId} transferred ${item.toPlayerId} ${item.amount}`;
      });
      setLogData(gameLog);
    }
  };

  useEffect(() => {
    fetchTableData();
  }, []);

  const columns = [
    {
      title: "Player name",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Amount",
      dataIndex: "chips",
      key: "chips",
      render: (value) => {
        const color = value > 0 ? "green" : "red";
        return (
          <Tag
            color={color}
            size="large"
            style={{ width: "100px", textAlign: "center" }}
          >
            <h3>{value}</h3>
          </Tag>
        );
      },
    },
  ];

  return (
    <div style={{ padding: "50px 16px" }}>
      <Title level={3} style={{ alignSelf: "center" }}>
        Table Overview
      </Title>
      <Title level={4} style={{ alignSelf: "center" }}>
        Table ID:
        <Typography.Paragraph copyable>{tableId}</Typography.Paragraph>
      </Title>

      <div style={{}}></div>
      <Button type="primary" onClick={fetchTableData} size="large">
        Reload
      </Button>

      {/* open modal */}
      <Button type="primary" onClick={() => setOpenModal(true)} size="large">
        Show Log
      </Button>

      <Table dataSource={tableData} columns={columns}></Table>

      <Button
        size="large"
        type="primary"
        onClick={() => {
          localStorage.clear();
          navigate("/");
        }}
      >
        Back Home
      </Button>

      <Modal
        title={<h3>Transfer log</h3>}
        // style={{ top: 20 }}
        centered
        onOk={() => setOpenModal(false)}
        open={openModal}
      >
        <List
          size="small"
          bordered
          dataSource={logData}
          renderItem={(item) => (
            <List.Item>
              <h5>{item}</h5>
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
}

export default OverView;
