/*
 * @description
 * @since         Saturday, 6 8th 2024, 21:28:34 pm
 * @author        Bình Lê <binhlv@getflycrm.com>
 * @copyright     Copyright (c) 2024, Getfly VN TECH.,JSC, Inc.
 * -----
 * Change Log: <press Ctrl + alt + c write changelog>
 */
import React from "react";
import * as xlsx from "xlsx";
import { useEffect, useState } from "react";
import TableExport from "../components/Table";
import _ from "lodash";
import { Button, Checkbox, Input, InputNumber, Select, Tooltip, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const CheckReturnProduct = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const [data, setData] = useState([]);
  const [statisticData, setStatisticData] = useState([]);
  const [filter, setFilter] = useState({ state: 0 });
  const selectOption = [
    { value: 1, label: "Khớp" },
    { value: 2, label: "Không khớp" },
    { value: null, label: "Không có hàng" },
  ];
  const selectOptionFilter = [
    { value: 0, label: "Tất cả" },
    { value: 1, label: "Khớp" },
    { value: 2, label: "Không khớp" },
    { value: null, label: "Không có hàng" },
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
  const exportExcel = () => {
    const newData = _.cloneDeep(statisticData);

    const dataExport = newData.map((v) => {
      return {
        "Mã ĐH": v.p_code,
        "Đơn giao 1 phần": v.delivery,
        "Thông tin khách hàng": v.customer,
        "Thông tin sản phẩm": v.product,
        "Tiền CoD": v.cod,
        "Số lượng": v.amount,
        "Hàng trả về": v.return_p,
        Khớp: v.amount_check == 1 ? "Khớp" : v.amount_check == 2 ? "Không khớp" : "Không có hàng",
        "Ghi chú": v.description,
      };
    });

    const workbook = xlsx.utils.book_new();

    // Tạo một worksheet từ mảng dữ liệu
    const worksheet = xlsx.utils.json_to_sheet(dataExport);

    // Thêm worksheet vào workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, "Data");

    // Lưu workbook thành tệp Excel
    xlsx.writeFile(workbook, "Xuất đơn.xlsx");
  };

  useEffect(() => {
    if (data?.length) {
      const new_data = _.cloneDeep(data);

      setStatisticData(
        new_data
          .map((v) => {
            const codeArr = v["Mã ĐH"].split(".");
            const amount = v["Thông tin sản phẩm"].match(/Tên SP: (\d+)/)[1];
            return {
              p_code: codeArr[codeArr.length - 1],
              customer: v["Thông tin khách hàng"].slice(0, 70) + "...",
              product: v["Thông tin sản phẩm"],
              delivery: v["Đơn giao 1 phần"],
              cod: v["Tiền CoD"],
              amount: +amount,
              return_p: 0,
              amount_check: 2,
              description: "",
            };
          })
          .sort((a, b) => {
            if (a.delivery === "Đơn giao một phần" && b.delivery !== "Đơn giao một phần") {
              return -1;
            } else if (a.cod <= 30000 && b.cod > 30000) {
              return 1;
            } else if (a.cod > 30000 && b.cod <= 30000) {
              return -1;
            } else {
              return 0;
            }
          })
      );
    }
  }, [data]);

  const columns = [
    {
      title: "Mã Sản Phẩm",
      dataIndex: "p_code",
      key: "p_code",
      width: 100,
    },
    {
      title: "Đơn giao 1 phần",
      dataIndex: "delivery",
      key: "delivery",
      width: 150,
      render: (v, { cod }) => {
        return <div className={`${cod > 30000 && v === "Đơn giao một phần" && "bg-yellow-200"}`}>{v}</div>;
      },
    },
    {
      title: "Thông tin khách hàng",
      dataIndex: "customer",
      key: "customer",
      width: 200,
    },
    {
      title: "Thông tin sản phẩm",
      dataIndex: "product",
      key: "product",
      width: 150,
    },
    {
      title: "Tiền COD",
      dataIndex: "cod",
      key: "cod",
      width: 100,
    },
    {
      title: "Số lượng",
      dataIndex: "amount",
      key: "amount",
      width: 70,
    },
    {
      title: "Hàng trả về",
      dataIndex: "return_p",
      key: "return_p",
      width: 100,
      render: (v, data) => {
        return (
          <InputNumber
            value={v}
            onChange={(e) => {
              setStatisticData(
                statisticData?.map((i) => {
                  if (i?.p_code == data?.p_code) {
                    return { ...i, return_p: e, amount_check: e == i?.amount ? 1 : 2 };
                  } else return i;
                })
              );
            }}
          />
        );
      },
    },
    {
      title: "Khớp số lượng",
      dataIndex: "amount_check",
      key: "amount_check",
      width: 150,
      render: (v, data) => {
        return (
          <Select
            value={v}
            style={{
              width: 150,
            }}
            defaultValue={2}
            onChange={(e) => {
              setStatisticData(
                statisticData?.map((i) => {
                  if (i?.p_code == data?.p_code) {
                    return { ...i, amount_check: e };
                  } else return i;
                })
              );
            }}
            options={selectOption}
          />
        );
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "description",
      key: "description",
      width: 250,
      render: (v, data) => {
        return (
          <TextArea
            rows={2}
            placeholder="Ghi chú"
            value={v}
            onChange={(e) => {
              setStatisticData(
                statisticData?.map((i) => {
                  if (i?.p_code == data?.p_code) {
                    return { ...i, description: e.target.value };
                  } else return i;
                })
              );
            }}
          />
        );
      },
    },
  ];

  return (
    <div className="">
      {contextHolder}
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
        <div className="flex items-center justify-between">
          <div className="">
            <p className="mb-2 text-left">Tình trạng:</p>
            <Select
              value={filter.state}
              style={{
                width: 250,
              }}
              onChange={(e) => {
                setFilter({ ...filter, state: e });
              }}
              options={selectOptionFilter}
            />
          </div>
          <Tooltip placement="top" title={"Xuất file excel"}>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              size={"middle"}
              onClick={() => {
                exportExcel();
              }}
            />
          </Tooltip>
        </div>

        <div className="flex justify-between gap-10">
          <div className=" mt-2 w-full">
            <TableExport
              data={statisticData.filter((item) => {
                if (filter.state === 0) {
                  return true;
                } else if (filter.state === 1) {
                  return item.amount_check === 1;
                } else if (filter.state === 2) {
                  return item.amount_check === 2;
                }
                return false; // Nếu state không phải là 0, 1, hoặc 2, trả về false
              })}
              columns={columns}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckReturnProduct;
