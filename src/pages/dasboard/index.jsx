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
  List,
} from "antd";
import Title from "antd/es/typography/Title";
import { DollarOutlined, EyeOutlined } from "@ant-design/icons";
import { getTableInfo, getUserInfo, handleError } from "../../hooks/useHttp";
import { useNavigate } from "react-router-dom";

export const baseUrl = "https://api.biabip.cc";

function DashBoard() {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState();
  const [tableId, setTableId] = useState();
  const [amount, setAmount] = useState();
  const tId = getTableInfo();
  const currentUser = getUserInfo();
  const [modal1Open, setModal1Open] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [modalData, setModalData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [logData, setLogData] = useState("");
  const [historyData, setHistoryData] = useState("");
  const [gameLogData, setGameLogData] = useState("");
  useEffect(() => {
    if (!tId || !currentUser) {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      ////get log data
      if (data.history) {
        const history = Object.keys(data.history).map(
          (item) => data.history[item]
        );
        // console.log("history: ", history);
        setHistoryData(history);
        const convertedHistory = history.map((item) => {
          return { ...item, key: item.id };
        });

        const gameLog = convertedHistory.map((item, i) => {
          return ` ${i + 1}: ${item.fromPlayerId} transferred ${
            item.toPlayerId
          } ${item.amount}`;
        });

        setGameLogData(gameLog);
      }
    }
  };

  useEffect(() => {
    fetchTableData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPlayerLogData = (record) => {
    if (historyData) {
      const playerHistory = historyData?.filter((item, i) => {
        return item.fromPlayerId === record.id;
      });

      const chickenHistory = historyData?.filter((item) => {
        return item.toPlayerId === "Chicken";
      });

      const chickenLog = chickenHistory.map((item, i) => {
        return `${i + 1}: ${item.fromPlayerId} transferred ${item.toPlayerId} ${
          item.amount
        } `;
      });

      const playerLog = playerHistory.map((item, i) => {
        return `${i + 1}: ${item.fromPlayerId} transferred ${item.toPlayerId} ${
          item.amount
        } `;
      });
      if (record.id === "Chicken") {
        setLogData(chickenLog);
      } else {
        setLogData(playerLog);
      }
    }
  };

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
          <>
            <Tag
              color={color}
              // size="large"
              style={{
                textAlign: "center",
                wordWrap: "break-word",
                width: "50px",
                // height: "40px",
                paddingTop: "0px",
              }}
            >
              <h3>{value}</h3>
            </Tag>
          </>
        );
      },
    },
    {
      title: "Pay",
      dataIndex: "pay",
      key: "pay",
      render: (_, record) => {
        if (currentUser !== record.id) {
          return (
            <Button
              icon={<DollarOutlined style={{ color: "orange" }} />}
              // type="primary"
              // size="large"
              onClick={() => {
                setModalData(record);
                return setModal1Open(true);
              }}
            >
              {/* PAY */}
            </Button>
          );
        }
      },
    },
    {
      title: "Log",
      dataIndex: "log",
      key: "log",
      render: (_, record) => {
        return (
          <Button
            // type="primary"
            icon={<EyeOutlined style={{ color: "orange" }} />}
            size="large"
            onClick={() => {
              setLogModalOpen(true);
              getPlayerLogData(record);
            }}
          ></Button>
        );
      },
    },
  ];

  return (
    <div
      style={{
        padding: "0 16px",
      }}
    >
      <Title level={3} style={{ textAlign: "center" }}>
        SCOREBOARD
      </Title>

      <Typography.Paragraph
        copyable
        style={{ textAlign: "center", marginBottom: "30px" }}
      >
        {tableId}
      </Typography.Paragraph>

      <Table dataSource={tableData} columns={columns} size="small"></Table>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <Button
          // size="large"
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
          // size="large"
          // style={{ width: "40%" }}
        >
          Reload
        </Button>
        <Button
          type="primary"
          onClick={() => {
            setLogModalOpen(true);
            setLogData(gameLogData);
          }}
          // size="large"
          // style={{ width: "40%" }}
        >
          Show all log
        </Button>
      </div>

      {/* -------------------------------------modal---------------- */}
      <Modal
        title={`Transfer to ${modalData.id}`}
        // style={{ top: 20 }}
        centered
        confirmLoading={isLoading}
        open={modal1Open}
        onOk={async () => {
          try {
            setIsLoading(true);
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
              setIsLoading(false);
              const data = await res.json();
              const errMess = data.message;
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
              setIsLoading(false);
            }
          } catch (error) {
            handleError(error);
            setIsLoading(false);
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
              style={{ marginBottom: "20px" }}
              size="large"
              value={amount}
              maxLength={4}
              onChange={onAmountChange}
            />
          </Col>
        </Row>
      </Modal>

      {/* Modal transfer log */}
      <Modal
        title={<h3>Transfer log</h3>}
        // style={{ top: 20 }}
        centered
        onOk={() => setLogModalOpen(false)}
        open={logModalOpen}
        onCancel={() => setLogModalOpen(false)}
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

export default DashBoard;
