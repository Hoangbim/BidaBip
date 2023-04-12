import React, { useEffect, useState } from "react";
import {
  Button,
  Tag,
  Table,
  Typography,
  List,
  Modal,
  notification,
} from "antd";
import Title from "antd/es/typography/Title";
import { EyeOutlined } from "@ant-design/icons";
import { getTableInfo, getUserInfo } from "../../hooks/useHttp";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../dasboard";

function OverView() {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState();
  const tId = getTableInfo();
  const currentUser = getUserInfo();
  const [historyData, setHistoryData] = useState("");
  const [gameLogData, setGameLogData] = useState("");
  const [logData, setLogData] = useState("");
  const [logModalOpen, setLogModalOpen] = useState(false);

  useEffect(() => {
    if (!tId || !currentUser) {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tId, currentUser]);

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
    <div style={{ padding: "50px 16px", textAlign: "center" }}>
      <Title level={3} style={{ alignSelf: "center" }}>
        Table Overview
      </Title>
      <Title level={4} style={{ alignSelf: "center" }}>
        Table ID:
        <Typography.Paragraph copyable>{tId}</Typography.Paragraph>
      </Title>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          maxWidth: "70%",
          margin: "0 auto",
        }}
      >
        <Button
          type="primary"
          onClick={fetchTableData}
          style={{ backgroundColor: "var(--primary-color)" }}
        >
          Reload
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
          Show all log
        </Button>
      </div>

      <Table dataSource={tableData} columns={columns}></Table>

      <Button
        style={{ backgroundColor: "var(--primary-color)" }}
        type="primary"
        onClick={() => {
          navigate("/");
        }}
      >
        Back Home
      </Button>

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

export default OverView;
