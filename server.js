import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// DB Connection
connectDB();

// Middleware
app.set('view engine', 'ejs');
app.use(express.json());
app.use(cors({ credentials: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
   res.send('Welcome to the Home Page!');
});

app.use('/user', authRouter); // For /user/register, /user/login, etc.

// Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
