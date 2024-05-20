

// Tạo đối tượng FirebaseUI AuthUI với đối tượng xác thực Firebase đã khởi tạo trước đó
let ui = new firebaseui.auth.AuthUI(auth);

// Lấy ra phần tử HTML một lần và sử dụng chúng sau đó
const login = document.querySelector('.login');
const blogSection = document.querySelector('.blogs-section');
const loginButton = document.getElementById("loginButton");
const usernameField = document.getElementById("username");
const passwordField = document.getElementById("password");

// Lắng nghe sự kiện cuộn trang
window.addEventListener('scroll', () => {
    const backToTopButton = document.getElementById('back-to-top');
    backToTopButton.style.display = document.documentElement.scrollTop > 100 ? 'block' : 'none';
});

// Xử lý sự kiện khi nút "Back to Top" được nhấn
document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Hàm lấy và hiển thị tất cả bài viết từ Firestore
function getAllBlogs() {
    db.collection("blogs")
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                createBlog(doc);
            });
        })
        .catch((error) => {
            console.error("Lỗi khi lấy bài viết: ", error);
        });
}

// Hàm xử lý sự kiện khi người dùng đăng nhập
auth.onAuthStateChanged((user) => {
    if (user) {
        // Nếu người dùng đã đăng nhập
        login.style.display = "none";
        getUserWrittenBlogs();
        hideLoginForm();
    } else {
        // Nếu người dùng chưa đăng nhập
        showLoginForm();
    }
});

// Hàm xử lý sự kiện khi người dùng nhấn nút "Login"
loginButton.addEventListener("click", handleLogin);

// Hàm xóa một blog
function deleteBlog(id) {

    const currentUser = auth.currentUser;
    // Thêm kiểm tra xem người dùng có quyền xóa không
    if (userHasPermissionToDelete(currentUser.uid)) {
        db.collection("blogs")
            .doc(id)
            .delete()
            .then(() => location.reload())
            .catch((error) => console.log("Error deleting the blog", error));
    } else {
        alert("Bạn không có quyền xóa bài viết.");
    }
}

// Hàm kiểm tra xem người dùng có quyền xóa bài viết
function userHasPermissionToDelete(blogAuthorUID) {
    console.log(blogAuthorUID);
    const currentUser = auth.currentUser;
    if (currentUser && (currentUser.uid === 'HzhjlHCDAaMDnyLqcto6fDKcNtC3' || blogAuthorUID === currentUser.uid)) {
        return true; // Người dùng có quyền xóa
    }
    return false; // Người dùng không có quyền xóa
}

// Hàm tạo HTML để hiển thị một blog
function createBlog(blog) {
    const data = blog.data();
    blogSection.innerHTML += `
    <div class="blog-card">
        <img src="${data.bannerImage}" class="blog-image" alt="">
        <h1 class "blog-title">${data.title.substring(0, 100) + '...'}</h1>
        <p class="blog-overview">${data.article.substring(0, 200) + '...'}</p>
        <a href="/${blog.id}" class="btn dark">Read</a>
        <a href="/${blog.id}/editor" class="btn grey">Edit</a>
        <a href="#" onclick="deleteBlog('${blog.id}')" class="btn danger">Delete</a>
    </div>
    `;
}

// Hàm lấy và hiển thị blog của người dùng
function getUserWrittenBlogs() {
    const userEmail = auth.currentUser.email;
    db.collection("blogs").where("author", "==", userEmail)
        .get()
        .then((blogs) => {
            blogs.forEach(createBlog);
        })
        .catch((error) => console.log("Lỗi khi lấy bài viết", error));
}

// Hàm xử lý sự kiện khi người dùng nhấn nút "Login"
function handleLogin() {
    const username = usernameField.value;
    const password = passwordField.value;
    auth.signInWithEmailAndPassword(username, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("Đã đăng nhập với tài khoản: " + user.email);
            location.reload();
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Lỗi đăng nhập:", errorCode, errorMessage);
        });
}

// Hiển thị form đăng nhập
function showLoginForm() {
    loginButton.style.display = "block";
    usernameField.style.display = "block";
    passwordField.style.display = "block";
}

// Ẩn form đăng nhập
function hideLoginForm() {
    loginButton.style.display = "none";
    usernameField.style.display = "none";
    passwordField.style.display = "none";
}