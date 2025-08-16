import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { ENV } from "./config/env.js";
import { testConnection } from "./db/db.js";
import userRoutes from "./routes/users.js";
import locationRoutes from "./routes/locations.js";
import beaconRoutes from "./routes/beacons.js";

const app = express();
const PORT = ENV.PORT || 3001;

//security middleware
app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        succes: false,
        error: "Too many requests, please try again later."
    }
});
app.use('/api', limiter);

//stricter rate limiting fro auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        error: "Too many authentication attempts, please try again later."
    }
});
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection on startup
testConnection();

// Routes
app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to LocIndoor API" });
});


app.get("/api/health", (req, res) => {
    res.status(200).json({ success: true, message: "Server is healthy" });
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/beacons", beaconRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log("🚀 Server is running on port:", PORT);
    console.log("📊 API Documentation: http://localhost:" + PORT + "/api");
});