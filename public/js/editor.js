// Lấy các phần tử DOM
const bannerImage = document.querySelector('#banner-upload');
const banner = document.querySelector('.banner');
const publishBtn = document.querySelector('.publish-btn');
const uploadInput = document.querySelector('#image-upload');
// Thay thế khu vực văn bản bằng phiên bản CKEditor


// Khởi tạo và thiết lập cho title editor
let titleEditor = document.querySelector('#title');
DecoupledEditor.create(titleEditor)
    .then(editor => {
        const toolbarContainer = document.querySelector('#title-toolbar-container');
        titleEditor = editor;
        toolbarContainer.appendChild(titleEditor.ui.view.toolbar.element);
    })
    .catch(error => {
        console.error(error);
    });

// Khởi tạo và thiết lập cho article editor
let articleEditor =document.querySelector('#article');
DecoupledEditor.create(articleEditor)
    .then(editor => {
        const toolbarContainer = document.querySelector('#article-toolbar-container');
        articleEditor = editor;
        toolbarContainer.appendChild(articleEditor.ui.view.toolbar.element);
    })
    .catch(error => {
        console.error(error);
    });

// Biến lưu đường dẫn banner
let bannerPath;

// Sự kiện thay đổi hình banner
bannerImage.addEventListener('change', () => uploadImage(bannerImage, 'banner'));

// Sự kiện thay đổi hình ảnh
uploadInput.addEventListener('change', () => uploadImage(uploadInput, 'image'));

// Hàm tải hình ảnh lên server
const uploadImage = (uploadFile, uploadType) => {
    const [file] = uploadFile.files;
    if (file && file.type.includes('image')) {
        const formData = new FormData();
        formData.append('image', file);

        fetch('/upload', {
            method: 'post',
            body: formData,
        })
            .then((res) => res.json())
            .then((data) => {
                if (uploadType === 'image') {
                    addImage(data, file.name);
                } else {
                    bannerPath = `${location.origin}/${data}`;
                    banner.style.backgroundImage = `url("${bannerPath}")`;
                }
            })
            .catch(() => alert('Lỗi upload ảnh.'));
    } else {
        alert('Chỉ upload file ảnh.');
    }
};

// Hàm thêm hình ảnh vào vị trí con trỏ
const addImage = (imagePath, alt) => {
    const curPos = articleField.selectionStart;
    const textToInsert = `\r![${alt}](${imagePath})\r`;
    articleField.value =
        articleField.value.slice(0, curPos) + textToInsert + articleField.value.slice(curPos);
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Xử lý sự kiện nút Publish
publishBtn.addEventListener('click', () => {
    if (titleEditor.getData().length && articleEditor.getData().length) {
        if (!bannerPath) {
            alert('Bạn cần phải upload ảnh banner!');
            return;
        }

        let docName;
        if (blogID[0] === 'editor') {
            // Tạo ID ngẫu nhiên nếu trong trình soạn thảo
            const letters = 'qwertyuiopasdfghjklzxcvbnm';
            let id = '';
            for (let i = 0; i < 5; i++) {
                id += letters[Math.floor(Math.random() * letters.length)];
            }
            docName = `blog-${id}-${auth.currentUser.uid}`;
        } else {
            docName = decodeURI(blogID[0]);
        }

        const date = new Date(); // Ngày xuất bản

        // Truy cập Firestore với db
        const blogData = {
            title: titleEditor.getData().toString(),
            article: articleEditor.getData().toString(),
            bannerImage: bannerPath,
            publishedAt: `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`,
            author: auth.currentUser.email,
            authorId: auth.currentUser.uid,
        };

        db.collection('blogs')
            .doc(docName)
            .set(blogData)
            .then(() => {
                location.href = `/${docName}`;
            })
            .catch((err) => {
                console.error(err);
            });
    } else {
        alert('Điền đủ thông tin Tiêu đề và nội dung Blog.');
    }
});


// Kiểm tra người dùng đã đăng nhập chưa
auth.onAuthStateChanged((user) => {
    if (!user) {
        location.replace('/admin');
    }
});

// Kiểm tra và chỉnh sửa blog đã tồn tại
let blogID = location.pathname.split('/');
blogID.shift();

if (blogID[0] !== 'editor') {
    const docRef = db.collection('blogs').doc(decodeURI(blogID[0]));
    docRef.get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            bannerPath = data.bannerImage;
            banner.style.backgroundImage = `url(${bannerPath})`;
            titleEditor.setData(data.title);
            articleEditor.setData(data.article);
        } else {
            location.replace('/');
        }
    });
}
