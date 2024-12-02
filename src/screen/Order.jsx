/*
 * @description
 * @since         Sunday, 12 10th 2023, 20:30:29 pm
 * @author        Bình Lê <binhlv@getflycrm.com>
 * @copyright     Copyright (c) 2023, Getfly VN TECH.,JSC, Inc.
 * -----
 * Change Log: <press Ctrl + alt + c write changelog>
 */
import React from "react";
import * as xlsx from "xlsx";
import { useEffect, useState } from "react";
import TableExport from "../components/Table";
import _ from "lodash";
import { Button, Checkbox, Input, Select, Tooltip, message } from "antd";
import {
  copyToClipboard,
  formatCurrency,
  getNumberAfterDash,
  getNumberInParentheses,
  getStringAfterDash,
  getSubstringAfterFirstLetter,
  getTotal,
} from "../ultil";
import "./order.css";

const Order = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const [data, setData] = useState([]);
  const [statisticData, setStatisticData] = useState({ check: false, data: [], uniq_p: [], clone_data: [] });
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

  useEffect(() => {
    if (data?.length) {
      const newJson = data.map((v) => ({
        ...v,
        ["Sản phẩm"]: `${v["Sản phẩm"]} ${v["Ghi chú"] || ""}`,
        "Sản phẩm không ghi chú": `${v["Sản phẩm"]} ${v["Ghi chú"] || ""}`,
      }));
      const uniqueP = [
        { label: "Tất cả", value: "" },
        ..._.uniqBy(
          _.uniqBy(data, "Sản phẩm").map((v) => {
            return { key: _.uniqueId(), product_name: getSubstringAfterFirstLetter(v["Sản phẩm"]) };
          }),
          "product_name"
        ).map((v) => ({ value: v.product_name, label: v.product_name })),
      ];

      const sData = _.uniqBy(
        _.uniqBy(newJson, "Sản phẩm").map((v) => {
          return {
            key: _.uniqueId(),
            product_name: v["Sản phẩm"],
            short_product_name: getSubstringAfterFirstLetter(v["Sản phẩm"]),
            note: v["Ghi chú"],
            s_name: getStringAfterDash(v["Sản phẩm"]),
            origin_p_name: v["Sản phẩm không ghi chú"],
          };
        }),
        "product_name"
      ).sort((a, b) => {
        const nameA = a.short_product_name.toLowerCase();
        const nameB = b.short_product_name.toLowerCase();

        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
      const newStatisticData = sData.map((s, index) => {
        const totalOrder = newJson.reduce((prev, curr) => {
          if (curr["Sản phẩm"] == s.product_name) {
            return prev + 1;
          } else return prev + 0;
        }, 0);

        const totalAmount = newJson.reduce((prev, curr) => {
          if (curr["Sản phẩm"] == s.product_name) {
            return prev + getNumberAfterDash(curr["Sản phẩm"]);
          } else return prev + 0;
        }, 0);

        const getPhoneOfErrorRow = () => {
          const phones = [];
          newJson.forEach((r) => {
            const number = getNumberInParentheses(r["Mã hàng"]);
            if (number != 1 && r["Sản phẩm không ghi chú"] == s.origin_p_name) {
              phones.push(r["Điện thoại khách"]);
            }
          });
          return phones;
        };

        const getDuplicatePhone = () => {
          const listP = newJson.filter((p) => p["Sản phẩm"] == s.product_name);
          const phones = _.map(listP, "Điện thoại khách");

          // Đếm tần suất xuất hiện của mỗi số điện thoại
          const phoneCounts = _.countBy(phones);

          // Lọc ra các số điện thoại bị trùng (tần suất xuất hiện > 1)
          const duplicatePhones = _.keys(_.pickBy(phoneCounts, (count) => count > 1));
          return duplicatePhones;
        };

        return {
          index,
          product_name: s.product_name,
          s_name: s.s_name,
          order: totalOrder,
          amount: totalAmount,
          checked: false,
          error: getPhoneOfErrorRow(),
          duplicatePhones: getDuplicatePhone(),
        };
      });
      console.log(newStatisticData);

      setStatisticData({ check: false, data: newStatisticData, uniq_p: uniqueP, clone_data: newStatisticData });
    }
  }, [data]);
  const columns = [
    {
      title: (
        <div className="flex items-center justify-between">
          <p>Tên Sản Phẩm</p>
          <Select
            style={{
              width: 150,
            }}
            value={filter.product_name}
            onChange={(e) => {
              const new_data = _.cloneDeep(statisticData.clone_data);
              setStatisticData({
                ...statisticData,
                check: false,
                data: new_data.filter((v) => v.product_name.includes(e)),
              });
              setFilter((prev) => ({ ...prev, product_name: e }));
            }}
            options={statisticData.uniq_p}
          />
        </div>
      ),
      dataIndex: "s_name",
      key: "s_name",
    },
    {
      title: (
        <p
          className="hover:text-blue-500 p-1 cursor-pointer"
          onClick={() => {
            copyToClipboard(getTotal(statisticData.data, "order"), () => {
              messageApi.success("Đã copy");
            });
          }}
        >
          {`SỐ ĐƠN (${getTotal(statisticData.data, "order")})`}
        </p>
      ),
      dataIndex: "order",
      key: "order",
      width: 150,
      render: (_, { order }) => {
        return <p>{order}</p>;
      },
    },
    {
      title: (
        <div className="flex items-center justify-between">
          <p
            className="hover:text-blue-500 p-1 cursor-pointer"
            onClick={() => {
              copyToClipboard(getTotal(statisticData.data, "amount"), () => {
                messageApi.success("Đã copy");
              });
            }}
          >{`SỐ Lượng (${getTotal(statisticData.data, "amount")})`}</p>
          <Checkbox
            className="mr-2"
            checked={statisticData.check}
            onChange={(e) => {
              statisticData.data = statisticData.data.map((v) => ({ ...v, checked: e.target.checked }));
              setStatisticData({ ...statisticData });
            }}
          ></Checkbox>
        </div>
      ),
      dataIndex: "amount",
      key: "amount",
      width: 150,
      render: (_, { amount, index, checked }) => {
        return (
          <div className="flex gap-3 justify-between">
            <p>{amount}</p>
            <Checkbox
              className="mr-2"
              checked={checked}
              onChange={(e) => {
                statisticData.data[index].checked = e.target.checked;
                setStatisticData({ ...statisticData });
              }}
            ></Checkbox>
          </div>
        );
      },
    },
    {
      title: "Dòng bị lỗi",
      dataIndex: "error",
      key: "error",
      width: 150,
      render: (_, { error }) => {
        return (
          <div>
            {error.map((v) => (
              <p
                className="hover:text-blue-500 p-1 cursor-pointer"
                onClick={() => {
                  copyToClipboard(v, () => {
                    messageApi.success("Đã copy");
                  });
                }}
                key={v}
              >
                {v}
              </p>
            ))}
          </div>
        );
      },
    },
    {
      title: "Sđt trùng",
      dataIndex: "duplicatePhones",
      key: "duplicatePhones",
      width: 150,
      render: (_, { duplicatePhones }) => {
        return (
          <div>
            {duplicatePhones.map((v) => (
              <p
                className="hover:text-blue-500 p-1 cursor-pointer"
                onClick={() => {
                  copyToClipboard(v, () => {
                    messageApi.success("Đã copy");
                  });
                }}
                key={v}
              >
                {v}
              </p>
            ))}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    if (statisticData.data.length > 0) {
      const arrayNotCheck = statisticData.data.filter((v) => !v?.checked);
      setStatisticData({ ...statisticData, check: arrayNotCheck?.length == 0 ? true : false });
    }
  }, [JSON.stringify(statisticData.data)]);

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

        <div className="flex justify-between gap-10">
          <div className=" mt-2 w-[650px]">
            <TableExport data={statisticData.data} columns={columns} />
          </div>
          <div className="w-96">
            <p
              className="text-4xl hover:text-blue-500 p-1 cursor-pointer"
              onClick={() => {
                copyToClipboard(
                  statisticData.data.reduce((prev, curr) => {
                    if (curr.checked) {
                      return prev + curr.amount;
                    } else return prev + 0;
                  }, 0),
                  () => {
                    messageApi.success("Đã copy");
                  }
                );
              }}
            >
              Tổng :{" "}
              {statisticData.data.reduce((prev, curr) => {
                if (curr.checked) {
                  return prev + curr.amount;
                } else return prev + 0;
              }, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
