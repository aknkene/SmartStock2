const fs = require('fs');

let content = fs.readFileSync('src/pages/Reports.tsx', 'utf8');

const replacements = {
  'รหัสสินค้า': "{t('reports.tableItemCode')}",
  'ชื่อสินค้า': "{t('reports.tableItemName')}",
  'สี/ขนาด': "{t('reports.tableColorSize')}",
  'คงเหลือ': "{t('reports.tableRemaining')}",
  'จุดสั่งซื้อ (ขั้นต่ำ)': "{t('reports.tableReorder')}",
  'รหัสนักเรียน': "{t('reports.tableStudentId')}",
  'ชื่อนักเรียน': "{t('reports.tableStudentName')}",
  'ชื่อ-สกุล': "{t('reports.tableStudentName')}",
  'ชื่อ - นามสกุล': "{t('reports.tableStudentNameFull')}",
  'ห้องเรียน': "{t('reports.tableClassroom')}",
  'ห้อง / แผนก': "{t('reports.tableRoomDept')}",
  'ห้อง': "{t('reports.tableRoom')}",
  'รับแล้ว / ต้องรับทั้งหมด': "{t('reports.tableReceivedAll')}",
  'ยอดรวม': "{t('reports.tableTotal')}",
  'ชำระแล้ว': "{t('reports.tablePaid')}",
  'ค้างชำระ': "{t('reports.tableUnpaid')}",
  'วันที่ / เวลา': "{t('reports.tableDateTime')}",
  'จำนวนเงิน (บาท)': "{t('reports.tableAmount')}",
  'ผู้บันทึก': "{t('reports.tableRecorder')}",
  'หมายเหตุ': "{t('reports.tableNote')}",
  'เดือน / ปี': "{t('reports.tableMonthYear')}",
  'จำนวนรายการ': "{t('reports.tableTotalItems')}",
  'ยอดเงินรวม (บาท)': "{t('reports.tableTotalAmount')}",
  'สัดส่วน (%)': "{t('reports.tablePercent')}",
  'รหัสและรายการสินค้า': "{t('reports.tableItemDetails')}",
  'รายการสินค้า': "{t('reports.tableItemList')}",
  'จำนวนรับเข้า': "{t('reports.tableReceiveAmount')}",
  'การจัดการ': "{t('reports.tableAction')}",
  'นักเรียนทั้งหมด': "{t('reports.tableTotalStudents')}",
  'ชำระครบแล้ว': "{t('reports.tableFullyPaid')}",
  'รับของครบแล้ว': "{t('reports.tableFullyReceived')}",
  'ยอดค้างชำระรวม': "{t('reports.tableTotalUnpaid')}"
};

// Only replace inside <th> tags
content = content.replace(/<th(.*?)>(.*?)<\/th>/g, (match, p1, p2) => {
  let innerText = p2.trim();
  if (replacements[innerText]) {
    return `<th${p1}>${replacements[innerText]}</th>`;
  }
  return match;
});

fs.writeFileSync('src/pages/Reports.tsx', content, 'utf8');
