import React, { useEffect, useState } from "react";
import {
  Button,
  Popconfirm,
  Row,
  Tag,
  Col,
  InputNumber,
  Table,
  Divider,
} from "antd";
import Title from "antd/es/typography/Title";
import { EuroOutlined } from "@ant-design/icons";
import {
  getTableInfo,
  getUserInfo,
  handleError,
  saveTableInfo,
} from "../../hooks/useHttp";
import { useNavigate, useParams } from "react-router-dom";

export const baseUrl = "http://206.189.47.104:3000";

function DashBoard() {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState();
  const [tableId, setTableId] = useState();
  const [amount, setAmount] = useState();
  const tId = getTableInfo();

  console.log("tId", tId);

  let currentUser;

  useEffect(() => {
    currentUser = getUserInfo();
  });
  const onAmountChange = (e) => {
    setAmount(e);
  };

  const fetchTableData = async () => {
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
      render: (_, record) => {
        return (
          <Popconfirm
            placement="topLeft"
            title="Pay"
            onConfirm={async () => {
              try {
                const res = await fetch(
                  `${baseUrl}/tables/${tableId}/players/${currentUser}/transfer`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      amount: amount,
                      toPlayerId: record.id,
                    }),
                  }
                );
                if (res.status === 200) {
                  setAmount(0);
                  fetchTableData();
                }
              } catch (error) {
                handleError(error);
              }
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
        );
      },
    },
  ];

  return (
    <div style={{ padding: "50px 16px" }}>
      <Title level={3} style={{ alignSelf: "center" }}>
        Bảng ghi nợ
      </Title>
      <Title level={5} style={{ alignSelf: "center" }}>
        Table ID: {tableId}
      </Title>
      <Divider />
      <Row justify={"left"}>
        <Col span={12} offset={6}>
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

      <Button
        size="large"
        type="primary"
        onClick={() => {
          localStorage.clear();
          navigate("/");
        }}
      >
        Log Out!
      </Button>
    </div>
  );
}

export default DashBoard;
