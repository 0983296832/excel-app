/*
 * @description
 * @since         Sunday, 12 10th 2023, 20:19:20 pm
 * @author        Bình Lê <binhlv@getflycrm.com>
 * @copyright     Copyright (c) 2023, Getfly VN TECH.,JSC, Inc.
 * -----
 * Change Log: <press Ctrl + alt + c write changelog>
 */
import * as xlsx from "xlsx";
import { useEffect, useState } from "react";
import TableExport from "../components/Table";
import _ from "lodash";
import { Button, Select, Tooltip, message } from "antd";
import { copyToClipboard, formatCurrency, getNumberAfterDash, getSubstringAfterFirstLetter, getTotal } from "../ultil";
import { CopyOutlined } from "@ant-design/icons";

function Statistic() {
  const [messageApi, contextHolder] = message.useMessage();
  const [data, setData] = useState([]);
  const [statisticData, setStatisticData] = useState([]);
  const [statusOptions, setStatusOptions] = useState([
    { label: "Vui lòng chọn", value: 0 },
    {
      label: "Không nghe máy",
      value: 1,
      extra_options: [
        "Không nghe máy",
        "Không nghe máy 1",
        "Không nghe máy 2",
        "Không nghe máy 3",
        "Không nghe máy 4",
        "Không nghe máy 5",
        "Hẹn gọi lại",
      ],
    },
    {
      label: "Đã chốt",
      value: 2,
      extra_options: [
        "Đã chốt",
        "Đã chốt- hẹn ship",
        "Đã gửi BĐ",
        "Phát thành công",
        "Giao hàng - Có vấn đề",
        "Chưa phát được",
        "Chuyển hoàn",
        "COD-đã thu tiền",
        "Phát hoàn thành công",
      ],
    },
    { label: "Đã hủy", value: 3, extra_options: ["Hủy đơn", "Sai số", "Khách - Yêu cầu hủy", "Huỷ vận đơn"] },
  ]);
  const [columns, setColumns] = useState([
    {
      title: "TÊN SẢN PHẨM",
      dataIndex: "product_name",
      key: "product_name",
    },
    {
      title: "SHEET GG",
      children: [
        {
          title: "SỐ ĐƠN",
          dataIndex: "gg_order",
          key: "gg_order",
        },
        {
          title: "SỐ LƯỢNG",
          dataIndex: "gg_amount",
          key: "gg_amount",
        },
        {
          title: "DOANH SỐ",
          dataIndex: "gg_sales",
          key: "gg_sales",
        },
      ],
    },
    {
      title: "HOTLINE",
      children: [
        {
          title: "SỐ ĐƠN",
          dataIndex: "hotline_order",
          key: "hotline_order",
        },
        {
          title: "SỐ LƯỢNG",
          dataIndex: "hotline_amount",
          key: "hotline_amount",
        },
        {
          title: "DOANH SỐ",
          dataIndex: "hotline_sales",
          key: "hotline_sales",
        },
      ],
    },
  ]);

  const [filter, setFilter] = useState({
    status: 0,
    source: "",
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
        setStatisticData(
          _.uniqBy(
            _.uniqBy(json, "Sản phẩm").map((v) => {
              return { key: _.uniqueId(), product_name: getSubstringAfterFirstLetter(v["Sản phẩm"]) };
            }),
            "product_name"
          )
        );
      };
      reader.readAsArrayBuffer(e.target.files[0]);
    }
  };

  useEffect(() => {
    if (data?.length) {
      const new_data = _.cloneDeep(data);
      console.log("data", data);
      // {
      //   // Định nghĩa các nhóm trạng thái
      //   const statusGroups = {
      //     "Đã chốt": ["Dachot-henship", "Dachot", "Daguibuudien", "Chuaphatduoc"],
      //     "Không nghe máy": [
      //       "Khongnghemaylan1",
      //       "Khongnghemaylan2",
      //       "Khongnghemaylan3",
      //       "Khongnghemaylan4",
      //       "Khongnghemaylan5",
      //     ],
      //     "Đơn hủy": ["Saiso", "Huy DNX", "Yeucauhuy"],
      //   };

      //   // Tạo một đối tượng để lưu kết quả đếm
      //   const result = {};

      //   // Duyệt qua từng nhóm trạng thái
      //   _.forEach(statusGroups, (statuses, groupName) => {
      //     // Lọc các đối tượng theo nhóm trạng thái hiện tại
      //     const filteredByGroup = _.filter(new_data, (item) => _.includes(statuses, item["Tình trạng"]));

      //     // Đếm số lần xuất hiện của mỗi người trong các đối tượng đã lọc
      //     const countByPerson = _.countBy(filteredByGroup, "Đơn hàng của");

      //     // Lưu kết quả đếm vào đối tượng kết quả
      //     result[groupName] = countByPerson;
      //   });
      // }

      // {
      //   const countByPerson = _.countBy(new_data, "Đơn hàng của");
      // }

      if (filter.status) {
        const filterStatusValue = statusOptions.find((opt) => opt?.value == filter.status);

        const newFilterData = new_data.filter((v) => filterStatusValue.extra_options.includes(v["Tình trạng"]));

        const newStatisticData = statisticData.map((s) => {
          const totalGGOrder = newFilterData.reduce((prev, curr) => {
            if (curr["Sản phẩm"].includes(s.product_name) && curr["Kênh"] == "Ladipage") {
              return prev + 1;
            } else return prev + 0;
          }, 0);
          const totalGGAmount = newFilterData.reduce((prev, curr) => {
            if (curr["Sản phẩm"].includes(s.product_name) && curr["Kênh"] == "Ladipage") {
              return prev + getNumberAfterDash(curr["Sản phẩm"]);
            } else return prev + 0;
          }, 0);
          const totalGGSales = newFilterData.reduce((prev, curr) => {
            if (curr["Sản phẩm"].includes(s.product_name) && curr["Kênh"] == "Ladipage") {
              return prev + Number(curr["Tổng tiền"]);
            } else return prev + 0;
          }, 0);
          const totalHotlineOrder = newFilterData.reduce((prev, curr) => {
            if (curr["Sản phẩm"].includes(s.product_name) && curr["Kênh"] == "") {
              return prev + 1;
            } else return prev + 0;
          }, 0);
          const totalHotlineAmount = newFilterData.reduce((prev, curr) => {
            if (curr["Sản phẩm"].includes(s.product_name) && curr["Kênh"] == "") {
              return prev + getNumberAfterDash(curr["Sản phẩm"]);
            } else return prev + 0;
          }, 0);
          const totalHotlineSales = newFilterData.reduce((prev, curr) => {
            if (curr["Sản phẩm"].includes(s.product_name) && curr["Kênh"] == "") {
              return prev + Number(curr["Tổng tiền"]);
            } else return prev + 0;
          }, 0);
          return {
            product_name: s.product_name,
            gg_order: totalGGOrder,
            gg_amount: totalGGAmount,
            gg_sales: totalGGSales,
            hotline_order: totalHotlineOrder,
            hotline_amount: totalHotlineAmount,
            hotline_sales: totalHotlineSales,
          };
        });
        setStatisticData(newStatisticData);
        setColumns([
          {
            title: "TÊN SẢN PHẨM",
            dataIndex: "product_name",
            key: "product_name",
          },
          {
            title: "SHEET GG",
            children: [
              {
                title: `SỐ ĐƠN (${getTotal(newStatisticData, "gg_order")})`,
                dataIndex: "gg_order",
                key: "gg_order",
              },
              {
                title: `SỐ LƯỢNG (${getTotal(newStatisticData, "gg_amount")})`,
                dataIndex: "gg_amount",
                key: "gg_amount",
              },
              {
                title: `DOANH SỐ (${formatCurrency(getTotal(newStatisticData, "gg_sales"))})`,
                dataIndex: "gg_sales",
                key: "gg_sales",
                render: (_, { gg_sales }) => {
                  return <p>{formatCurrency(gg_sales ?? 0)}</p>;
                },
              },
            ],
          },
          {
            title: "HOTLINE",
            children: [
              {
                title: `SỐ ĐƠN (${getTotal(newStatisticData, "hotline_order")})`,
                dataIndex: "hotline_order",
                key: "hotline_order",
              },
              {
                title: `SỐ LƯỢNG (${getTotal(newStatisticData, "hotline_amount")})`,
                dataIndex: "hotline_amount",
                key: "hotline_amount",
              },
              {
                title: `DOANH SỐ (${formatCurrency(getTotal(newStatisticData, "hotline_sales"))})`,
                dataIndex: "hotline_sales",
                key: "hotline_sales",
                render: (_, { hotline_sales }) => {
                  return <p>{formatCurrency(hotline_sales ?? 0)}</p>;
                },
              },
            ],
          },
          {
            title: "Thao tác",
            dataIndex: "action",
            key: "action",
            render: (_, { gg_order, gg_amount, gg_sales, hotline_order, hotline_amount, hotline_sales }) => {
              return (
                <div className="flex items-start gap-3">
                  {filter.status == 2 && (
                    <Tooltip placement="top" title={"Copy số lượng đơn"}>
                      <Button
                        type="default"
                        icon={<CopyOutlined />}
                        size={"middle"}
                        onClick={() => {
                          copyToClipboard(`${hotline_order}	${gg_order}`, () => {
                            messageApi.success("Đã copy phụ");
                          });
                        }}
                      />
                    </Tooltip>
                  )}
                  <Tooltip placement="top" title={"Copy số tổng"}>
                    <Button
                      type="primary"
                      icon={<CopyOutlined />}
                      size={"middle"}
                      onClick={() => {
                        copyToClipboard(
                          filter.status == 1 || filter.status == 3
                            ? gg_order
                            : `${gg_order}	${gg_amount}	 ${gg_sales} 	${hotline_order}	${hotline_amount}	 ${hotline_sales} `,
                          () => {
                            messageApi.success("Đã copy chính");
                          }
                        );
                      }}
                    />
                  </Tooltip>
                </div>
              );
            },
          },
        ]);
      }
    }
  }, [JSON.stringify(filter), data?.length]);

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
        <div className="flex gap-3 items-center">
          <div className="">
            <p className="mb-2 text-left">Tình trạng:</p>
            <Select
              value={filter.status}
              style={{
                width: 250,
              }}
              onChange={(e) => {
                setFilter({ ...filter, status: e });
              }}
              options={statusOptions}
            />
          </div>
        </div>

        <div className=" overflow-auto mt-3">
          <TableExport data={statisticData} columns={columns} />
        </div>
      </div>
    </div>
  );
}

export default Statistic;
