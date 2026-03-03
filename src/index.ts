import express from "express";
import identifyRouter from './routes/identify'

const app = express();
app.use(express.json());
app.use(identifyRouter);
app.listen(5000, () => {
    console.log("Server started on port 5000");
}).on('error', (err: Error) => {
    console.error("Server error:", err);
});