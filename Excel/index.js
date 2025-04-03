import express from 'express';
import Excel from "./create-excel/excel.js"
import fs from "fs";

const PORT = 3001;

const app = express();

app.use(express.json());

app.get("/", async(req, res)=>{
    let data = await Excel.generateExcel(PORT);
    res.download(data.filePath, data.fileName, (err)=>{
        if (err) {
            console.log("Ocurrio un error", err)
        }
        fs.unlink(data.filePath, ()=>{})
    });
})

app.post("/api/create-excel", async (req,res)=>{
    req.setTimeout(300000)
    let data = await Excel.generateExcel(PORT);
    let downloadUrl = data.fileDonwload
    let filePath = data.filePath
    res.json({
        success: true,
        message: 'Excel generado con streams',
        downloadUrl,
        filePath,
        size: `${(fs.statSync(data.filePath).size / (1024 * 1024)).toFixed(2)} MB`
      });
})

app.listen(PORT, async()=>{
    // console.log( await Excel.generateExcel())
    console.log(`este es el ejemplo de  ${PORT}`)
})