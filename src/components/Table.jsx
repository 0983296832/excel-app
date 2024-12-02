/*
 * @description
 * @since         Sunday, 12 10th 2023, 16:07:09 pm
 * @author        Bình Lê <binhlv@getflycrm.com>
 * @copyright     Copyright (c) 2023, Getfly VN TECH.,JSC, Inc.
 * -----
 * Change Log: <press Ctrl + alt + c write changelog>
 */
// import React from 'react';
import { Table } from "antd";

const TableExport = ({ data, columns, pagination = false, summary }) => {
  return (
    <Table columns={columns} dataSource={data} pagination={pagination} rowHoverBg={"gray"} bordered summary={summary} />
  );
};
export default TableExport;
