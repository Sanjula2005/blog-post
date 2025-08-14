import bodyParser from "body-parser";
import express from "express";
import multer from "multer";
import path from "path";

const app = express();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder where images will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ storage: storage });

// EJS and Middleware
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads")); // Serve uploaded images

// Store posts in memory
let posts = [];

// Home route
app.get("/", (req, res) => {
  res.render("home", { posts: posts });
});

// New post page
app.get("/new", (req, res) => {
  res.render("new");
});

// Handle new post with image upload
app.post("/new", upload.single("image"), (req, res) => {
  const { title, content } = req.body;
  const id = Date.now().toString();
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  posts.push({ id, title, content, image });
  res.redirect("/");
});

// Edit post page
app.get("/edit/:id", (req, res) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) return res.send("Post not found");
  res.render("edit", { post });
});

// Handle post update (with optional image replacement)
app.post("/edit/:id", upload.single("image"), (req, res) => {
  const { title, content } = req.body;
  const newImage = req.file ? `/uploads/${req.file.filename}` : null;

  posts = posts.map((p) =>
    p.id === req.params.id
      ? { ...p, title, content, image: newImage || p.image }
      : p
  );
  res.redirect("/");
});

// Delete post
app.post("/delete/:id", (req, res) => {
  posts = posts.filter((p) => p.id !== req.params.id);
  res.redirect("/");
});

// Start server
app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
