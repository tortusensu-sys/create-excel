import Exceljs from "exceljs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

let date = new Date();
let fileName = "";
// const fileName = `ReportePrueba.xlsx`;
let filePath = null;
let fileStram = null;

let workbook = null;
let sheet   = null ;


const title = (sheet, header)=>{
    let title = JSON.parse(header.rptWords);
    let dataTitle = Object.values(title)
    sheet.getCell("B2").value = dataTitle[0];
    sheet.getCell('B2').style = {
        font: {
          name: 'Arial',
          size: 10,
          bold: true
        },
      }

    for (let i = 1; i <= dataTitle.length; i++) {
        sheet.getCell(`B${3+i}`).value = dataTitle[i];
        sheet.getCell(`B${3+i}`).style = {
            font: {
              name: 'Arial',
              size: 9,
              bold: true
            },
          }
    }

}

const initExcel = async(dataHeader) =>{
    console.log("Iniciando la generación del Excel ......");
    
    fileName = `Reporte${date.getMilliseconds()}.xlsx`;
    filePath = path.join(__dirname, "../reportes", fileName);
    fileStram = fs.createWriteStream(filePath);
    workbook = new Exceljs.stream.xlsx.WorkbookWriter({
        stream: fileStram,
        useSharedStrings: false,
        useStyles: true
    })
    sheet = workbook.addWorksheet("Mi Excel");
    title(sheet, dataHeader)
    let header = JSON.parse(dataHeader.headers)
    let rowHeaders = sheet.addRow(header);
    let headerStyle = { 
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        },
        fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFC8E6C9' } 
        },
    }
    rowHeaders.eachCell(cell =>{
        cell.border = headerStyle.border;
        cell.fill = headerStyle.fill
    })

    rowHeaders.commit();

    console.log("Insersión de la cabecera .............")

}

const constructionExcel = async(body)=>{
    console.log("Comenzando ingresar los valores............")
    body = JSON.parse(body.data)
    sheet.columns = sheet.columns.map(column => {
        return {
            ...column,
            style: { 
                border: {
                  top: { style: 'thin' },
                  left: { style: 'thin' },
                  bottom: { style: 'thin' },
                  right: { style: 'thin' }
                }
              }
        };
    });

    let size = 50000;
    let progress = 0;
    const TOTAL_ROWS = body.length;
    console.log("total", TOTAL_ROWS) 
    while (progress < TOTAL_ROWS) {
        let batch = body.slice(progress, progress + size);
        batch.forEach(element=>{
            let arrayTmp = element.map(e => e.value);
            
            sheet.addRow(arrayTmp).commit();

            progress++;
        });

        // if (progress % 100000 === 0 || progress === TOTAL_ROWS) {
        //     console.log(`Procesadas ${progress}/${TOTAL_ROWS} filas`);
        //     await new Promise(resolve => setImmediate(resolve));
        // }
    }

    console.log("Terminando el relleno de este chunk......")
}

const endExcel = async()=>{
    console.log("Iniciando la creación del archivo.............")
    await workbook.commit();
    let fileNameFinal = fileName;
    fileName = ""
    workbook = null;
    sheet = null;
    fileStram.end();
    console.log("Terminando la creación del excel ........")
    return {
        "fileName": fileNameFinal,
        "filePath": filePath,
        "fileDonwload": `http://149.130.162.8:3008/api/download/${fileName}`
    }

}

export default {initExcel, constructionExcel, endExcel}