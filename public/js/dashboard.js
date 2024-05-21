

// Tạo đối tượng FirebaseUI AuthUI với đối tượng xác thực Firebase đã khởi tạo trước đó
let ui = new firebaseui.auth.AuthUI(auth);

// Lấy ra phần tử HTML một lần và sử dụng chúng sau đó
const form = document.getElementById('form');
const login = document.querySelector('.login');
const register = document.querySelector('.register');
const loginButton = document.getElementById("loginButton");
const emailLogin = document.getElementById("emailLogin");
const passwordLogin = document.getElementById("passwordLogin");
const registerButton = document.getElementById("registerButton");
const emailRegister = document.getElementById("emailRegister");
const passwordRegister = document.getElementById("passwordRegister");
const blogSection = document.querySelector('.blogs-section');
const toggleForm = document.getElementById('toggleForm');

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
        if (user.email === 'adminblog@gmail.com') getAllBlogs();
        else getUserWrittenBlogs();
        hideLoginForm();
    } else {
        // Nếu người dùng chưa đăng nhập
        showLoginForm();
    }
});

// Hàm xử lý sự kiện khi người dùng nhấn nút "Login"
loginButton.addEventListener("click", handleLogin);

// Hàm xử lý sự kiện khi người dùng nhấn nút "Register"
registerButton.addEventListener("click", handleRegister);

//Hàm xử lý sự kiện khi người dùng nhấn nút "Toggle"
toggleForm.addEventListener('click', handleToggleForm)

// Hàm xóa một blog
function deleteBlog(id) {
    db.collection('blogs')
        .doc(id)
        .get()
        .then((doc) => {
            const blogData = doc.data();
            if (userHasPermissionToDelete(blogData.authorId)) { // Kiểm tra xem người dùng có phải là tác giả của bài viết không
                db.collection("blogs")
                    .doc(id)
                    .delete()
                    .then(() => location.reload())
                    .catch((error) => console.log("Error deleting the blog", error));
            } else {
                alert("Bạn không có quyền xóa bài viết này.");
            }
        })
}

// Hàm kiểm tra xem người dùng có quyền xóa bài viết
function userHasPermissionToDelete(blogAuthorUID) {
    const currentUser = auth.currentUser;
    if (currentUser && (currentUser.uid === 'O2LgF9TAr7hoe1xbOR4zWRirRt43' || blogAuthorUID === currentUser.uid)) {
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
    const email = emailLogin.value;
    const password = passwordLogin.value;
    auth.signInWithEmailAndPassword(email, password)
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

// Hàm xử lý sự kiện khi người dùng nhấn nút "Register"
function handleRegister() {
    const email = emailRegister.value;
    const password = passwordRegister.value;

    // Kiểm tra xem email đã tồn tại chưa
    auth.fetchSignInMethodsForEmail(email)
        .then((signInMethods) => {
            if (signInMethods.length > 0) {
                // Email đã tồn tại
                alert("Email đã tồn tại. Vui lòng sử dụng email khác.");
            } else {
                // Email chưa tồn tại, tiến hành đăng ký
                return auth.createUserWithEmailAndPassword(email, password);
            }
        })
        .then((userCredential) => {
            if (userCredential) {
                const user = userCredential.user;
                console.log("Đã đăng ký tài khoản với email: " + user.email);
                location.reload();
            }
        })
        .catch((error) => {
            if (error.code === 'auth/email-already-in-use') {
                alert('Email đã tồn tại. Vui lòng sử dụng email khác.');
            } else {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error("Lỗi đăng ký:", errorCode, errorMessage);
            }
        });
}


// Hàm xử lý sự kiện khi người dùng nhấn nút "Toggle"
function handleToggleForm() {
    if (login.classList.contains('active')) {
        login.classList.remove('active');
        register.classList.add('active');
        toggleForm.textContent = "Tôi đã có tài khoản? Đăng nhập";
    } else {
        login.classList.add('active');
        register.classList.remove('active');
        toggleForm.textContent = "Tôi chưa có tài khoản? Đăng ký";
    }
}

// Hiển thị form resgister/login
function showLoginForm() {
    form.style.display = 'block';
}

// Ẩn form register/login
function hideLoginForm() {
    form.style.display = 'none';
}