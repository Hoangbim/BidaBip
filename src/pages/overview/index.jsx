import React, { useEffect, useState } from "react";
import { Button, Row, Tag, Col, Table, Typography } from "antd";
import Title from "antd/es/typography/Title";

import { getTableInfo, getUserInfo } from "../../hooks/useHttp";
import { useNavigate } from "react-router-dom";

export const baseUrl = "https://biabip.ntbinh.me";

function OverView() {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState();
  const [tableId, setTableId] = useState();

  const tId = getTableInfo();
  const currentUser = getUserInfo();

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

    if (data) {
      setTableId(data.id);
      const players = Object.keys(data.players).map(
        (item) => data.players[item]
      );
      const convertedData = players.map((item) => {
        return { ...item, key: item.id };
      });
      setTableData(convertedData);
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
      render: (value) => (
        <Tag color="red" size="large" style={{ width: "50px" }}>
          <h3>{value}</h3>
        </Tag>
      ),
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
      <Button type="primary" onClick={fetchTableData} size="large">
        Reload
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
    </div>
  );
}

export default OverView;
