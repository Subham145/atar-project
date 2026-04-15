import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import PDFParser from "pdf2json";
import { extractWithGemini } from "./geminiExtractor.js";
import mongoose from "mongoose";
import InsurancePolicy from "./models/InsurancePolicy.js";
import User from "./models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");

dotenv.config(); // Loads .env - comment MONGODB_URI for local or whitelist Atlas IP
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// MongoDB connection - optional for dev
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/insurancepolicies";
let mongoConnected = false;

mongoose
  .connect(mongoUri)
  .then(() => {
    mongoConnected = true;
    console.log("✅ MongoDB connected");

    // Create default admin if not exists (optional)
    User.findOne({ email: "admin@test.com" })
      .then((user) => {
        if (!user) {
          const newUser = new User({
            email: "admin@test.com",
            password: "password",
          });
          newUser
            .save()
            .then(() => console.log("✅ Default admin user created"));
        } else {
          console.log("ℹ️ Admin user exists");
        }
      })
      .catch((err) => console.error("Default user create error:", err.message));
  })
  .catch((err) => {
    console.warn("⚠️ MongoDB connection failed:", err.message);
    console.log("⚠️ Running in offline mode — file uploads will not persist to database");
  });

const JWT_SECRET = process.env.JWT_SECRET || "supersecretchangeinprod";

const backendPublicUrl =
  process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 5001}`;

// In-memory storage for offline mode
const inMemoryUsers = new Map();
const inMemoryPolicies = []; // Store uploaded policies in memory for offline mode

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token missing" });
  }
  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const app = express();
// Enable CORS for the frontend origin (and allow preflight)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
// Also allow port 5174 as a fallback if port 5173 is in use
const allowedOrigins = [
  FRONTEND_ORIGIN,
  "http://localhost:5174",
  "http://192.168.1.7:5174",
  "http://192.168.1.7:5173"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
// Use a valid path pattern for OPTIONS to avoid path-to-regexp errors
// Note: do not add a separate OPTIONS route here — the `cors` middleware handles preflight requests.
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

// Health check (no auth required)
app.get("/health", (req, res) => {
  res.json({ status: "ok", mongoConnected });
});

// Auth routes
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    if (mongoConnected) {
      // Use MongoDB
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }

      const newUser = new User({ email, password });
      await newUser.save();

      const token = jwt.sign(
        { userId: newUser._id, email: newUser.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(201).json({
        token,
        user: { email: newUser.email, role: newUser.role },
      });
    } else {
      // Use in-memory storage
      if (inMemoryUsers.has(email)) {
        return res.status(409).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = `user-${Date.now()}`;
      inMemoryUsers.set(email, { userId, email, password: hashedPassword, role: "user" });

      const token = jwt.sign(
        { userId, email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(201).json({
        token,
        user: { email, role: "user" },
      });
    }
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ error: "Signup failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    if (mongoConnected) {
      // Use MongoDB
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.json({ token, user: { email: user.email, role: user.role } });
    } else {
      // Use in-memory storage
      const user = inMemoryUsers.get(email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user.userId, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.json({ token, user: { email: user.email, role: user.role } });
    }
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    if (mongoConnected) {
      const user = await User.findById(req.user.userId).select("-password");
      res.json(user);
    } else {
      // Use in-memory storage
      for (const [email, user] of inMemoryUsers.entries()) {
        if (user.userId === req.user.userId) {
          const { password, ...userData } = user;
          return res.json({ ...userData, _id: user.userId });
        }
      }
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

const port = process.env.PORT || 5000;
const upload = multer({ dest: uploadsDir });

app.post("/api/convert", authMiddleware, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const pdfParser = new PDFParser(null, 1);

  pdfParser.on("pdfParser_dataReady", async (pdfData) => {
    try {
      const rawText = pdfParser.getRawTextContent();

      const extractedData = await extractWithGemini(rawText);

      // Save to DB if MongoDB is connected, otherwise save to memory
      let savedPolicy = null;
      if (mongoConnected) {
        const policyData = {
          ...extractedData,
          source_file: req.file.originalname || req.file.filename,
          original_file_url: `${backendPublicUrl}/uploads/${req.file.filename}`,
        };
        savedPolicy = await InsurancePolicy.create(policyData);
      } else {
        // Store in memory for offline mode
        const policyId = "policy-" + Date.now();
        const inMemoryPolicy = {
          _id: policyId,
          ...extractedData,
          source_file: req.file.originalname || req.file.filename,
          original_file_url: `${backendPublicUrl}/uploads/${req.file.filename}`,
          createdAt: new Date(),
        };
        inMemoryPolicies.push(inMemoryPolicy);
        savedPolicy = inMemoryPolicy;
      }

      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        // Ignore unlink error, file can be cleaned later
      }

      res.json({
        ...extractedData,
        id: savedPolicy?._id || "temp-" + Date.now(),
        saved: mongoConnected,
      });
    } catch (error) {
      console.error("Convert route error:", error.message);
      res.status(500).json({
        error: error.message || "Gemini processing failed",
      });
    }
  });

  pdfParser.on("pdfParser_dataError", (errData) => {
    console.error("PDF parser error:", errData?.parserError);
    res.status(500).json({ error: "Failed to read PDF" });
  });

  pdfParser.loadPDF(req.file.path);
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/api/policies", authMiddleware, async (req, res) => {
  try {
    if (mongoConnected) {
      const policies = await InsurancePolicy.find()
        .sort({ createdAt: -1 })
        .limit(50);
      res.json(policies);
    } else {
      // Return in-memory policies sorted by createdAt descending
      const sortedPolicies = [...inMemoryPolicies].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      res.json(sortedPolicies);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/policies/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (mongoConnected) {
      const deleted = await InsurancePolicy.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Policy not found" });
      res.json({ message: "Policy deleted", id });
    } else {
      // Delete from in-memory storage
      const index = inMemoryPolicies.findIndex(p => p._id === id);
      if (index === -1) return res.status(404).json({ error: "Policy not found" });
      inMemoryPolicies.splice(index, 1);
      res.json({ message: "Policy deleted", id });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk delete policies
app.post("/api/policies/delete-bulk", authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No IDs provided" });
    }

    if (mongoConnected) {
      const result = await InsurancePolicy.deleteMany({ _id: { $in: ids } });
      res.json({
        message: `Deleted ${result.deletedCount} policies`,
        deletedCount: result.deletedCount,
      });
    } else {
      // Delete from in-memory storage
      let deletedCount = 0;
      for (const id of ids) {
        const index = inMemoryPolicies.findIndex(p => p._id === id);
        if (index !== -1) {
          inMemoryPolicies.splice(index, 1);
          deletedCount++;
        }
      }
      res.json({
        message: `Deleted ${deletedCount} policies`,
        deletedCount,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Backend listening on http://localhost:${port}`);
  console.log(`ℹ️  CORS allowed origins:`, allowedOrigins.join(", "));
});
