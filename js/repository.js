// --- Google Sheet Repository Adapter สำหรับแทนที่ Firebase ---

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxAPHeJlSDBOh5GR-Bj99ZWdDdip5OLcYKw_7hFZcaSpVm_M_-sGh4bx9e7-Gu-fyQflQ/exec";

class Repository {
  constructor(sheetName) {
    this.sheetName = sheetName;
  }
}
class Repository {
  constructor(sheetName) {
    this.sheetName = sheetName;
  }

  // ดึงข้อมูลทั้งหมด
  async getAll() {
    try {
      let response = await fetch(`${WEB_APP_URL}?action=getAll&sheet=${this.sheetName}`);
      let result = await response.json();
      return result.status === "success" ? result.data : [];
    } catch (error) {
      console.error(`Error fetching ${this.sheetName}:`, error);
      return [];
    }
  }

  // เพิ่มข้อมูล
  async add(payload) {
    try {
      let response = await fetch(WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify({ action: "add", sheet: this.sheetName, payload: payload })
      });
      return await response.json();
    } catch (error) {
      console.error(`Error adding to ${this.sheetName}:`, error);
      return { status: "error", message: error };
    }
  }

  // อัปเดตข้อมูล
  async update(payload) {
    try {
      let response = await fetch(WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify({ action: "update", sheet: this.sheetName, payload: payload })
      });
      return await response.json();
    } catch (error) {
      console.error(`Error updating ${this.sheetName}:`, error);
      return { status: "error", message: error };
    }
  }

  // ลบข้อมูล
  async delete(payload) {
    try {
      let response = await fetch(WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify({ action: "delete", sheet: this.sheetName, payload: payload })
      });
      return await response.json();
    } catch (error) {
      console.error(`Error deleting from ${this.sheetName}:`, error);
      return { status: "error", message: error };
    }
  }
}

// ตัวแปรกลางที่ใช้ติดต่อกับแต่ละชีตใน Google Sheet
const productRepo = new Repository("Products");
const stockRepo = new Repository("Stock");
const orderRepo = new Repository("Orders");

// --- Google Sheet Repository Adapter สำหรับแทนที่ Firebase ---
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyZWvNvzfp9szkXZ7aoFybNWTzszLysJpXGIQCmkShTHoWxeEnPRtfe3aiSYm_gL2fd/exec";

class Repository {
  constructor(sheetName) {
    this.sheetName = sheetName;
  }

  // ดึงข้อมูลทั้งหมด
  async getAll() {
    try {
      let response = await fetch(`${WEB_APP_URL}?action=getAll&sheet=${this.sheetName}`);
      let result = await response.json();
      return result.status === "success" ? result.data : [];
    } catch (error) {
      console.error(`Error fetching ${this.sheetName}:`, error);
      return [];
    }
  }

  // เพิ่มข้อมูล
  async add(payload) {
    try {
      let response = await fetch(WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify({ action: "add", sheet: this.sheetName, payload: payload })
      });
      return await response.json();
    } catch (error) {
      console.error(`Error adding to ${this.sheetName}:`, error);
      return { status: "error", message: error };
    }
  }

  // อัปเดตข้อมูล
  async update(payload) {
    try {
      let response = await fetch(WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify({ action: "update", sheet: this.sheetName, payload: payload })
      });
      return await response.json();
    } catch (error) {
      console.error(`Error updating ${this.sheetName}:`, error);
      return { status: "error", message: error };
    }
  }

  // ลบข้อมูล
  async delete(payload) {
    try {
      let response = await fetch(WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify({ action: "delete", sheet: this.sheetName, payload: payload })
      });
      return await response.json();
    } catch (error) {
      console.error(`Error deleting from ${this.sheetName}:`, error);
      return { status: "error", message: error };
    }
  }
}

// ตัวแปรกลางที่ใช้ติดต่อกับแต่ละชีตใน Google Sheet
const productRepo = new Repository("Products");
const stockRepo = new Repository("Stock");
const orderRepo = new Repository("Orders");
d8ae4f21f72cef69d4c2fa0a93bb95a6246881d9
const customerRepo = new Repository("Customers");