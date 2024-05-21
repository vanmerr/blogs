

// Khai báo cấu hình Firebase cho dự án của bạn
const firebaseConfig = {
    apiKey: "AIzaSyCVGZsAZjgmi2MCS_uTeeGvcfytBfyT8j0",
    authDomain: "blogs-9cda5.firebaseapp.com",
    projectId: "blogs-9cda5",
    storageBucket: "blogs-9cda5.appspot.com",
    messagingSenderId: "304273323820",
    appId: "1:304273323820:web:2a0f774374343e40fb9e89",
    measurementId: "G-N9RXKPE294"
  };
  

// Khởi tạo Firebase với cấu hình dự án
let app = firebase.initializeApp(firebaseConfig);



// Khởi tạo kết nối tới Firestore
let db = firebase.firestore();

// Khởi tạo Firebase Authentication
let auth = firebase.auth();


// Hàm đăng xuất người dùng
const logoutUser = () => {
    auth.signOut().then(() => {
        location.reload();
    }).catch(error => {
        console.error("Error logging out:", error);
    });
}

