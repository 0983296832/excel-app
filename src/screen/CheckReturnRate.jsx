/*
 * @description
 * @since         Wednesday, 12 13th 2023, 19:55:48 pm
 * @author        Bình Lê <binhlv@getflycrm.com>
 * @copyright     Copyright (c) 2023, Getfly VN TECH.,JSC, Inc.
 * -----
 * Change Log: <press Ctrl + alt + c write changelog>
 */
import React, { useEffect, useState } from "react";
import * as xlsx from "xlsx";
import { getMinAndMaxDates, getSubstringAfterFirstLetter } from "../ultil";
import _ from "lodash";
import TableExport from "../components/Table";
import { Tabs } from "antd";

const CheckReturnRate = () => {
  const [data, setData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [statData, setStatData] = useState([]);
  const [total, setTotal] = useState({ order_fake: 0, total: 0, delivering: 0, undeliver: 0, date: "" });

  const [activetab, setActivetab] = useState(1);
  const [search, setSearch] = useState("");
  const onChange = (key) => {
    setActivetab(key);
  };

  const items = [
    {
      key: 1,
      label: "Danh sách",
    },
    {
      key: 2,
      label: "Thống kê",
    },
  ];

  const handleFileUpload = (e) => {
    e.preventDefault();
    if (e.target.files) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = xlsx.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = xlsx.utils.sheet_to_json(worksheet);
        setData(json);
      };
      reader.readAsArrayBuffer(e.target.files[0]);
    }
  };

  useEffect(() => {
    if (data?.length) {
      const new_data = _.cloneDeep(data);
      setProductData(
        new_data
          .map((v) => {
            return {
              p_code: v["Mã ĐH"],
              a_info: v["Thông tin khách hàng"],
              p_info: v["Thông tin sản phẩm"],
              cod: v["Trạng thái đơn hàng"] == "Đã đối soát công nợ trả hàng" ? 0 : v["Tiền CoD"],
              state: v["Trạng thái đơn hàng"],
              date: v["Thời gian tạo đơn"],
              phone: v["Số điện thoại khách hàng"],
              send_part: v["Đơn giao 1 phần"],
              fill_color:
                (v["Đơn giao 1 phần"] && v["Tiền CoD"] <= 30000) ||
                v["Trạng thái đơn hàng"] == "Đã đối soát công nợ trả hàng"
                  ? true
                  : false,
            };
          })
          .filter(
            (v) =>
              ![
                "Không giao được hàng",
                "Delay giao hàng",
                "Đã điều phối giao hàng/Đang giao hàng",
                "Đã lấy hàng/Đã nhập kho",
              ].includes(v["state"])
          )
          .sort((a, b) => a.cod - b.cod)
          .sort((a, b) => (a.fill_color === b.fill_color ? 0 : a.fill_color ? -1 : 1))
      );

      const new_stat_data = new_data.map((v) => ({
        p_name: v["Tên sản phẩm"],
        is_return:
          (v["Đơn giao 1 phần"] && v["Tiền CoD"] <= 30000) ||
          v["Trạng thái đơn hàng"] == "Đã đối soát công nợ trả hàng" ||
          (v["Trạng thái đơn hàng"] == "Đã đối soát" && v["Tiền CoD"] <= 30000 && v["Tiền CoD"] != 10000)
            ? true
            : false,
        status: v["Trạng thái đơn hàng"],
      }));
      console.log(new_stat_data);
      setStatData(
        new_stat_data
          .filter((v) => v.p_name)
          .reduce((prev, curr) => {
            const existPIdx = prev.findIndex((p) => p?.p_name == curr?.p_name);
            if (existPIdx > -1) {
              prev[existPIdx] = {
                p_name: curr.p_name || "hàng gửi nhờ",
                quantity: 1 + prev[existPIdx].quantity,
                return: curr.is_return ? prev[existPIdx].return + 1 : prev[existPIdx].return + 0,
                undeliver:
                  curr.status == "Không giao được hàng" ? prev[existPIdx].undeliver + 1 : prev[existPIdx].undeliver + 0,
                delivering: [
                  "Delay giao hàng",
                  "Đã điều phối giao hàng/Đang giao hàng",
                  "Đã lấy hàng/Đã nhập kho",
                ].includes(curr.status)
                  ? prev[existPIdx].delivering + 1
                  : prev[existPIdx].delivering + 0,
              };
            } else {
              prev.push({
                p_name: curr.p_name,
                quantity: 1,
                return: curr.is_return ? 1 : 0,
                undeliver: curr.status == "Không giao được hàng" ? 1 : 0,
                delivering: [
                  "Delay giao hàng",
                  "Đã điều phối giao hàng/Đang giao hàng",
                  "Đã lấy hàng/Đã nhập kho",
                ].includes(curr.status)
                  ? 1
                  : 0,
              });
            }
            return prev;
          }, [])
          .map((v) => ({ ...v, rate: ((v.return / v.quantity) * 100).toFixed(2) + "%" }))
      );

      const undeliver = new_data.filter((v) => ["Không giao được hàng"].includes(v["Trạng thái đơn hàng"])).length;
      const delivering = new_data.filter((v) =>
        ["Delay giao hàng", "Đã điều phối giao hàng/Đang giao hàng", "Đã lấy hàng/Đã nhập kho"].includes(
          v["Trạng thái đơn hàng"]
        )
      ).length;
      setTotal({
        order_fake: new_data.reduce((prev, curr) => {
          return prev + (curr["Tên sản phẩm"] ? 0 : 1);
        }, 0),
        total: new_data.length,
        undeliver: undeliver,
        delivering: delivering,
        date: `${getMinAndMaxDates(new_data?.map((v) => v["Thời gian tạo đơn"]))?.minDate} - ${
          getMinAndMaxDates(new_data?.map((v) => v["Thời gian tạo đơn"])).maxDate
        }`,
      });
    }
  }, [data?.length]);

  const columns = [
    {
      title: "Mã ĐH",
      dataIndex: "p_code",
      key: "p_code",
    },
    {
      title: "Thông tin khách hàng",
      dataIndex: "a_info",
      key: "a_info",
      width: 200,
    },
    {
      title: "Thông tin sản phẩm",
      dataIndex: "p_info",
      key: "p_info",
    },
    {
      title: "Đơn giao 1 phần",
      dataIndex: "send_part",
      key: "send_part",
    },
    {
      title: "Tiền CoD",
      dataIndex: "cod",
      key: "cod",
      width: 100,
      render: (_, { cod, send_part, state, fill_color }) => {
        return (
          <div className={`w-full h-full ${fill_color && "bg-yellow-400"}`}>
            {state == "Đã đối soát công nợ trả hàng" ? 0 : cod}
          </div>
        );
      },
    },
    {
      title: "Trạng thái đơn hàng",
      dataIndex: "state",
      key: "state",
    },
    {
      title: "Thời gian tạo đơn",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Số điện thoại khách hàng",
      dataIndex: "phone",
      key: "phone",
    },
  ];

  const columns1 = [
    {
      title: <p className="text-lg">Sản phẩm</p>,
      dataIndex: "p_name",
      key: "p_name",
      render: (value) => <p className="text-base">{value}</p>,
    },
    {
      title: <p className="text-lg">Tổng</p>,
      dataIndex: "quantity",
      key: "quantity",
      render: (value) => <p className="text-base">{value}</p>,
    },
    {
      title: <p className="text-lg">Hoàn</p>,
      dataIndex: "return",
      key: "return",
      render: (value) => <p className="text-base">{value}</p>,
    },
    {
      title: <p className="text-lg">Tỷ lệ</p>,
      dataIndex: "rate",
      key: "rate",
      render: (value) => <p className="text-base">{value}</p>,
    },
    {
      title: <p className="text-lg">Không giao đc hàng</p>,
      dataIndex: "undeliver",
      key: "undeliver",
      render: (value) => <p className="text-base">{value}</p>,
    },
    {
      title: <p className="text-lg">Đang giao hàng</p>,
      dataIndex: "delivering",
      key: "delivering",
      render: (value) => <p className="text-base">{value}</p>,
    },
  ];

  return (
    <div>
      <div className="w-96 mb-3">
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="file_input"></label>
        <input
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          id="file_input"
          type="file"
          onChange={(e) => handleFileUpload(e)}
        />
      </div>
      <Tabs defaultActiveKey={activetab} items={items} onChange={onChange} />
      {activetab == 1 && (
        <div>
          <div className="my-3 w-96">
            <p className="mb-2">Tìm tên:</p>
            <input
              type="text"
              id="first_name"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1 "
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            ></input>
          </div>
          <div>
            <TableExport
              data={productData.filter((v) => String(v.p_info).toLowerCase().includes(search.toLowerCase()))}
              columns={columns}
              pagination={{
                pageSizeOptions: ["200", "400", "600", "800", "1000"],
              }}
            />
          </div>
        </div>
      )}
      {activetab == 2 && (
        <div className="flex p-6 justify-between w-full">
          <div className="w-[800px]">
            <TableExport data={statData} columns={columns1} />
          </div>

          <div>
            <p className="text-2xl">Tổng: {total.total}</p>
            <p className="text-2xl">Đơn gửi nhờ: {total.order_fake}</p>
            <p className="text-2xl">Không giao đc hàng: {total.undeliver}</p>
            <p className="text-2xl">Đang giao hàng: {total.delivering}</p>
            <p className="text-2xl">Tính từ ngày: {total.date}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckReturnRate;
