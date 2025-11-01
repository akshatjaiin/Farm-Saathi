import express from "express";
import cors from "cors";
import mongoose from "mongoose";


// import routers
import layoutRouter from "./routes/layout_routes.js";
import userRouter from "./routes/user_routes.js";

// create express-app
const app = express();
app.use(express.json());

// Configure CORS to allow GitHub Codespaces preview origins and local dev
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, or same-origin)
        if (!origin) return callback(null, true);
        
        // Allow GitHub Codespaces preview domains and localhost
        const allowedOrigins = [
            /^https:\/\/.*\.app\.github\.dev$/,  // All GitHub Codespaces preview URLs
            'http://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000'
        ];
        
        const isAllowed = allowedOrigins.some(pattern => {
            if (pattern instanceof RegExp) {
                return pattern.test(origin);
            }
            return pattern === origin;
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(null, true); // Still allow for development - change to false in production
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
// Explicitly handle preflight requests for all routes
app.options('*', cors(corsOptions));

// // import environment variables in root on backend 
// import dotenv from 'dotenv';
// dotenv.config();
// console.log("OpenAI API Key:", process.env.OPENAI_API_KEY);

// include imported routes
app.use("/layout", layoutRouter);
app.use("/", userRouter);


// TBD: create route that imports ml funcs loads data, train model, gets predictions




// connection string with  db-user=admin, db-password
mongoose.connect("mongodb+srv://admin:53tx0WLftZcxANGe@farmstartcluster.qnr2s.mongodb.net/?retryWrites=true&w=majority&appName=farmStartCluster")
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.log("Error connecting to MongoDB:", err));




app.listen(3001, () => console.log("Sever Started Running on 3001."));