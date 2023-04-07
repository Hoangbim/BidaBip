import React, { useEffect, useState } from "react";
import { Button, Popconfirm, Row, Tag, Col, InputNumber, Table } from "antd";
import Title from "antd/es/typography/Title";
import { EuroOutlined } from "@ant-design/icons";
import { getTableInfo, saveTableInfo } from "../../hooks/useHttp";
import { useParams } from "react-router-dom";

export const baseUrl = "http://206.189.47.104:3000";

function DashBoard() {
  const { id } = useParams();
  const [tableData, setTableData] = useState();
  const [tableId, setTableId] = useState();
  const [amount, setAmount] = useState();

  let currentUser;

  const onAmountChange = (e) => {
    setAmount(e);
  };

  const fetchTableData = async () => {
    const tId = getTableInfo();
    const res = await fetch(`${baseUrl}/tables/${tId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (data) {
      setTableId(data.id);
      saveTableInfo(data.id);
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
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          placement="topLeft"
          title="Pay"
          onConfirm={async () => {
            const res = await fetch(
              `${baseUrl}/tables/${tableId}/players/${currentUser}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: {
                  amount,
                  toPlayerId: id,
                },
              }
            );
          }}
          okText="ok"
          cancelText="Cancel"
        >
          <Button
            icon={<EuroOutlined style={{ color: "orange" }} />}
            size="large"
            type="primary"
          >
            PAY
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: "50px 16px" }}>
      <Title level={3} style={{ alignSelf: "center" }}>
        Bảng ghi nợ
      </Title>
      <Row justify={"center"}>
        <Col span={8}>
          <InputNumber
            placeholder="Enter the loss amount"
            style={{ marginBottom: "20px", width: "200px" }}
            size="large"
            value={amount}
            onChange={onAmountChange}
          />
        </Col>
      </Row>

      <Table dataSource={tableData} columns={columns}></Table>
    </div>
  );
}

export default DashBoard;
