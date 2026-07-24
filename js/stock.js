// อ้างอิงไปยังตำแหน่งข้อมูล 'stocks' บน Firebase
const stockRef = database.ref('stocks');

/**
 * 1. ดึงข้อมูลสต็อกแบบ Real-time
 */
stockRef.on('value', (snapshot) => {
    const stocks = snapshot.val();
    console.log("ข้อมูลสต็อกปัจจุบันจาก Firebase:", stocks);
    
    // เรียกฟังก์ชันสำหรับแสดงผลบนตารางในหน้าเว็บ
    renderStockUI(stocks);
}, (error) => {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลสต็อก:", error);
});

/**
 * 2. ฟังก์ชันแสดงผลบน UI
 */
function renderStockUI(stocksData) {
    const tableBody = document.getElementById('stockTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = ''; // ล้างข้อมูลเก่า
    
    if (!stocksData) {
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">ยังไม่มีข้อมูลสินค้าในสต็อก</td></tr>`;
        return;
    }

    Object.keys(stocksData).forEach((key) => {
        const item = stocksData[key];
        const row = `
            <tr>
                <td>${key}</td>
                <td>${item.name || '-'}</td>
                <td>${item.price || 0} บาท</td>
                <td>${item.quantity || 0}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

/**
 * 3. ฟังก์ชันอัปเดตจำนวนสต็อก
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
    }).catch((error) => {
        console.error("เกิดข้อผิดพลาดในการเพิ่มสินค้า:", error);
    });
}