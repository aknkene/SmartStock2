const fs = require('fs');
let content = fs.readFileSync('src/pages/Inventory.tsx', 'utf8');

// Remove import XLSX
content = content.replace(/import \* as XLSX from "xlsx";\n/g, "");

// Remove functions
const startFuncs = `  const fileInputRef = useRef<HTMLInputElement>(null);`;
const endFuncs = `      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };`;

const funcStartIndex = content.indexOf(startFuncs);
const funcEndIndex = content.indexOf(endFuncs);

if (funcStartIndex !== -1 && funcEndIndex !== -1) {
    content = content.substring(0, funcStartIndex) + content.substring(funcEndIndex + endFuncs.length + 1);
}

// Remove button
const buttonToRemove = `            <button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              นำเข้า Excel
            </button>`;

content = content.replace(buttonToRemove, "");

// In case there is an alternate button format:
const buttonToRemoveAlt = `            <button onClick={handleDownloadTemplate} className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1" title="ดาวน์โหลดฟอร์ม Excel">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              โหลดฟอร์ม
            </button>
            <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleImportExcel} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              นำเข้า Excel
            </button>`;

content = content.replace(buttonToRemoveAlt, "");

fs.writeFileSync('src/pages/Inventory.tsx', content, 'utf8');
