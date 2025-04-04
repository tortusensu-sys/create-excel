import express from 'express';
import Excel from "./create-excel/excel.js"
import fs, { copyFileSync } from "fs";
import path from "path";
import {fileURLToPath } from "url";

const PORT = 3008;

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

app.use(express.json());

app.get("/", async(req, res)=>{
    try {
        console.log("todo correcto")
        res.status(200).send("Holla mi kinggg")
        
    } catch (error) {
        console.log("error", error)
        console.log("error stack", error.stack)
    }
})

app.get("/api/download/:fileName", async(req, res)=>{
    try {
        let url = path.join(__dirname, "./reportes", req.params.fileName)
        console.log("todo correcto")
        res.status(200).download(url)
        
    } catch (error) {
        console.log("error", error)
        console.log("error stack", error.stack)
    }
})

app.post("/api/create-excel", async (req,res)=>{
    req.setTimeout(300000)
    let data = await Excel.generateExcel(PORT);
    let downloadUrl = data.fileDonwload
    let filePath = data.filePath
    let response = {
        success: true,
        message: 'Excel generado con streams',
        downloadUrl,
        filePath,
        size: `${(fs.statSync(data.filePath).size / (1024 * 1024)).toFixed(2)} MB`
    };
    console.log("response", response)
    res.json(response);
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor activo en http://0.0.0.0:${PORT}`);
  });