/*
 * @description
 * @since         Tuesday, 7 30th 2024, 21:13:03 pm
 * @author        Bình Lê <binhlv@getflycrm.com>
 * @copyright     Copyright (c) 2024, Getfly VN TECH.,JSC, Inc.
 * -----
 * Change Log: <press Ctrl + alt + c write changelog>
 */
import React, { useEffect, useState } from "react";
import * as xlsx from "xlsx";
import _ from "lodash";
import { Button, Popconfirm, Select, Tooltip, message } from "antd";
import { db } from "../ultil/configFireBase";
import { getDatabase, ref, child, get, set, push } from "firebase/database";
import { DownloadOutlined } from "@ant-design/icons";
import TableExport from "../components/Table";
import { copyToClipboard } from "../ultil";

const CheckDuplicatePhone = () => {
  const [data, setData] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [listData, setListData] = useState([]);
  const [dataAbit, setDataAbit] = useState([]);
  const dbRef = ref(getDatabase());
  const columns = [
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Tên khách hàng",
      dataIndex: "account_name",
      key: "account_name",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => {
        return (
          <p
            className="cursor-pointer hover:text-blue-500"
            onClick={() => {
              copyToClipboard(phone, () => {
                messageApi.success("Đã copy");
              });
            }}
          >
            {phone}
          </p>
        );
      },
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Thông tin đơn hàng",
      dataIndex: "product_detail",
      key: "product_detail",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Đơn giá",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Người phụ trách",
      dataIndex: "person_in_charge",
      key: "person_in_charge",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Ngày đặt hàng",
      dataIndex: "order_date",
      key: "order_date",
    },
  ];

  const handleFileUploadDatabase = (e) => {
    e.preventDefault();
    if (e.target.files) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = xlsx.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = xlsx.utils.sheet_to_json(worksheet);
        setData(json.map((i) => ({ ...i, id: _.uniqueId() })));
      };
      reader.readAsArrayBuffer(e.target.files[0]);
    }
  };

  const handleFileUploadAbit = (e) => {
    e.preventDefault();
    if (e.target.files) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = xlsx.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = xlsx.utils.sheet_to_json(worksheet);
        const uniquePhone = _.uniq(
          _.map(json, (customer) => {
            let phone = customer["Điện thoại khách"];

            // Nếu là chuỗi và bắt đầu bằng '0', cắt bỏ số 0 đầu
            if (typeof phone === "string" && phone.startsWith("0")) {
              phone = phone.slice(1);
            }

            // Chuyển về dạng số
            return Number(phone);
          })
        );
        setDataAbit(uniquePhone);
        setData(_.filter(listData, (obj) => _.includes(uniquePhone, obj.phone)));
      };
      reader.readAsArrayBuffer(e.target.files[0]);
    }
  };

  useEffect(() => {
    get(child(dbRef, `orders`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          Object.values(snapshot.val()).map((order) => {
            setListData((prev) => [...order]);
          });
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleAddData = () => {
    const postListRef = ref(db, "orders");
    const newPostRef = push(postListRef);
    set(newPostRef, data);
    message.success("Upload thành công");
  };

  return (
    <div className="">
      {contextHolder}
      <div>
        <div className="flex items-center gap-40">
          <div>
            <p className="mb-3 text-xl">Upload cơ sở dữ liệu</p>
            <div className="flex items-center gap-3">
              <div className="w-96 mb-3">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  htmlFor="file_input"
                ></label>
                <input
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  id="file_input"
                  type="file"
                  onChange={(e) => handleFileUploadDatabase(e)}
                />
              </div>
              <Popconfirm
                title="Upload lên clds"
                description="Bạn có muốn upload file lên cơ sở dữ liệu không?"
                onConfirm={() => {
                  handleAddData();
                }}
                onCancel={() => {
                  message.error("Đã hủy upload");
                }}
                okText="Có"
                cancelText="Không"
              >
                <Tooltip placement="top" title={"Upload dữ liệu lên firebase"}>
                  <Button type="default" icon={<DownloadOutlined />} size={"middle"} />
                </Tooltip>
              </Popconfirm>
            </div>
          </div>
          <div>
            <p className="mb-3 text-xl">Upload đơn đối chiếu</p>
            <div className="flex items-center gap-3">
              <div className="w-96 mb-3">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  htmlFor="file_input"
                ></label>
                <input
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  id="file_input"
                  type="file"
                  onChange={(e) => handleFileUploadAbit(e)}
                />
              </div>
              {/* <Popconfirm
                title="Upload lên clds"
                description="Bạn có muốn upload file lên cơ sở dữ liệu không?"
                onConfirm={() => {
                  handleAddData();
                }}
                onCancel={() => {
                  message.error("Đã hủy upload");
                }}
                okText="Có"
                cancelText="Không"
              >
                <Tooltip placement="top" title={"Upload dữ liệu lên firebase"}>
                  <Button type="default" icon={<DownloadOutlined />} size={"middle"} />
                </Tooltip>
              </Popconfirm> */}
            </div>
          </div>
        </div>

        <div className=" overflow-auto mt-3">
          <TableExport data={data} columns={columns} pagination />
        </div>
      </div>
    </div>
  );
};

export default CheckDuplicatePhone;
