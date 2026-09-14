const fs = require('fs');

let content = fs.readFileSync('src/pages/Students.tsx', 'utf8');

// Import XLSX
if (!content.includes('import * as XLSX')) {
  content = content.replace(
    "import { useTranslation } from '../hooks/useTranslation';",
    "import { useTranslation } from '../hooks/useTranslation';\nimport * as XLSX from 'xlsx';"
  );
}

// Add state and refs for file upload
const stateHooksRegex = /(const \[payAttachment, setPayAttachment\] = useState<string>\(''\);)/;
const newHooks = `$1
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['รหัสนักเรียน', 'คำนำหน้า', 'ชื่อ', 'นามสกุล', 'ระดับชั้น', 'ห้อง', 'แผนก', 'เบอร์โทร', 'ยอดเงินที่ต้องชำระ'],
      ['66010001', 'นาย', 'สมชาย', 'ใจดี', 'ปวช.1', '1', 'ช่างยนต์', '0812345678', '1500']
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'StudentsTemplate');
    XLSX.writeFile(wb, 'SmartStock_Student_Template.xlsx');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        data.forEach((row: any) => {
          if (row['รหัสนักเรียน'] && row['ชื่อ'] && row['นามสกุล']) {
            addStudent({
              studentId: String(row['รหัสนักเรียน']),
              prefix: String(row['คำนำหน้า'] || ''),
              firstName: String(row['ชื่อ']),
              lastName: String(row['นามสกุล']),
              level: String(row['ระดับชั้น'] || ''),
              room: String(row['ห้อง'] || ''),
              department: String(row['แผนก'] || ''),
              phone: String(row['เบอร์โทร'] || ''),
              totalFee: Number(row['ยอดเงินที่ต้องชำระ']) || 0,
              paidAmount: 0
            });
          }
        });
        alert('นำเข้าข้อมูลสำเร็จ!');
      } catch (error) {
        console.error(error);
        alert('เกิดข้อผิดพลาดในการนำเข้า กรุณาตรวจสอบไฟล์ Excel');
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };
`;
if (!content.includes('downloadTemplate')) {
  // Need to import React for useRef
  if (!content.includes('import React')) {
      content = content.replace("import { useState", "import React, { useState");
  }
  content = content.replace(stateHooksRegex, newHooks);
}

// Update the buttons
const buttonsRegex = /<button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">\s*<FileSpreadsheet className="w-4 h-4" \/>\s*นำเข้า Excel\s*<\/button>/;
const newButtons = `
            <button onClick={downloadTemplate} className="bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              โหลดฟอร์ม Excel
            </button>
            <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              นำเข้า Excel
            </button>
`;
content = content.replace(buttonsRegex, newButtons);

fs.writeFileSync('src/pages/Students.tsx', content, 'utf8');
