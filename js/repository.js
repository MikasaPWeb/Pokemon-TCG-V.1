// --- In-Code Static Repository (ข้อมูลทั้งหมดเก็บอยู่ในโค้ดไฟล์นี้เอง ไม่พึ่งพาเซิร์ฟเวอร์ภายนอก) ---

class Repository {
  constructor(sheetName) {
    this.sheetName = sheetName;
    
    // จำลองฐานข้อมูลภายในโค้ด (คุณสามารถเพิ่ม/แก้ไขรายการสินค้าตั้งต้นได้ที่นี่โดยตรง)
    if (!window._mockDatabase) {
      window._mockDatabase = {
        products: [
          { id: "1", name: "Pikachu VMAX", price: 350, stock: 10, category: "Pokemon", image: "" },
          { id: "2", name: "Charizard V", price: 500, stock: 5, category: "Pokemon", image: "" },
          { id: "3", name: "Trainer Marnie", price: 150, stock: 20, category: "Trainer", image: "" }
        ],
        orders: [],
        stock: []
      };
    }
  }

  // ดึงข้อมูลทั้งหมดจากตัวแปรในโค้ด
  async getAll() {
    try {
      const key = this.getCollectionKey();
      return window._mockDatabase[key] || [];
    } catch (error) {
      console.error("Error getting data:", error);
      return [];
    }
  }

  // เพิ่มข้อมูลลงในตัวแปรในโค้ด
  async add(item) {
    try {
      const key = this.getCollectionKey();
      if (!item.id) {
        item.id = Date.now().toString();
      }
      window._mockDatabase[key].push(item);
      return true;
    } catch (error) {
      console.error("Error adding data:", error);
      return false;
    }
  }

  // อัปเดตข้อมูลภายในตัวแปรในโค้ด
  async update(item) {
    try {
      const key = this.getCollectionKey();
      let list = window._mockDatabase[key];
      const index = list.findIndex(i => i.id == item.id);
      if (index !== -1) {
        list[index] = { ...list[index], ...item };
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating data:", error);
      return false;
    }
  }

  // ลบข้อมูลออกจากตัวแปรในโค้ด
  async delete(id) {
    try {
      const key = this.getCollectionKey();
      let list = window._mockDatabase[key];
      window._mockDatabase[key] = list.filter(i => i.id != id);
      return true;
    } catch (error) {
      console.error("Error deleting data:", error);
      return false;
    }
  }

  // จัดหมวดหมู่ชื่อชีตเดิมให้ตรงกับ Key ในระบบจำลอง
  getCollectionKey() {
    const name = (this.sheetName || "").toLowerCase();
    if (name.includes("product") || name.includes("สินค้า")) return "products";
    if (name.includes("order") || name.includes("คำสั่งซื้อ")) return "orders";
    return "products"; // ค่าเริ่มต้น
  }
}