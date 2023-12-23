/*
 * @description
 * @since         Sunday, 12 10th 2023, 16:27:42 pm
 * @author        Bình Lê <binhlv@getflycrm.com>
 * @copyright     Copyright (c) 2023, Getfly VN TECH.,JSC, Inc.
 * -----
 * Change Log: <press Ctrl + alt + c write changelog>
 */
import unidecode from "unidecode";
function convertToNoDiacriticAndUnderscore(text) {
  const textWithoutDiacritics = unidecode(text);
  const normalizedText = textWithoutDiacritics
    .replace(/[^\w\s]/gi, "") // Remove non-word characters except spaces
    .replace(/\s+/g, "_"); // Replace spaces with underscores

  return normalizedText.toLowerCase();
}

const getTotal = (array, field) => {
  return array.reduce((prev, curr) => {
    return prev + curr[field];
  }, 0);
};

function getSubstringAfterFirstLetter(inputString) {
  const match = inputString.match(/\p{L}/u);

  if (match) {
    const index = match.index;
    return inputString.substring(index);
  } else {
    return "Sản phẩm lỗi";
  }
}

function getNumberAfterDash(inputString) {
  const match = inputString.match(/-(\d+)/);

  if (match) {
    return Number(match[1]);
  } else {
    return 0;
  }
}

function getStringAfterDash(inputString) {
  const parts = inputString.split("-");

  if (parts.length > 1) {
    return parts[1].trim();
  } else {
    return "Lỗi";
  }
}

function formatCurrency(amount, locale = "vi-VN") {
  return amount.toLocaleString(locale);
}

function copyToClipboard(text, func) {
  // Tạo một thẻ input tạm thời
  const tempInput = document.createElement("input");

  // Gán giá trị nội dung cho input
  tempInput.value = text;

  // Thêm input vào DOM
  document.body.appendChild(tempInput);

  // Chọn và sao chép nội dung
  tempInput.select();
  document.execCommand("copy");

  // Loại bỏ input tạm thời khỏi DOM
  document.body.removeChild(tempInput);
  func && func();
}

const getDate = (dateString) => {
  var dateObject = new Date(dateString);

  var ngay = dateObject.getDate(); // Lấy ngày
  var thang = dateObject.getMonth() + 1; // Lấy tháng (lưu ý rằng tháng trong JavaScript bắt đầu từ 0)
  return `${ngay}/${thang}`;
};

function getCurrentTime() {
  // Tạo một đối tượng Date
  const currentDate = new Date();

  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds();

  // Định dạng chuỗi ngày và tháng

  return { day, month, year, hours, minutes, seconds };
}

function getNumberBeforeSpace(inputString) {
  const match = inputString.match(/^(\d+) /);
  return match ? parseInt(match[1], 10) : null;
}

function getNumberInParentheses(inputString) {
  const match = inputString.match(/\((\d+)\)/);
  return match ? parseInt(match[1], 10) : null;
}

function getMinAndMaxDates(dateArray) {
  // Chuyển đổi chuỗi ngày thành đối tượng Date
  var dateObjects = dateArray.map(function (dateString) {
    return new Date(dateString);
  });

  // Sắp xếp mảng theo thứ tự tăng dần
  dateObjects.sort(function (a, b) {
    return a - b;
  });

  // Lấy ngày nhỏ nhất và lớn nhất
  var minDate = dateObjects[0].toLocaleDateString("en-GB");
  var maxDate = dateObjects[dateObjects.length - 1].toLocaleDateString("en-GB");

  return {
    minDate: minDate,
    maxDate: maxDate,
  };
}

export {
  convertToNoDiacriticAndUnderscore,
  getTotal,
  getSubstringAfterFirstLetter,
  getNumberAfterDash,
  formatCurrency,
  copyToClipboard,
  getStringAfterDash,
  getDate,
  getCurrentTime,
  getNumberBeforeSpace,
  getNumberInParentheses,
  getMinAndMaxDates,
};
