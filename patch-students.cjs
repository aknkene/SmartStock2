const fs = require('fs');
let content = fs.readFileSync('src/pages/Students.tsx', 'utf8');

const targetDistribute = `  const handleDistribute = () => {
    if (editingStudentId && cart.length > 0) {
      recordDistribution(editingStudentId, cart, distNote, distAttachment);
      setCart([]);
      setDistNote('');
      setDistAttachment('');
      alert('บันทึกการจ่ายสินค้าสำเร็จ');
      setIsFormModalOpen(false);
    }
  };`;

const newDistribute = `  const handleDistribute = async () => {
    if (editingStudentId && cart.length > 0) {
      try {
        await recordDistribution(editingStudentId, cart, distNote, distAttachment);
        setCart([]);
        setDistNote('');
        setDistAttachment('');
        alert('บันทึกการจ่ายสินค้าสำเร็จ');
        setIsFormModalOpen(false);
      } catch (e: any) {
        alert(e.message || "เกิดข้อผิดพลาดในการจ่ายสินค้า");
      }
    }
  };`;

content = content.replace(targetDistribute, newDistribute);

const targetPayment = `  const handlePayment = (e: any) => {
    e.preventDefault();
    const amountVal = parseFloat(payAmount);
    if (editingStudentId && amountVal > 0) {
      recordPayment(editingStudentId, amountVal, payNote, payAttachment);
      setPayAmount('');
      setPayNote('');
      setPayAttachment('');
      alert('บันทึกการชำระเงินสำเร็จ');
      setIsFormModalOpen(false);
    }
  };`;

const newPayment = `  const handlePayment = async (e: any) => {
    e.preventDefault();
    const amountVal = parseFloat(payAmount);
    if (editingStudentId && amountVal > 0) {
      try {
        await recordPayment(editingStudentId, amountVal, payNote, payAttachment);
        setPayAmount('');
        setPayNote('');
        setPayAttachment('');
        alert('บันทึกการชำระเงินสำเร็จ');
        setIsFormModalOpen(false);
      } catch (e: any) {
        alert(e.message || "เกิดข้อผิดพลาดในการชำระเงิน");
      }
    }
  };`;

content = content.replace(targetPayment, newPayment);
fs.writeFileSync('src/pages/Students.tsx', content, 'utf8');
