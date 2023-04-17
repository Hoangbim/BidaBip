import React, { useEffect, useState } from "react";
import {
  Button,
  Row,
  Tag,
  Col,
  InputNumber,
  Table,
  notification,
  Modal,
  List,
  Popconfirm,
  Space,
  Input,
  QRCode,
} from "antd";

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
import {  useIntl } from "react-intl";

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
  const { formatMessage } = useIntl();

  // saveTableInfo(id);
  useEffect(() => {
    setIsLoggedIn(currentUser ? true : false);
  }, [currentUser]);

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
  }, [currentUser, id, navigate]);

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
          return ` ${i + 1}: ${item.fromPlayerId.toUpperCase()} ${formatMessage(
            { id: "message.transferred" }
          )} ${item.toPlayerId.toUpperCase()} ${item.amount}`;
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
        return `${i + 1}: ${item.toPlayerId.toUpperCase()} ${formatMessage({
          id: "message.transferred",
        })} ${item.fromPlayerId.toUpperCase()} ${item.amount} `;
      });

      const playerLog = playerHistory.map((item, i) => {
        return `${i + 1}: ${item.fromPlayerId.toUpperCase()} ${formatMessage({
          id: "message.transferred",
        })} ${item.toPlayerId.toUpperCase()} ${item.amount} `;
      });

      const incomingLog = incomingAmount.map((item, i) => {
        return `${i + 1}: ${item.toPlayerId.toUpperCase()} ${formatMessage({
          id: "message.received",
        })} ${item.amount} ${formatMessage({
          id: "message.from",
        })} ${item.fromPlayerId.toUpperCase()}    `;
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
      title: formatMessage({ id: "dashboard.player" }),
      dataIndex: "id",
      key: "id",
    },
    {
      title: formatMessage({ id: "dashboard.amount" }),
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
      title: formatMessage({ id: "dashboard.pay" }),
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
      title: formatMessage({ id: "dashboard.log" }),
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
                setLogModalTitle(
                  ` ${formatMessage({
                    id: "modalTitle.outComingLog",
                  })} ${record.id.toUpperCase()}`
                );
                getPlayerLogData(record, "out");
              }}
            ></Button>
            <Button
              // type="primary"
              icon={<ArrowDownOutlined style={{ color: "green" }} />}
              // size="large"
              onClick={() => {
                setLogModalOpen(true);
                setLogModalTitle(
                  `${formatMessage({
                    id: "modalTitle.incomingLog",
                  })} ${record.id.toUpperCase()}`
                );
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
              placeholder={formatMessage({ id: "placeHolder.enterName" })}
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
              title="Bạn chắc chứ"
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
                {formatMessage({ id: "button.leave" })}
              </Button>
            </Popconfirm>
            <Button
              type="primary"
              onClick={() => joinTableHandler(id)}
              style={{ backgroundColor: "var(--primary-color)" }}
              disabled={userName ? false : true}
            >
              {formatMessage({ id: "button.joinTable" })}
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
              {formatMessage({ id: "button.watch" })}
            </Button>
          </div>
        </>
      )}
      {isLoggedIn && (
        <>
          <QRCode value={`biabip.cc/${id}`} style={{ margin: "16px auto" }} />

          <Table dataSource={tableData} columns={columns} size="small"></Table>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <Popconfirm
              placement="topLeft"
              title={formatMessage({ id: "message.confirm" })}
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
                {formatMessage({ id: "button.leave" })}
              </Button>
            </Popconfirm>
            <Button
              type="primary"
              onClick={fetchTableData}
              style={{ backgroundColor: "var(--primary-color)" }}
            >
              {formatMessage({ id: "button.reload" })}
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setLogModalOpen(true);
                setLogData(gameLogData);
                setLogModalTitle(
                  formatMessage({ id: "modalTitle.outGoingLog" })
                );
              }}
              style={{ backgroundColor: "var(--primary-color)" }}
              // style={{ width: "40%" }}
            >
              {formatMessage({ id: "button.allLog" })}
            </Button>
          </div>
          {/* ------------------------------------- Transfer modal---------------- */}
          <Modal
            title={`${formatMessage({ id: "message.transferTo" })} ${
              modalData.id
            }`}
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
                  const message = `${formatMessage({
                    id: "message.transferred",
                  })} ${modalData?.id.toUpperCase()} ${amount}  `;

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
                  placeholder={formatMessage({ id: "placeHolder.lossAmount" })}
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
          {/*---------------------- Modal transfer log------------------ */}
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
