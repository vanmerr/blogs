// Import các module cần thiết
const express = require('express');
const path = require('path');
const fileupload = require('express-fileupload');

// Xác định đường dẫn thư mục gốc (public là thư mục chứa các tệp tĩnh)
let initial_path = path.join(__dirname, "public/");

// Khởi tạo một ứng dụng Express
const app = express();

// Sử dụng middleware express.static để phục vụ các tệp tĩnh từ thư mục public
app.use(express.static(initial_path));

// Sử dụng middleware express-fileupload để xử lý tải lên tệp tin
app.use(fileupload());

// Định nghĩa route GET "/" để trả về trang chủ (home.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(initial_path, "home.html"));
})

// Định nghĩa route GET "/editor" để trả về trang chỉnh sửa (editor.html)
app.get('/editor', (req, res) => {
    res.sendFile(path.join(initial_path, "editor.html"));
})

// Định nghĩa route GET "/about" để trả về trang giới thiệu (about.html)
app.get('/about', (req, res) => {
    res.sendFile(path.join(initial_path, "about.html"));
})

// Định nghĩa route POST "/upload" để xử lý tải lên tệp tin và trả về đường dẫn của tệp đã tải lên
app.post('/upload', (req, res) => {
    // Lấy thông tin của tệp tin từ request
    let file = req.files.image;   
    // Lấy thời gian hiện tại để tạo tên cho tệp tin
    let date = new Date();
    let imagename = date.getDate() + date.getTime() + file.name;
    
    // Đường dẫn lưu trữ tệp tin đã tải lên
    let path = 'public/uploads/' + imagename;

    // Tiến hành tải lên tệp tin
    file.mv(path, (err, result) => {
        if(err){
            throw err; // Nếu có lỗi, ném lỗi ra ngoài
        } else{
            // Trả về đường dẫn của tệp tin đã tải lên dưới dạng JSON
            res.json(`uploads/${imagename}`)
        }
    })
})

// Định nghĩa route GET "/admin" để trả về trang quản trị (dashboard.html)
app.get("/admin", (req, res) => {
    res.sendFile(path.join(initial_path, "dashboard.html"));
})

// Định nghĩa route GET "/:blog" để trả về trang blog (blog.html) hoặc trang chỉnh sửa blog (editor.html)
app.get("/:blog", (req, res) => {
    res.sendFile(path.join(initial_path, "blog.html"));
})

app.get("/:blog/editor", (req, res) => {
    res.sendFile(path.join(initial_path, "editor.html"));
})

// Xử lý các request không khớp với bất kỳ route nào và trả về chuỗi "404" để báo lỗi
app.use((req, res) => {
    res.json("404");
})

// Khởi động máy chủ và lắng nghe các kết nối đến cổng được chỉ định (hoặc cổng mặc định 3000) và hiển thị thông báo "listening......" khi máy chủ đã sẵn sàng.
app.listen(process.env.PORT || 3000, () => {
    console.log('listening......');
})