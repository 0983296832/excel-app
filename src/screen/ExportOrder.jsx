/*
 * @description
 * @since         Monday, 12 11th 2023, 20:27:41 pm
 * @author        Bình Lê <binhlv@getflycrm.com>
 * @copyright     Copyright (c) 2023, Getfly VN TECH.,JSC, Inc.
 * -----
 * Change Log: <press Ctrl + alt + c write changelog>
 */
import * as xlsx from "xlsx";
import { useEffect, useState } from "react";
import TableExport from "../components/Table";
import { getCurrentTime, getDate, getNumberAfterDash, getSubstringAfterFirstLetter } from "../ultil";
import { Button,Select, Tooltip } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import _ from "lodash";

const ExportOrder = () => {
  const styles = xlsx.utils.styles;
  const [data, setData] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [uniqProduct, setUniqProduct] = useState([]);
  const [filter, setFilter] = useState({ product_name: "" });

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
  const exportExcel = (type) => {
    const { day, month, hours } = getCurrentTime();
    const newData = _.cloneDeep(data);

    const dataExport = newData
      .map((v) => {
        const phone = v["Điện thoại khách"];
        if (type == 0) {
          return {
            date: `ĐÃ LÊN ĐƠN ${day}/${month} ${hours < 20 ? "C" : "T"}`,
            "TÊN KHÁCH": v["Khách hàng"],
            SĐT: phone.slice(1),
            "ĐỊA CHỈ": v["Địa chỉ giao hàng"],
            "SẢN PHẨM": v["Mã hàng"],
            SL: getNumberAfterDash(v["Sản phẩm"]),
            "GIÁ TIỀN": v["Tổng tiền"],
            "MÃ NV": v["Đơn hàng của"],
            "MÃ SP": getSubstringAfterFirstLetter(v["Sản phẩm"]),
            "XÁC NHẬN": "ok",
            "Đơn theo ngày": getDate(v["Ngày tạo đơn hàng"]),
          };
        } else {
          return {
            date: `ĐÃ LÊN ĐƠN ${day}/${month} ${hours < 20 ? "C" : "T"}`,
            "TÊN KHÁCH": v["Khách hàng"],
            SĐT: phone.slice(1),
            "ĐỊA CHỈ": v["Địa chỉ giao hàng"],
            "SẢN PHẨM": v["Mã hàng"],
            SL: getNumberAfterDash(v["Sản phẩm"]),
            "GIÁ TIỀN": v["Tổng tiền"],
            Empty: "",
            "MÃ NV": v["Đơn hàng của"],
            "MÃ SP": getSubstringAfterFirstLetter(v["Sản phẩm"]),
            "XÁC NHẬN": "ok",
            "Đơn theo ngày": getDate(v["Ngày tạo đơn hàng"]),
          };
        }
      })
      .sort((a, b) => {
        const nameA = a?.["MÃ SP"]?.toLowerCase();
        const nameB = b?.["MÃ SP"]?.toLowerCase();

        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });

    const workbook = xlsx.utils.book_new();

    // Tạo một worksheet từ mảng dữ liệu
    const worksheet = xlsx.utils.json_to_sheet(dataExport, { skipHeader: true });

    // Lặp qua dữ liệu và thiết lập kiểu dáng cho ô có giá trị
    dataExport.forEach((row, rowIndex) => {
      Object.keys(row).forEach((key, colIndex) => {
        const cellAddress = { c: colIndex, r: rowIndex }; // rowIndex + 1 để bỏ qua dòng header
        const cell = xlsx.utils.encode_cell(cellAddress);

        if (row[key] !== null && row[key] !== undefined) {
          worksheet[cell].s = {
            fill: { fgColor: { rgb: "00FF00" } },
          };
        }
      });
    });

    // Thêm worksheet vào workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, "Data");

    // Lưu workbook thành tệp Excel
    xlsx.writeFile(workbook, "Xuất đơn.xlsx");
  };

  useEffect(() => {
    if (data?.length > 0) {
      const uniqueP = [
        { label: "Tất cả", value: "" },
        ..._.uniqBy(
          _.uniqBy(data, "Sản phẩm").map((v) => {
            return { key: _.uniqueId(), product_name: getSubstringAfterFirstLetter(v["Sản phẩm"]) };
          }),
          "product_name"
        ).map((v) => ({ value: v.product_name, label: v.product_name })),
      ];
      setUniqProduct(uniqueP);

      setOrderData(
        data
          .map((v) => {
            return {
              name: v["Khách hàng"],
              phone: v["Điện thoại khách"],
              address: v["Địa chỉ giao hàng"],
              product: v["Mã hàng"],
              amount: getNumberAfterDash(v["Sản phẩm"]),
              price: v["Tổng tiền"],
              employee_code: v["Đơn hàng của"],
              product_code: getSubstringAfterFirstLetter(v["Sản phẩm"]),
              confirm: "ok",
              order_date: getDate(v["Ngày tạo đơn hàng"]),
            };
          })
          .sort((a, b) => {
            const nameA = a?.product_code?.toLowerCase();
            const nameB = b?.product_code?.toLowerCase();

            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
            return 0;
          })
      );
    }
  }, [data?.length]);

  const columns = [
    {
      title: "Tên khách",
      dataIndex: "name",
      key: "name",
    },
    {
      title: `Sđt`,
      dataIndex: "phone",
      key: "phone",
      width: 150,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      width: 150,
    },
    {
      title: "Sản phẩm",
      dataIndex: "product",
      key: "product",
      width: 150,
    },
    {
      title: "Sl",
      dataIndex: "amount",
      key: "amount",
      width: 50,
    },
    {
      title: "Giá tiền",
      dataIndex: "price",
      key: "price",
      width: 150,
    },
    {
      title: "Mã nv",
      dataIndex: "employee_code",
      key: "employee_code",
      width: 150,
    },
    {
      title: "Mã sản phẩm",
      dataIndex: "product_code",
      key: "product_code",
      width: 150,
    },
    {
      title: "Xác nhận",
      dataIndex: "confirm",
      key: "confirm",
      width: 70,
    },
    {
      title: "Đơn theo ngày",
      dataIndex: "order_date",
      key: "order_date",
      width: 150,
    },
  ];

  return (
    <div className="">
      <div className="flex items-center justify-between mr-24">
        <div className="w-96 mb-3">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="file_input"></label>
          <input
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            id="file_input"
            type="file"
            onChange={(e) => handleFileUpload(e)}
          />
        </div>
        <div>
          <Select
            style={{
              width: 150,
            }}
            value={filter.product_name}
            onChange={(e) => {
              setFilter((prev) => ({ ...prev, product_name: e }));
            }}
            options={uniqProduct}
          />
        </div>
        <Tooltip placement="top" title={"Xuất file excel không tách cột"}>
          <Button
            type="default"
            icon={<DownloadOutlined />}
            size={"middle"}
            onClick={() => {
              exportExcel(0);
            }}
          />
        </Tooltip>
        <Tooltip placement="top" title={"Xuất file excel có tách cột"}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            size={"middle"}
            onClick={() => {
              exportExcel(1);
            }}
          />
        </Tooltip>
      </div>

      <div>
        <TableExport
          data={orderData.filter((v) => v?.product_code?.includes(filter?.product_name))}
          columns={columns}
        />
      </div>
    </div>
  );
};

export default ExportOrder;
