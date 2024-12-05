const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Middleware Configuration
app.use(cors());
app.use(express.json());

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  },
});

// ROUTES //
app.get("/", (req, res) => {
  res.send("Aviation AI Backend is running!");
});

app.post("/upload", upload.single("pdf"), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "No file uploaded" });
  }
  res.send({ message: "File uploaded successfully", filePath: req.file.path });
});

app.post("/parse", async (req, res) => {
  const filePath = path.join(__dirname, "uploads", path.basename(req.body.fileName));

  if (!fs.existsSync(filePath)) {
    return res.status(404).send({ message: "File not found" });
  }

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(fileBuffer);
    res.send({ content: data.text });
  } catch (error) {
    console.error("Error parsing PDF:", error);
    res.status(500).send({ message: "Failed to parse PDF", error: error.message });
  }
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
