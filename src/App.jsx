import "./App.css";
import React, { useState } from "react";
import { Tabs, ConfigProvider } from "antd";
import Order from "./screen/Order";
import Statistic from "./screen/Statistic";
import ExportOrder from "./screen/ExportOrder";
import OrderSheet from "./screen/OrderSheet";
import CheckDuplicate from "./screen/CheckReturnRate";

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
  ];

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
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;