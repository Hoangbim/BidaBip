import React, { useEffect, useState } from "react";
import {
  Button,
  Tag,
  Table,
  List,
  Modal,
  notification,
  Popconfirm,
  Space,
  QRCode,
} from "antd";

import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { getTableInfo, getUserInfo } from "../../hooks/useHttp";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../dasboard";
import { useIntl } from "react-intl";
const revert = (data) => {
  data.sort(() => -1);
};

function OverView() {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState();
  const tId = getTableInfo();
  const currentUser = getUserInfo();
  const [historyData, setHistoryData] = useState("");
  const [gameLogData, setGameLogData] = useState("");
  const [logData, setLogData] = useState("");
  const [logModalOpen, setLogModalOpen] = useState(false);
  const { formatMessage } = useIntl();
  const [logModalTitle, setLogModalTitle] = useState();

  useEffect(() => {
    if (!tId || !currentUser) {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tId, currentUser]);
  const joinTable = async (tableId) => {
    if (currentUser) {
      const res = await fetch(
        `${baseUrl}/tables/${tableId}/players/${currentUser}`,
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

  const fetchTableData = async () => {
    const res = await fetch(`${baseUrl}/tables/${tId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (res.status === 404) {
      const errMess = data.message;

      notification.error({
        message: errMess,
        placement: "top",
      });
    }

    if (data) {
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
          return ` ${i + 1}: ${item.fromPlayerId} đã chuyển cho ${
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
    <div style={{ padding: "0 16px", textAlign: "center" }}>
      <QRCode value={`biabip.cc/${tId}`} style={{ margin: "16px auto" }} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          maxWidth: "70%",
          margin: "0 auto",
          marginBottom: 20,
        }}
      >
        <Button
          type="primary"
          onClick={fetchTableData}
          style={{ backgroundColor: "var(--primary-color)" }}
        >
          {formatMessage({ id: "button.reload" })}
        </Button>

        {/* open modal */}
        <Button
          type="primary"
          onClick={() => {
            setLogModalOpen(true);
            setLogData(gameLogData);
          }}
          style={{ backgroundColor: "var(--primary-color)" }}
        >
          {formatMessage({ id: "button.allLog" })}
        </Button>
      </div>

      <Table dataSource={tableData} columns={columns}></Table>
      <div
        style={{
          display: "flex",
          maxWidth: "70%",
          margin: "0 auto",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <Button
          style={{ backgroundColor: "var(--primary-color)" }}
          type="primary"
          onClick={() => {
            navigate("/");
          }}
        >
          {formatMessage({ id: "button.backHome" })}
        </Button>
        <Popconfirm
          placement="topLeft"
          title="Bạn chắc chứ?"
          onConfirm={() => {
            joinTable(tId);
            navigate(`/${tId}`);
          }}
          okText="OK"
          cancelText="Cancel"
        >
          <Button
            style={{ backgroundColor: "var(--primary-color)" }}
            type="primary"
          >
            {formatMessage({ id: "button.joinTable" })}
          </Button>
        </Popconfirm>
      </div>
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
    </div>
  );
}

export default OverView;
