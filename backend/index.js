const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads and processed directories exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}
if (!fs.existsSync("processed")) {
  fs.mkdirSync("processed");
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
    if (file.mimetype !== "text/plain") {
      return cb(new Error("Only plain text files are allowed"));
    }
    cb(null, true);
  },
});

// ROUTES //
// Homepage Route
app.get("/", (req, res) => {
  res.send("Aviation AI Backend is running!");
});

// File Upload Route
app.post("/upload", upload.single("txt"), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "No file uploaded" });
  }
  res.send({ message: "File uploaded successfully", filePath: req.file.path });
});

// Preprocess Route for Plain Text Files
app.post("/preprocess", (req, res) => {
  const filePath = path.join(__dirname, "uploads", path.basename(req.body.fileName));
  const outputPath = path.join(__dirname, "processed", `${path.basename(req.body.fileName, ".txt")}.json`);

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).send({ message: "File not found" });
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n").map((line, index) => ({ line: index + 1, text: line.trim() }));

    // Write to JSON file
    fs.writeFileSync(outputPath, JSON.stringify(lines, null, 2));
    res.send({ message: "Preprocessing complete", outputFilePath: outputPath });
  } catch (error) {
    console.error("Error preprocessing text file:", error);
    res.status(500).send({ message: "Failed to preprocess text file", error: error.message });
  }
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
