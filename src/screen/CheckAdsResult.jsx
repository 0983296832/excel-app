/*
 * @description
 * @since         Monday, 12 2nd 2024, 20:22:30 pm
 * @author        Bình Lê <binhlv@getflycrm.com>
 * @copyright     Copyright (c) 2024, Getfly VN TECH.,JSC, Inc.
 * -----
 * Change Log: <press Ctrl + alt + c write changelog>
 */
import React from "react";
import * as xlsx from "xlsx";
import { useEffect, useState } from "react";
import TableExport from "../components/Table";
import _, { result } from "lodash";
import { Button, Checkbox, Input, InputNumber, Select, Table, Tooltip, message } from "antd";
import { CopyOutlined, DownloadOutlined } from "@ant-design/icons";
import { copyToClipboard } from "../ultil";

const CheckAdsResult = () => {
  const [data, setData] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [listData, setListData] = useState([]);
  const [filter, setFilter] = useState({ state: 0 });
  const [statisticData, setStatisticData] = useState([]);
  const [summary, setSummary] = useState({
    cost: 0,
    value_CF: 0,
    value_no_CF: 0,
  });

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

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: 100,
    },
    {
      title: "Camp",
      dataIndex: "camp",
      key: "camp",
      width: 100,
    },
    {
      title: "Chi phí",
      dataIndex: "cost",
      key: "cost",
      width: 100,
      render: (v, data) => {
        return (
          <InputNumber
            value={v}
            onChange={(e) => {
              setStatisticData((prev) => {
                return prev?.map((i) => {
                  if (i?.camp == data?.camp) {
                    return {
                      ...i,
                      result_order_number_CF: (e / data?.order_number_CF).toFixed(2),
                      result_order_number_no_CF: (e / data?.order_number_no_CF).toFixed(2),
                      cost: e,
                    };
                  } else return i;
                });
              });
            }}
          />
        );
      },
    },
    {
      title: "Số đơn có Capture Form",
      dataIndex: "order_number_CF",
      key: "order_number",
      width: 150,
    },
    {
      title: "Kết quả",
      dataIndex: "result_order_number_CF",
      key: "result_order_number_CF",
      width: 100,
      render: (
        result_order_number_CF,
        { camp, cost, order_number_CF, result_order_number_CF: _result_order_number_CF }
      ) => {
        return (
          <div className="flex items-center justify-around">
            <p
              className="cursor-pointer hover:text-blue-500 p-2"
              onClick={() => {
                copyToClipboard(result_order_number_CF, () => {
                  messageApi.success("Đã copy");
                });
              }}
            >
              {result_order_number_CF}
            </p>
            <Tooltip placement="top" title={"Copy có Capture Form"}>
              <Button
                type="default"
                icon={<CopyOutlined />}
                size={"middle"}
                onClick={() => {
                  copyToClipboard(`${camp}	${cost}	${order_number_CF}	${_result_order_number_CF}`, () => {
                    messageApi.success("Đã copy phụ");
                  });
                }}
              />
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: "Số đơn không có Capture Form",
      dataIndex: "order_number_no_CF",
      key: "order_number_no_CF",
      width: 150,
    },
    {
      title: "Kết quả",
      dataIndex: "result_order_number_no_CF",
      key: "result_order_number_no_CF",
      width: 100,
      render: (
        result_order_number_no_CF,
        { camp, cost, order_number_no_CF, result_order_number_no_CF: _result_order_number_no_CF }
      ) => {
        return (
          <div className="flex items-center justify-around">
            <p
              className="cursor-pointer hover:text-blue-500 p-2"
              onClick={() => {
                copyToClipboard(result_order_number_no_CF, () => {
                  messageApi.success("Đã copy");
                });
              }}
            >
              {result_order_number_no_CF}
            </p>
            <Tooltip placement="top" title={"Copy có Capture Form"}>
              <Button
                type="default"
                icon={<CopyOutlined />}
                size={"middle"}
                onClick={() => {
                  copyToClipboard(`${camp}	${cost}	${order_number_no_CF}	${_result_order_number_no_CF}`, () => {
                    messageApi.success("Đã copy phụ");
                  });
                }}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    if (data?.length) {
      const new_data = _.cloneDeep(data);
      const resultUniqueSdt = _(new_data)
        .sortBy(["sdt", (item) => (item["Capture Form"] ? 1 : 0)]) // Sắp xếp ưu tiên dòng không có 'Capture Form'
        .uniqBy("sdt")
        // Thay thế giá trị rỗng của camp thành "khác"
        .map((item) => {
          const newItem = { ...item };
          newItem.camp = newItem.camp || "khác"; // Nếu camp rỗng thì gán "khác"
          return newItem;
        })
        ?.value();

      const resultUniqueCamp = _(_.cloneDeep(resultUniqueSdt)).uniqBy("camp")?.value();

      // Lọc giá trị duy nhất của camp

      const lastResult = _.cloneDeep(resultUniqueCamp)?.map((item, idx, arr) => {
        const order_number_CF = _.filter(resultUniqueSdt, (i) => i["Capture Form"] && item?.camp === i?.camp)?.length;
        const order_number_no_CF = _.filter(
          resultUniqueSdt,
          (i) => !i["Capture Form"] && item?.camp === i?.camp
        )?.length;

        return {
          stt: idx + 1,
          camp: item?.["camp"],
          cost: 0,
          order_number_CF,
          result_order_number_CF: 0,
          order_number_no_CF,
          result_order_number_no_CF: 0,
        };
      });

      setStatisticData(lastResult);
    }
  }, [data]);

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
          <div className=" mt-2 w-full">
            <TableExport
              data={statisticData}
              columns={columns}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={2} index={0}>
                      Tổng
                    </Table.Summary.Cell>
                    <Table.Summary.Cell colSpan={1} index={0}>
                      <InputNumber
                        value={summary?.cost}
                        onChange={(e) => {
                          setSummary({ ...summary, cost: e });
                        }}
                      />
                    </Table.Summary.Cell>
                    <Table.Summary.Cell colSpan={1} index={1}>
                      {statisticData?.reduce((acc, cur) => acc + cur?.order_number_CF, 0)}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell colSpan={1} index={0}>
                      <p
                        onClick={() => {
                          copyToClipboard(
                            `${summary?.cost}	${statisticData?.reduce((acc, cur) => acc + cur?.order_number_CF, 0)}	${(
                              summary?.cost / statisticData?.reduce((acc, cur) => acc + cur?.order_number_CF, 0) || 0
                            )?.toFixed(0)}`,
                            () => {
                              messageApi.success("Đã copy");
                            }
                          );
                        }}
                      >
                        {(
                          summary?.cost / statisticData?.reduce((acc, cur) => acc + cur?.order_number_CF, 0) || 0
                        )?.toFixed(0)}
                      </p>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell colSpan={1} index={1}>
                      {statisticData?.reduce((acc, cur) => acc + cur?.order_number_no_CF, 0)}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell colSpan={1} index={2}>
                      <p
                        onClick={() => {
                          copyToClipboard(
                            `${summary?.cost}	${statisticData?.reduce((acc, cur) => acc + cur?.order_number_no_CF, 0)}	${(
                              summary?.cost / statisticData?.reduce((acc, cur) => acc + cur?.order_number_no_CF, 0) || 0
                            )?.toFixed(0)}`,
                            () => {
                              messageApi.success("Đã copy");
                            }
                          );
                        }}
                      >
                        {(
                          summary?.cost / statisticData?.reduce((acc, cur) => acc + cur?.order_number_no_CF, 0) || 0
                        )?.toFixed(0)}
                      </p>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckAdsResult;
