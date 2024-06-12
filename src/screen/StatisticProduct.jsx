/*
 * @description
 * @since         Sunday, 6 9th 2024, 21:10:24 pm
 * @author        Bình Lê <binhlv@getflycrm.com>
 * @copyright     Copyright (c) 2024, Getfly VN TECH.,JSC, Inc.
 * -----
 * Change Log: <press Ctrl + alt + c write changelog>
 */

import { Button, Input } from "antd";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import * as xlsx from "xlsx";

const StatisticProduct = () => {
  const [products, setProducts] = useState([
    {
      name: "Polo Dứa Lạnh",
      detail: {
        S: 0,
        M: 0,
        L: 0,
        XL: 0,
        "2XL": 0,
        "3XL": 0,
        Tổng: 0,
      },
    },
  ]);
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [statisticData, setStatisticData] = useState([]);

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

  function countProductsBySize(data, color) {
    const sizeCounts = {
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
      "2XL": 0,
      "3XL": 0,
    };

    data.forEach((item) => {
      item.details.forEach((detail) => {
        const size = detail.size;

        if (sizeCounts.hasOwnProperty(size)) {
          if (color) {
            if (detail[color] !== undefined) {
              sizeCounts[size] += detail[color];
            }
          } else {
            // Tính tổng các sản phẩm trong đối tượng detail
            let totalProducts = 0;
            for (const key in detail) {
              if (key !== "size" && typeof detail[key] === "number") {
                totalProducts += detail[key];
              }
            }
            sizeCounts[size] += totalProducts;
          }
        }
      });
    });
    function calculateTotal(sizeCounts) {
      let total = 0;
      for (const key in sizeCounts) {
        if (sizeCounts.hasOwnProperty(key)) {
          total += sizeCounts[key];
        }
      }
      return total;
    }
    products[0].detail = { ...sizeCounts, Tổng: calculateTotal(sizeCounts) };
    setProducts([...products]);
  }

  function parseSizes(input) {
    const groups = input.split("-");

    const parseGroup = (group) => {
      const parts = group.split(" ");
      let size = "";
      const result = {};

      parts.forEach((part) => {
        if (/^(S|M|L|XL|2XL|3XL|4XL|5XL|6XL)$/i.test(part)) {
          size = part; // Lưu size dưới dạng đầy đủ
        } else {
          const match = part.match(/^(\d+)([a-zA-Z]+)$/);
          const number = parseInt(match[1], 10);
          const name = match[2];
          result[name] = number;
        }
      });

      if (size) {
        result.size = size;
      }

      return result;
    };

    return groups.map(parseGroup);
  }

  useEffect(() => {
    if (data?.length) {
      const new_data = _.cloneDeep(data);

      setStatisticData(
        new_data.map((v) => {
          const details = parseSizes(v["Ghi chú"]);
          return {
            product: v["Sản phẩm"],
            note: v["Ghi chú"],
            details,
          };
        })
      );
    }
  }, [data]);

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
      <div>
        <div className="flex items-center gap-56">
          <p className="mb-4">Sản phẩm: {products?.[0]?.name}</p>
          <div className="flex items-center gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg h-8"
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  countProductsBySize(statisticData, search);
                }
              }}
            />

            <Button
              type="primary"
              size={"middle"}
              onClick={() => {
                countProductsBySize(statisticData, search);
              }}
            >
              Thống kê
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-12 mt-6">
          {Object.keys(products?.[0]?.detail)?.map((s) => {
            return (
              <div key={s} className="flex items-center justify-center flex-col gap-3">
                <p>{s.toLocaleUpperCase()}</p>
                <p>{products?.[0]?.detail[s]}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatisticProduct;
