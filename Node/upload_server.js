const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3003;

// 配置文件上传目录和文件名
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/'); // 文件上传到./uploads/目录
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

// 设置静态文件夹以提供上传的文件
app.use(express.static(path.join(__dirname, 'uploads')));

// 处理文件上传的POST请求
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('没有文件被上传。');
  }
  res.send('文件上传成功！');
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
