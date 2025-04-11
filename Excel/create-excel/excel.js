import Exceljs from "exceljs";
import fs from "fs/promises";
import fsStream from "fs";
import * as JSONStream from 'jsonstream';
import path, { parse } from "path";
import { fileURLToPath } from "url";
import { Transform  } from "stream";


const __dirname = path.dirname(fileURLToPath(import.meta.url));

const title = (sheet, body) => {
    let dataTitle = Object.values(JSON.parse(body.rptWords));
    sheet.getCell("B2").value = dataTitle[0];
    sheet.getCell("B2").style = {
        font: {
            name: "Arial",
            size: 10,
            bold: true,
        },
    };

    for (let i = 1; i <= dataTitle.length; i++) {
        sheet.getCell(`B${3 + i}`).value = dataTitle[i];
        sheet.getCell(`B${3 + i}`).style = {
            font: {
                name: "Arial",
                size: 9,
                bold: true,
            },
        };
    }
};

const insertRows = async (body, sheet) => {
    sheet.columns = sheet.columns.map((column) => {
        return {
            ...column,
            style: {
                border: {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                },
            },
        };
    });

    let size = 50000;
    let progress = 0;
    const TOTAL_ROWS = body.length;
    console.log("total", TOTAL_ROWS);
    while (progress < TOTAL_ROWS) {
        let batch = body.slice(progress, progress + size);
        batch.forEach((element) => {
            let arrayTmp = element.map((e) => e.value);

            sheet.addRow(arrayTmp).commit();

            progress++;
        });

        if (progress % 100000 === 0 || progress === TOTAL_ROWS) {
            console.log(`Procesadas ${progress}/${TOTAL_ROWS} filas`);
            await new Promise((resolve) => setImmediate(resolve));
        }
    }
    console.log("Termino insertar filas ...........")
};

// const processLargeFile = async (filePath, transactions) => {
//     console.log("Iniciando proceso ........");
//     const fileStream = fsStream.createReadStream(filePath, { encoding: 'utf8' });

//     const parser = JSONStream.parse('transactions');

//     fileStream.pipe(parser);
//     parser.on('data', (chunk) => {
//         try {
//             transactions.push(...JSON.parse(chunk)); 
//         } catch (err) {
//             console.error("Error al parsear:", err);
//         }
//     });

//     return new Promise((resolve, reject) => {
//         parser.on('end', () => {
//             console.log("Procesamiento completado");
//             resolve();
//         });

//         parser.on('error', (err) => {
//             console.error("Error en el parser:", err);
//             reject(err);
//         });
//     });
// };

const processLargeFile = (filePath, data) => {
    return new Promise((resolve, reject) => {
        const fileStream = fsStream.createReadStream(filePath, { encoding: 'utf8' });
        
        const parser = JSONStream.parse('transactions');
        
        const transformer = new Transform({
            objectMode: true,
            transform(chunk, encoding, callback) {
                try {
                    const parsedTransactions = JSON.parse(chunk);
                    // console.log("parsedTransactions", parsedTransactions)
                    data.push(...parsedTransactions);
                    callback();
                } catch (err) {
                    callback(err);
                }
            }
        });

        fileStream
            .pipe(parser)
            .pipe(transformer)
            .on('finish', () => {
                resolve(data);
            })
            .on('error', reject);
    });
};

const generateExcel = async (count) => {
    try {
        console.log("Iniciando la generación del Excel ......");
        let testinHeader = JSON.parse(
            await fs.readFile(path.join(__dirname, `../tmp/file1.json`), "utf8")
        );
    
        let date = new Date();
        const fileName = `Reporte${date.getMilliseconds()}.xlsx`;
        const filePath = path.join(__dirname, "../reportes", fileName);
        const fileStram = fsStream.createWriteStream(filePath);
        const workbook = new Exceljs.stream.xlsx.WorkbookWriter({
            stream: fileStram,
            useSharedStrings: false,
            useStyles: true,
        });
        const sheet = workbook.addWorksheet("Mi Excel");

        //Comienzo hacer mi cabecera
        title(sheet, testinHeader);
        let rowHeaders = sheet.addRow(JSON.parse(testinHeader.headers));
        let headerStyle = {
            border: {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            },
            fill: {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFC8E6C9" },
            },
        };
        rowHeaders.eachCell((cell) => {
            cell.border = headerStyle.border;
            cell.fill = headerStyle.fill;
        });
        rowHeaders.commit();

        //comienzo a construir mi cuerpo 
        let dataBody = [];
        for (let i = 1; i <= count; i++) {
            let pathtemp = path.resolve(__dirname, `../tmp/file${i}.json`)
            try {
                await processLargeFile(pathtemp, dataBody);
                
            } catch (err) {
                console.error("Error:", err.message);
            }
            console.log("conteo "+ i)
        }
        await Promise.all(dataBody)
        console.log("dataBody lenhgth", dataBody.length)
        await insertRows(dataBody, sheet);
        await workbook.commit();
        fileStram.end();
        return {
            fileName: fileName,
            filePath: filePath,
            fileDonwload: `http://149.130.162.8:3008/api/download/${fileName}`,
        };
    } catch (error) {
        console.log("Error", error)
    }
};

export default { generateExcel };
