// อ้างอิงไปยังตำแหน่งข้อมูล 'stocks' บน Firebase
const stockRef = database.ref('stocks');

/**
 * 1. ดึงข้อมูลสต็อกแบบ Real-time
 * เมื่อมีการแก้ไข/ขายสินค้าจากเครื่องใดก็ตาม ฟังก์ชันนี้จะทำงานอัตโนมัติทันที
 */
stockRef.on('value', (snapshot) => {
    const stocks = snapshot.val();
    console.log("ข้อมูลสต็อกปัจจุบันจาก Firebase:", stocks);
    
    // เรียกฟังก์ชันสำหรับแสดงผลบนตารางในหน้าเว็บ
    renderStockUI(stocks);
});

/**
 * 2. ฟังก์ชันแสดงผลบน UI (ตัวอย่าง)
 */
function renderStockUI(stocksData) {
    const tableBody = document.getElementById('stockTableBody');
    if (!tableBody || !stocksData) return;

    tableBody.innerHTML = ''; // ล้างข้อมูลเก่า
    
    Object.keys(stocksData).forEach((key) => {
        const item = stocksData[key];
        const row = `
            <tr>
                <td>${key}</td>
                <td>${item.name}</td>
                <td>${item.price} บาท</td>
                <td>${item.quantity}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

/**
 * 3. ฟังก์ชันตัด/อัปเดตจำนวนสต็อก (เรียกใช้เมื่อขายสินค้าหรือปรับยอด)
 * @param {string} productId - รหัสสินค้า เช่น 'item01'
 * @param {number} newQuantity - จำนวนคงเหลือใหม่
 */
function updateStockQuantity(productId, newQuantity) {
    database.ref('stocks/' + productId).update({
        quantity: Number(newQuantity)
    }).then(() => {
        console.log(`อัปเดตสินค้า ${productId} เรียบร้อยแล้ว`);
    }).catch((error) => {
        console.error("เกิดข้อผิดพลาดในการอัปเดตสต็อก:", error);
    });
}

/**
 * 4. ฟังก์ชันเพิ่มสินค้าใหม่เข้าสต็อก
 */
function addNewProduct(productId, name, price, quantity) {
    database.ref('stocks/' + productId).set({
        name: name,
        price: Number(price),
        quantity: Number(quantity)
    });
}