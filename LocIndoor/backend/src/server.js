import express from "express";
import { ENV } from "./config/env.js";

const app = express();
const PORT = ENV.PORT;

app.listen(PORT, () =>{
    console.log("Server is running123 on port: ", PORT)
});