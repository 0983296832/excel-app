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
import { Button, Checkbox, Input, Select, Tabs, Tooltip, message, InputNumber, Modal } from "antd";
import {
  copyToClipboard,
  formatCurrency,
  getCurrentTime,
  getNumberAfterDash,
  getNumberBeforeSpace,
  getStringAfterDash,
  getSubstringAfterFirstLetter,
  getTotal,
} from "../ultil";
import "./order.css";

const OrderSheet = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const [data, setData] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [statisticData, setStatisticData] = useState({ check: false, data: [], uniq_p: [], clone_data: [] });
  const [filter, setFilter] = useState({ product_name: "" });
  const [search, setSearch] = useState("");
  const [activetab, setActivetab] = useState(1);
  const [edit, setEdit] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    onChangeWeigth();
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

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
      label: "Xuất đơn",
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
      const uniqueP = [
        { label: "Tất cả", value: "" },
        ..._.uniqBy(
          _.uniqBy(data, "Sản phẩm").map((v) => {
            return { key: _.uniqueId(), product_name: v["Sản phẩm"] };
          }),
          "product_name"
        ).map((v) => ({ value: v.product_name, label: v.product_name })),
      ];

      setEdit(uniqueP.filter((v, idx) => idx > 0).map((v) => ({ p_name: v.label, weight: 0 })));

      const clone_data = _.cloneDeep(data);
      setOrderData(
        clone_data.map((v) => ({
          name: v["Tên khách hàng"],
          phone: v["Sđt"],
          address: v["Địa chỉ"],
          product: v["Sản phẩm"],
          amount: v["Số lượng"],
          weight: 0,
          price: v["Giá"],
          cod: v["Giá"],
        }))
      );

      const sData = _.uniqBy(
        _.uniqBy(data, "Sản phẩm").map((v) => {
          return {
            key: _.uniqueId(),
            product_name: v["Sản phẩm"],
            amount: v["Số lượng"],
            phone: v["Sđt"],
          };
        }),
        "product_name"
      ).sort((a, b) => {
        const nameA = a.product_name.toLowerCase();
        const nameB = b.product_name.toLowerCase();

        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
      const newStatisticData = sData.map((s, index, arr) => {
        const totalOrder = data.reduce((prev, curr) => {
          if (curr["Sản phẩm"] == s.product_name) {
            return prev + 1;
          } else return prev + 0;
        }, 0);

        const totalAmount = data.reduce((prev, curr) => {
          if (curr["Sản phẩm"] == s.product_name) {
            return prev + s.amount;
          } else return prev + 0;
        }, 0);

        const getPhoneOfErrorRow = () => {
          const phones = [];
          data.forEach((r) => {
            const number = getNumberBeforeSpace(r["Sản phẩm"]);
            if (number != r["Số lượng"] && r["Sản phẩm"] == s.product_name) {
              phones.push(r["Sđt"]);
            }
          });
          return phones;
        };

        return {
          index,
          product_name: s.product_name,
          s_name: s.product_name,
          order: totalOrder,
          amount: totalAmount,
          checked: false,
          error: getPhoneOfErrorRow(),
        };
      });

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
  ];

  const columns1 = [
    {
      title: "TÊN KHÁCH",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "SDT",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "ĐỊA CHỈ",
      dataIndex: "address",
      key: "address",
      width: 270,
      render: (_, { address }) => {
        return (
          <Tooltip title={address}>
            <p>{address.slice(0, 30)}....</p>
          </Tooltip>
        );
      },
    },
    {
      title: "SẢN PHẨM",
      dataIndex: "product",
      key: "product",
      width: 400,
    },
    {
      title: "SL",
      dataIndex: "amount",
      key: "amount",
      width: 90,
    },
    {
      title: "CÂN NẶNG",
      dataIndex: "weight",
      key: "weight",
    },
    {
      title: "GTHH",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "COD",
      dataIndex: "cod",
      key: "cod",
    },
  ];

  useEffect(() => {
    if (statisticData.data.length > 0) {
      const arrayNotCheck = statisticData.data.filter((v) => !v?.checked);
      setStatisticData({ ...statisticData, check: arrayNotCheck?.length == 0 ? true : false });
    }
  }, [JSON.stringify(statisticData.data)]);

  const exportExcel = () => {
    const newData = _.cloneDeep(orderData);

    const dataExport = newData
      .map((v) => {
        return {
          "Tên khách hàng": v.name,
          SĐT: "0" + v.phone,
          "Địa chỉ": v.address,
          "SẢN PHẨM": v.product,
          SL: v.amount,
          "Cân nặng": v.weight,
          GTHH: v.price,
          COD: v.cod,
          "GHI CHÚ":
            "cho khách kiểm hàng.Đơn hàng có vấn đề gọi lại cho shop dù bất kì lý do gì. Phát hàng không được, khách từ chối nhận gọi cho shop ngay",
        };
      })
      .sort((a, b) => {
        return a["SL"] - b["SL"];
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

  const onChangeWeigth = () => {
    const new_edit = _.cloneDeep(edit);
    let new_order_data = _.cloneDeep(orderData);

    const newUpdateData = [];
    new_edit.forEach((e) => {
      const temp = new_order_data.filter((v) => v.product.toLowerCase() == e.p_name.toLowerCase());
      if (temp?.length > 0) {
        newUpdateData.push(...temp.map((t) => ({ ...t, weight: e.weight })));
      }
    });
    const groupedObjects = _.groupBy(newUpdateData, (obj) => JSON.stringify(_.omit(obj, ["id"])));

    // Sử dụng _.filter để lọc ra các nhóm có nhiều hơn một đối tượng (nếu bạn muốn loại bỏ các đối tượng không trùng lặp)
    const duplicates = _.filter(groupedObjects, (group) => group.length > 1);

    duplicates.forEach((v) => {
      const targetObject = { name: v[0]?.name, product: v[0]?.product };
      const dupIndex = [];
      newUpdateData.forEach((dup_p, index) => {
        if (dup_p?.name == targetObject?.name && dup_p?.product == targetObject?.product) {
          dupIndex.push(index);
        }
      });
      if (dupIndex?.length >= v?.length) {
        return;
      } else {
        dupIndex.slice(0, dupIndex?.length - v?.length).forEach((d) => (newUpdateData[d].is_duplicate = true));
      }
    });
    setOrderData(newUpdateData.filter((v) => !v?.is_duplicate));
    setEdit([edit.map((v) => ({ ...v, weight: 0 }))]);
  };

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
        <Tabs defaultActiveKey={activetab} items={items} onChange={onChange} />
        {activetab == 1 && (
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
        )}
        {activetab == 2 && (
          <div>
            <div className="flex gap-16">
              <div className="w-64 mb-2">
                <p className="mb-2">Tìm tên:</p>
                <input
                  type="text"
                  id="first_name"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1 "
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                ></input>
              </div>
              <Button
                className="mt-6 ml-16"
                type="primary"
                onClick={() => {
                  exportExcel();
                }}
              >
                Xuất file
              </Button>
              <Button className="ml-auto mt-6" type="primary" onClick={showModal}>
                Sửa cân nặng
              </Button>
            </div>

            <TableExport
              data={orderData.filter((v) => v.product.toLowerCase().includes(search.toLowerCase()))}
              columns={columns1}
            />
            <Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
              {edit?.map((v, idx) => {
                return (
                  <div key={idx} className="flex items-center gap-6">
                    <div className="w-80">
                      <p className="mb-2">Tên:</p>
                      <input
                        type="text"
                        id="first_name"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1 "
                        value={v.p_name}
                        onChange={(e) => {
                          v.p_name = e.target.value;
                          setEdit([...edit]);
                        }}
                      ></input>
                    </div>
                    <div className="w-24">
                      <p className="mb-2">Số lượng:</p>
                      <InputNumber
                        value={v.weight}
                        onChange={(e) => {
                          v.weight = e;
                          setEdit([...edit]);
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              <Button
                type="primary"
                className="mt-2"
                onClick={() => {
                  setEdit([...edit, { p_name: "", weight: 0 }]);
                }}
              >
                Thêm
              </Button>
            </Modal>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSheet;
