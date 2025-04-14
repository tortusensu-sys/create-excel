import express from 'express'; 
import Create from './create/excel-create.js';
import fs, { copyFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PORT = 3008;

const app = express();
app.use(express.json({ limit: '10000mb' }));

app.use(express.urlencoded({ limit: '10000mb', extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

app.use(express.json());


const eliminatePath = (path, time)=>{
    setTimeout(()=>{
        fs.unlinkSync(`./reportes/${path}`);
    }, time)
    
}

app.post("/api/init-excel", async(req, res)=>{
    try {
        let header = req.body;
        await Create.initExcel(header)
        console.log("todo correcto")
        res.status(200).send("Se generó la cabecera correctamente")
        
    } catch (error) {
        console.log("error", error)
        console.log("error stack", error.stack)
    }
})

app.post("/api/create-body", async(req, res)=>{
    
    try {
        let body = req.body;
        await Create.constructionExcel(body)
        res.status(200).send("Se genero el chunk correctamente")
        
    } catch (error) {
        console.log("error", error)
        console.log("error stack", error.stack)
    }
})

app.get("/api/end-excel", async(req, res)=>{
    try {
        let data = await Create.endExcel();
        let downloadUrl = data.fileDonwload
        let filePath = data.filePath
    
        let response = {
            success: true,
            message: 'Excel generado correctamente, recuerda que la descarga se eliminara 24 h de su creación',
            downloadUrl,
            filePath,
            size: `${(fs.statSync(filePath).size / (1024 * 1024)).toFixed(2)} MB`
        };
        console.log("todo correcto" + response)
        res.status(200).json(response)
        
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

// app.post("/api/create-excel", async (req,res)=>{
//     try {
//         console.log("Estoy usando entrando en el body.")
//         req.setTimeout(300000)
//         let body = req.body;
//         if (body.sumCount === body.count) {
//             // dataArray.push(body);
//             fs.writeFileSync(path.join(__dirname, `./tmp/file${body.sumCount}.json`), JSON.stringify(body))
//             console.log("sumaaaaaa",body.sumCount)
//             // res.status(200).send(dataArray.length)
//             let data = await Excel.generateExcel(PORT, body.count);
//             let downloadUrl = data.fileDonwload
//             let filePath = data.filePath
            
//             let response = {
//                 success: true,
//                 message: 'Excel generado correctamente, recuerda que la descarga se eliminara 24 h de su creación',
//                 downloadUrl,
//                 filePath,
//                 size: `${(fs.statSync(data.filePath).size / (1024 * 1024)).toFixed(2)} MB`
//             };
//             console.log("response", response)
//             res.status(200).json(response);
            
//             eliminatePath(data.fileName, 86400 * 1000);
            
//         }else{
//             console.log("sumaaaaaa",body.sumCount)
//             fs.writeFileSync(path.join(__dirname, `./tmp/file${body.sumCount}.json`), JSON.stringify(body));
//             res.status(200).send("La data se esta cargando")
//         }
//         // eliminatePath(data.fileName, 50 * 1000);
//     } catch (error) {
//         console.log("error", error)
//         console.log("error stack ", error.stack)
//         res.status(500).send(error.stack)
//     }
// })

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor activo en http://149.130.162.8:${PORT}`);
});