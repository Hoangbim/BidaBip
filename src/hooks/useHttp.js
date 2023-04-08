import { useCallback, useState } from "react";
import { notification } from "antd";

export function handleError(err) {
  if (err?.message) {
    notification.error({
      message: err?.message,
      placement: "top",
    });
  } else {
    notification.error({
      message: "Something went wrong",
      placement: "top",
    });
  }
}
const useHttp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  //hàm sendRequest với 2 params, requestConfig là 1 mảng chứa thông tin url, method, headers, body; applyData là hàm xử lý data trả về từ fetch
  const sendRequest = useCallback(async (requestConfig, applyData) => {
    //đặt trạng thái đang fetch là true, error hiện tại là null
    setIsLoading(true);
    setError(null);
    try {
      ///fetch với các config được truyền vào,
      const res = await fetch(requestConfig.url, {
        method: requestConfig.method ? requestConfig : "GET",
        headers: requestConfig.headers ? requestConfig.headers : {},
        body: requestConfig.body ? JSON.stringify(requestConfig.body) : null,
      });
      const data = await res.json();
      //gọi hàm applyData và truyền vào data
      applyData(data);
    } catch (err) {
      //thông báo lỗi quá trình fetch
      setError(err);
    }
    //đặt lại Isloading là false khi quá trình fetch xong
    setIsLoading(false);
  });

  //trả về trạng thái isLoading, error, và hàm sendRequest(config, applyData)
  return {
    isLoading,
    error,
    sendRequest,
  };
};

export const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: token ? "Bearer " + token : "",
  };
};

export const saveUserInfo = (data) => {
  return window.localStorage.setItem("user_info", JSON.stringify(data));
};

export const getUserInfo = () => {
  const data = window.localStorage.getItem("user_info");

  return data ? JSON.parse(data) : null;
};
export const saveTableInfo = (data) => {
  return window.localStorage.setItem("TABLEID", JSON.stringify(data));
};

export const getTableInfo = () => {
  const data = window.localStorage.getItem("TABLEID");

  return data ? JSON.parse(data) : null;
};

export default useHttp;
