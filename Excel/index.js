import express from 'express';
import Excel from "./create-excel/excel.js"
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PORT = 3008;

const app = express();
app.use(express.json({ limit: '10000mb' }));

app.use(express.urlencoded({ limit: '10000mb', extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)
let testingArray = [];

let dataArray = [];
app.use(express.json());


const eliminatePath = (path, time) => {
    setTimeout(() => {
        fs.unlinkSync(`./reportes/${path}`);
    }, time)

}

app.get("/", async (req, res) => {
    try {
        console.log("todo correcto")
        res.status(200).send("Holla mi kinggg")

    } catch (error) {
        console.log("error", error)
        console.log("error stack", error.stack)
    }
})

app.get("/api/download/:fileName", async (req, res) => {
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

app.post("/api/prueba", async (req, res) => {
    try {
        let body = req.body;
        if (body.valor == body.cantidad) {
            testingArray.push(body.data);
            res.status(200).send(JSON.stringify(testingArray))
            testingArray = [];
        } else {
            testingArray.push(body.data);
            res.status(200).send("ingresado correctamente")
        }

    } catch (error) {
        res.status(400).send(error.stack)
    }
})

app.post("/api/create-excel", async (req, res) => {
    try {
        console.log("Estoy usando entrando en el body.")
        req.setTimeout(300000)
        let body = req.body;
        let filePath = path.join(__dirname, `./tmp/file${body.sumCount}.json`);
        let jsonData = JSON.stringify(body);
        const writeStream = fs.createWriteStream(filePath);
        writeStream.write(jsonData);
        writeStream.end();

        writeStream.on("finish", async () => {
            if (body.sumCount === body.count) {
                console.log("sumaaaaaa", body.sumCount)
                let data = await Excel.generateExcel(body.count);
                let downloadUrl = data.fileDonwload
                let filePath = data.filePath

                let response = {
                    success: true,
                    message: 'Excel generado correctamente, recuerda que la descarga se eliminara 24 h de su creación',
                    downloadUrl,
                    filePath,
                    size: `${(fs.statSync(data.filePath).size / (1024 * 1024)).toFixed(2)} MB`
                };
                console.log("response", response)
                res.status(200).json(response);

                eliminatePath(data.fileName, 86400 * 1000);

            } else {
                console.log("sumaaaaaa", body.sumCount)
                res.status(200).send("La data se esta cargando")
            }
        })

        writeStream.on("error", (error) => {
            console.error("Error al guardar archivo: ", err);
            res.status(500).send("Error al guardar archivo");
        })
    } catch (error) {
        console.log("error", error)
        console.log("error stack ", error.stack)
        res.status(500).send(error.stack)
    }
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor activo en http://149.130.162.8:${PORT}`);
});