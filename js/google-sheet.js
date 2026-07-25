const WEB_APP_URL = "YOUR_WEB_APP_URL_ที่ได้จากการ_Deploy";

// ฟังก์ชันดึงข้อมูลทั้งหมดจาก Sheet (เทียบเท่าการ get ข้อมูล)
async function fetchSheetData(sheetName) {
  try {
    let response = await fetch(`${WEB_APP_URL}?action=getAll&sheet=${sheetName}`);
    let result = await response.json();
    if (result.status === "success") {
      return result.data;
    } else {
      console.error("Error fetching data:", result.message);
      return [];
    }
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
}

// ฟังก์ชันสำหรับเพิ่มข้อมูล (Add)
async function addSheetData(sheetName, payload) {
  try {
    let response = await fetch(WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify({ action: "add", sheet: sheetName, payload: payload })
    });
    return await response.json();
  } catch (error) {
    console.error("Add error:", error);
    return { status: "error", message: error };
  }
}

// ฟังก์ชันสำหรับอัปเดตข้อมูล (Update)
async function updateSheetData(sheetName, payload) {
  try {
    let response = await fetch(WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify({ action: "update", sheet: sheetName, payload: payload })
    });
    return await response.json();
  } catch (error) {
    console.error("Update error:", error);
    return { status: "error", message: error };
  }
}

// ฟังก์ชันสำหรับลบข้อมูล (Delete)
async function deleteSheetData(sheetName, payload) {
  try {
    let response = await fetch(WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify({ action: "delete", sheet: sheetName, payload: payload })
    });
    return await response.json();
  } catch (error) {
    console.error("Delete error:", error);
    return { status: "error", message: error };
  }
}