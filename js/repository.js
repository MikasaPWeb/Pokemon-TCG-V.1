// --- Google Sheet Repository Adapter ---
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzmJyHbLHp6G-wkU-dY95QOcabNw8oq8SXyRu1hUYUeQSUvOe1Y_I0U_cIYtPhuAE7OOQ/exec";

class Repository {
  constructor(sheetName) {
    this.sheetName = sheetName;
  }

  async getAll() {
    try {
      const response = await fetch(`${WEB_APP_URL}?action=getAll&sheet=${this.sheetName}`);
      const result = await response.json();
      if (result.status === "success") {
        return result.data;
      }
      console.error("Error fetching data:", result.message);
      return [];
    } catch (error) {
      console.error("Fetch error:", error);
      return [];
    }
  }

  async add(item) {
    try {
      const response = await fetch(WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "add",
          sheet: this.sheetName,
          payload: item
        })
      });
      const result = await response.json();
      return result.status === "success";
    } catch (error) {
      console.error("Add error:", error);
      return false;
    }
  }

  async update(item) {
    try {
      const response = await fetch(WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "update",
          sheet: this.sheetName,
          payload: item
        })
      });
      const result = await response.json();
      return result.status === "success";
    } catch (error) {
      console.error("Update error:", error);
      return false;
    }
  }

  async delete(id) {
    try {
      const response = await fetch(WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "delete",
          sheet: this.sheetName,
          payload: { id: id }
        })
      });
      const result = await response.json();
      return result.status === "success";
    } catch (error) {
      console.error("Delete error:", error);
      return false;
    }
  }
}