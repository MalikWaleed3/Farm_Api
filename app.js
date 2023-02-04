const express = require("express");
const multer = require("multer");
const path = require("path");
const uuid = require("uuid").v4;
const fs = require("fs");
const { readFile } = require("./util");
const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, uuid() + path.extname(file.originalname));
  },
});

const upload = multer({
  dest: "uploads/",
  storage: storage,
  limits: { fileSize: 1024*1024*5 },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }
    cb(undefined, true);
  },
});

app.post("/api/images", upload.single("image"), (req, res) => {
  const metadata = {
    id: req.file.filename.split(".")[0],
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
    path: req.file.path,
    size: req.file.size,
    url: `${process.env.URL || "http://localhost:3000"}/uploads/${req.file.filename}`,
  };

  // write to db.json
  readFile("db.json", (err, data) => {
    if (err) res.sendStatus(500);
    data.push(metadata);
    fs.writeFile("db.json", JSON.stringify(data), (err) => {
      if (err) res.sendStatus(500);
      res.json({ ...metadata });
    });
  });
});

app.get("/api/images/:id", (req, res) => {
  const { id } = req.params;
  readFile("db.json", (err, data) => {
    if (err) res.sendStatus(500);
    const image = data.find((image) => image.id === id);
    if (!image) return res.sendStatus(404);
    res.json(image);
  });
});

app.get("/uploads/:id", (req, res) => {
  const { id } = req.params;
  readFile("db.json", (err, data) => {
    if (err) res.sendStatus(500);
    const image = data.find((image) => image.filename === id);
    if (!image) return res.sendStatus(404);
    res.sendFile(path.join(__dirname, image.path));
  });
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
