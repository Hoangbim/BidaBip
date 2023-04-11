import React, { useEffect, useState } from "react";
import {
  Button,
  Row,
  Tag,
  Col,
  InputNumber,
  Table,
  Typography,
  notification,
  Modal,
} from "antd";
import Title from "antd/es/typography/Title";
import { EuroOutlined } from "@ant-design/icons";
import { getTableInfo, getUserInfo, handleError } from "../../hooks/useHttp";
import { useNavigate } from "react-router-dom";

export const baseUrl = "https://biabip.ntbinh.me";

function DashBoard() {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState();
  const [tableId, setTableId] = useState();
  const [amount, setAmount] = useState();
  const tId = getTableInfo();
  const currentUser = getUserInfo();
  const [modal1Open, setModal1Open] = useState(false);
  const [modalData, setModalData] = useState("");
  useEffect(() => {
    if (!tId || !currentUser) {
      navigate("/");
    }
  }, [tId, currentUser]);

  const onAmountChange = (e) => {
    setAmount(Math.abs(e));
  };

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
      render: (value) => {
        const color = value > 0 ? "green" : "red";
        return (
          <Tag color={color} size="large" style={{ width: "50px" }}>
            <h3>{value}</h3>
          </Tag>
        );
      },
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (_, record) => {
        if (currentUser !== record.id) {
          return (
            <Button
              icon={<EuroOutlined style={{ color: "orange" }} />}
              type="primary"
              size="large"
              onClick={() => {
                setModalData(record);
                return setModal1Open(true);
              }}
            >
              PAY
            </Button>
          );
        }
      },
    },
  ];

  return (
    <div style={{ padding: "50px 16px" }}>
      <Title level={3} style={{ alignSelf: "center" }}>
        SCOREBOARD
      </Title>

      {/* <h5>Table ID:</h5> */}
      <Typography.Paragraph copyable>{tableId}</Typography.Paragraph>

      <Table dataSource={tableData} columns={columns}></Table>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
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
        <Button
          type="primary"
          onClick={fetchTableData}
          size="large"
          // style={{ width: "40%" }}
        >
          Reload
        </Button>
      </div>

      {/* -------------------------------------modal---------------- */}
      <Modal
        title={`Transfer to ${modalData.id}`}
        // style={{ top: 20 }}
        centered
        open={modal1Open}
        onOk={async () => {
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
                  toPlayerId: modalData?.id,
                }),
              }
            );
            if (res.status === 400) {
              const data = await res.json();
              const errMess = data.message;
              console.log("errMess", errMess);
              notification.error({
                message: errMess,
                placement: "top",
              });
            }
            if (res.status === 200) {
              const message = `Đã chuyển ${amount} cho ${modalData?.id}`;

              notification.success({
                message: message,
                placement: "top",
              });
              setModal1Open(false);
              setAmount("");
              fetchTableData();
            }
          } catch (error) {
            handleError(error);
          }
        }}
        onCancel={() => {
          setAmount("");
          setModal1Open(false);
        }}
      >
        <Row>
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
      </Modal>
    </div>
  );
}

export default DashBoard;
