// ค่า Config ของโปรเจกต์ Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDugVxpGcmuApH5K07uggU9EUuXOaKImVY",
    authDomain: "pokemon-tcg-5efd3.firebaseapp.com",
    databaseURL: "https://pokemon-tcg-5efd3-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "pokemon-tcg-5efd3",
    storageBucket: "pokemon-tcg-5efd3.firebasestorage.app",
    messagingSenderId: "85050810370",
    appId: "1:85050810370:web:f5812cf8c056ce546ac71b",
    measurementId: "G-E9QC80NEZV"
};

// เริ่มต้นใช้งาน Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// สร้างตัวแปรอ้างอิงฐานข้อมูลไว้ใช้งานในไฟล์อื่น
const database = firebase.database();