import express from 'express';
import Excel from "./create-excel/excel.js"
import fs, { copyFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PORT = 3008;

const app = express();
app.use(express.json({ limit: '50mb' }));

app.use(express.urlencoded({ limit: '50mb', extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

app.use(express.json());


const eliminatePath = (path, time)=>{
    setTimeout(()=>{
        fs.unlinkSync(`./reportes/${path}`);
    }, time)
    
}

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
        res.status(200).send("Archivo no encontrado, recuerde que el archivo se eliminara automaticamente ddespues de 24 horas.")
    }
})

app.post("/api/create-excel", async (req,res)=>{
    try {
        console.log("Estoy usando entrando en el body.")
        req.setTimeout(300000)
        let body = req.body;
        let data = await Excel.generateExcel(PORT, body);
        let downloadUrl = data.fileDonwload
        let filePath = data.filePath
        
        let response = {
            success: true,
            message: 'Excel generado correctamente',
            downloadUrl,
            filePath,
            size: `${(fs.statSync(data.filePath).size / (1024 * 1024)).toFixed(2)} MB`
        };
        console.log("response", response)
        res.json(response);
        
        // eliminatePath(data.fileName, 1440 * 1000);
        eliminatePath(data.fileName, 50 * 1000);
    } catch (error) {
        req.status(500).send(error.stack)
    }
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor activo en http://149.130.162.8:${PORT}`);
  });