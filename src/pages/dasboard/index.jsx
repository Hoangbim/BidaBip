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
  Popconfirm,
  Space,
  Input,
} from "antd";
import Title from "antd/es/typography/Title";
import {
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import {
  getUserInfo,
  handleError,
  saveTableInfo,
  saveUserInfo,
} from "../../hooks/useHttp";
import { useNavigate, useParams } from "react-router-dom";

export const baseUrl = "https://api.biabip.cc";

const revert = (data) => {
  data.sort(() => -1);
};
function DashBoard() {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState();
  const [tableId, setTableId] = useState();
  const [amount, setAmount] = useState();
  // const tId = getTableInfo();
  const currentUser = getUserInfo();
  const [modal1Open, setModal1Open] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [modalData, setModalData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [logData, setLogData] = useState("");
  const [historyData, setHistoryData] = useState("");
  const [gameLogData, setGameLogData] = useState("");
  const [logModalTitle, setLogModalTitle] = useState("");
  const { id } = useParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [userName, setUserName] = useState("");

  // saveTableInfo(id);
  useEffect(() => {
    setIsLoggedIn(currentUser ? true : false);
  }, []);

  const joinTableHandler = async (newTableId) => {
    try {
      const res = await fetch(
        `${baseUrl}/tables/${newTableId}/players/${userName}`,
        {
          method: "POST",
        }
      );

      if (res.status === 200) {
        saveTableInfo(newTableId);
        fetchTableData();
        saveUserInfo(userName);
        setIsLoggedIn(true);
      }
      if (res.status === 404) {
        navigate("/");

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

  useEffect(() => {
    const joinTable = async () => {
      if (currentUser) {
        const res = await fetch(
          `${baseUrl}/tables/${id}/players/${currentUser}`,
          {
            method: "POST",
          }
        );
        if (res.status === 404) {
          navigate("/");

          const data = await res.json();
          const errMess = data.message;

          notification.error({
            message: errMess,
            placement: "top",
          });
        }
      }
    };
    joinTable();
  }, []);



  const onAmountChange = (e) => {
    setAmount(Math.abs(e));
  };

  const fetchTableData = async () => {
    const res = await fetch(`${baseUrl}/tables/${id}`, {
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
        setHistoryData(history);
        const convertedHistory = history.map((item) => {
          return { ...item, key: item.id };
        });

        const gameLog = convertedHistory.map((item, i) => {
          return ` ${
            i + 1
          }: ${item.fromPlayerId.toUpperCase()} transferred ${item.toPlayerId.toUpperCase()} ${
            item.amount
          }`;
        });
        revert(gameLog);
        setGameLogData(gameLog);
      }
    }
  };

  useEffect(() => {
    fetchTableData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPlayerLogData = (record, type) => {
    if (historyData) {
      const playerHistory = historyData?.filter((item, i) => {
        return item.fromPlayerId === record.id;
      });
      const incomingAmount = historyData?.filter((item, i) => {
        return item.toPlayerId === record.id;
      });

      const chickenHistory = historyData?.filter((item) => {
        return item.toPlayerId === "Chicken";
      });

      const chickenLog = chickenHistory.map((item, i) => {
        return `${
          i + 1
        }: ${item.fromPlayerId.toUpperCase()} transferred ${item.toPlayerId.toUpperCase()} ${
          item.amount
        } `;
      });

      const playerLog = playerHistory.map((item, i) => {
        return `${
          i + 1
        }: ${item.fromPlayerId.toUpperCase()} transferred ${item.toPlayerId.toUpperCase()} ${
          item.amount
        } `;
      });

      const incomingLog = incomingAmount.map((item, i) => {
        return `${i + 1}: ${item.toPlayerId.toUpperCase()} received ${
          item.amount
        } from ${item.fromPlayerId.toUpperCase()}    `;
      });

      if (record.id === "Chicken") {
        revert(chickenLog);
        setLogData(chickenLog);
      }
      if (type === "out") {
        revert(playerLog);
        setLogData(playerLog);
      }
      if (type === "in") {
        if (incomingLog.length === 0) {
          setLogData(["Làm mà ăn đi bạn ơi =)))"]);
        } else {
          revert(incomingLog);
          setLogData(incomingLog);
        }
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
              style={{
                textAlign: "center",
                wordWrap: "break-word",
                width: "50px",

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
              onClick={() => {
                setModalData(record);
                return setModal1Open(true);
              }}
            ></Button>
          );
        }
      },
    },
    {
      title: "Log",
      dataIndex: "log",
      align: "center",
      key: "log",
      render: (_, record) => {
        return (
          <Space>
            <Button
              // type="primary"
              icon={<ArrowUpOutlined style={{ color: "red" }} />}
              // size="large"
              onClick={() => {
                setLogModalOpen(true);
                setLogModalTitle(`${record.id.toUpperCase()} outcoming log`);
                getPlayerLogData(record, "out");
              }}
            ></Button>
            <Button
              // type="primary"
              icon={<ArrowDownOutlined style={{ color: "green" }} />}
              // size="large"
              onClick={() => {
                setLogModalOpen(true);
                setLogModalTitle(`${record.id.toUpperCase()} incoming log`);
                getPlayerLogData(record, "in");
              }}
            ></Button>
          </Space>
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
      {!isLoggedIn && (
        <>
          <Col span={24} style={{ marginBottom: 16, marginTop: 50 }}>
            <Input
              size="large"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
            />
          </Col>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
              marginTop: 50,
            }}
          >
            <Popconfirm
              placement="topLeft"
              title="R u sure?"
              onConfirm={() => {
                navigate("/");
              }}
              okText="OK"
              cancelText="Cancel"
            >
              <Button
                style={{ backgroundColor: "var(--primary-color)" }}
                type="primary"
              >
                Back Home
              </Button>
            </Popconfirm>
            <Button
              type="primary"
              onClick={() => joinTableHandler(id)}
              style={{ backgroundColor: "var(--primary-color)" }}
              disabled={userName ? false : true}
            >
              Join table
            </Button>
            <Button
              type="primary"
              onClick={() => {
                saveTableInfo(id);
                saveUserInfo(userName);
                navigate(`/over-view/${id}`);
              }}
              style={{ backgroundColor: "var(--primary-color)" }}
              disabled={userName ? false : true}
            >
              Watch
            </Button>
          </div>
        </>
      )}
      {isLoggedIn && (
        <>
          <Title level={3} style={{ textAlign: "center" }}>
            SCOREBOARD
          </Title>
          <Typography.Paragraph
            copyable
            style={{ textAlign: "center", marginBottom: "30px" }}
          >
            {id}
          </Typography.Paragraph>
          <Table dataSource={tableData} columns={columns} size="small"></Table>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <Popconfirm
              placement="topLeft"
              title="R u sure?"
              onConfirm={() => {
                navigate("/");
              }}
              okText="OK"
              cancelText="Cancel"
            >
              <Button
                style={{ backgroundColor: "var(--primary-color)" }}
                type="primary"
              >
                Leave the table
              </Button>
            </Popconfirm>
            <Button
              type="primary"
              onClick={fetchTableData}
              style={{ backgroundColor: "var(--primary-color)" }}
            >
              Reload
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setLogModalOpen(true);
                setLogData(gameLogData);
                setLogModalTitle(`Outgoing log`);
              }}
              style={{ backgroundColor: "var(--primary-color)" }}
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
                  type="tel"
                  pattern="\d*"
                />
              </Col>
            </Row>
          </Modal>
          {/* Modal transfer log */}
          <Modal
            title={logModalTitle}
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
        </>
      )}
    </div>
  );
}

export default DashBoard;
