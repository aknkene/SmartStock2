const fs = require('fs');
let content = fs.readFileSync('src/pages/Inventory.tsx', 'utf8');

const importExcelHeader = `
import * as XLSX from 'xlsx';
`;

content = content.replace("import React, { useState, useMemo } from 'react';", "import React, { useState, useMemo, useRef } from 'react';\n" + importExcelHeader);

const handlers = `
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { code: '001', name: 'เสื้อนักเรียน', category: 'เครื่องแบบ', size: 'M', color: 'ขาว', stock: 100, costPrice: 150 }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'product_import_template.xlsx');
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        
        let importedCount = 0;
        data.forEach((row: any) => {
          if (row.code && row.name) {
            addProduct({
              code: String(row.code),
              name: String(row.name),
              category: row.category ? String(row.category) : 'อื่นๆ',
              size: row.size ? String(row.size) : '-',
              color: row.color ? String(row.color) : '-',
              stock: Number(row.stock) || 0,
              costPrice: Number(row.costPrice) || 0,
            });
            importedCount++;
          }
        });
        
        if (importedCount > 0) {
           setToastMessage(\`นำเข้าข้อมูลสำเร็จ \${importedCount} รายการ\`);
        } else {
           alert('ไม่พบข้อมูลที่ถูกต้องในไฟล์ Excel (ต้องมีคอลัมน์ code และ name)');
        }
      } catch (error) {
        console.error(error);
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ Excel');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };
`;

content = content.replace("const [isAddingProduct, setIsAddingProduct] = useState(false);", handlers + "\n  const [isAddingProduct, setIsAddingProduct] = useState(false);");

// Replace buttons
const buttons = `
            <Link to="/reports" className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              รายงานการรับสินค้าเข้า
            </Link>
            <button onClick={handleDownloadTemplate} className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1" title="ดาวน์โหลดฟอร์ม Excel">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              โหลดฟอร์ม
            </button>
            <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleImportExcel} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              นำเข้า Excel
            </button>
`;

content = content.replace(
  /<Link to="\/reports"[\s\S]*?นำเข้า Excel\s*<\/button>/,
  buttons
);

fs.writeFileSync('src/pages/Inventory.tsx', content, 'utf8');
