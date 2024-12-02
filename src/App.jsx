import "./App.css";
import React, { useEffect, useState } from "react";
import { Tabs, ConfigProvider } from "antd";
import Order from "./screen/Order";
import Statistic from "./screen/Statistic";
import ExportOrder from "./screen/ExportOrder";
import OrderSheet from "./screen/OrderSheet";
import CheckDuplicate from "./screen/CheckReturnRate";
import CheckReturnProduct from "./screen/CheckReturnProduct.jsx";
import StatisticProduct from "./screen/StatisticProduct";
import CheckDuplicatePhone from "./screen/CheckDuplicatePhone";
import CheckAdsResult from "./screen/CheckAdsResult.jsx";

function App() {
  const [activetab, setActivetab] = useState(1);
  const onChange = (key) => {
    setActivetab(key);
  };

  const items = [
    {
      key: 1,
      label: "Báo cáo",
    },
    {
      key: 2,
      label: "Lên đơn Abit",
    },
    {
      key: 3,
      label: "Lên đơn Sheet",
    },
    {
      key: 4,
      label: "Cop đơn",
    },
    {
      key: 5,
      label: "Check tỷ lệ hoàn",
    },
    {
      key: 6,
      label: "Check hàng hoàn",
    },
    {
      key: 7,
      label: "Thống kê sản phẩm",
    },
    {
      key: 8,
      label: "Check trùng số điện thoại",
    },
    {
      key: 9,
      label: "Kết quả chạy ADS",
    },
  ];

  // useEffect(() => {
  //   connectDB();
  // });

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            /* here is your component tokens */
            rowHoverBg: "#F1EFEF",
          },
        },
      }}
    >
      <div className="px-5">
        <Tabs defaultActiveKey={activetab} items={items} onChange={onChange} />
        <div className="">
          {activetab == 1 && <Statistic />}
          {activetab == 2 && <Order />}
          {activetab == 3 && <OrderSheet />}
          {activetab == 4 && <ExportOrder />}
          {activetab == 5 && <CheckDuplicate />}
          {activetab == 6 && <CheckReturnProduct />}
          {activetab == 7 && <StatisticProduct />}
          {activetab == 8 && <CheckDuplicatePhone />}
          {activetab == 9 && <CheckAdsResult />}
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
