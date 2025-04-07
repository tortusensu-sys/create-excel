import Exceljs from "exceljs";
import fs from "fs";
import path from "path";
import {fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

const title = (sheet, body)=>{
    let title = JSON.parse(body.rptWords);
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

const generate = (transaction) =>{
    let body = JSON.parse(transaction);
    
    for (let i = 0; i < 500000; i++) {
    // for (let i = 0; i < 50; i++) {
        body.push(body[0])
    }
    return body;
}

const insertRows = async(body, sheet)=>{

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
    while (progress < TOTAL_ROWS) {
        let batch = body.slice(progress, progress + size);

        batch.forEach(element=>{
            let arrayTmp = element.map(e => e.value);
            
            sheet.addRow(arrayTmp).commit();

            progress++;
        });

        if (progress % 100000 === 0 || progress === TOTAL_ROWS) {
            console.log(`Procesadas ${progress}/${TOTAL_ROWS} filas`);
            await new Promise(resolve => setImmediate(resolve));
        }
    }
}

const generateExcel = async(port, body)=>{
    let date = new Date();
    const fileName = `Reporte${date.getMilliseconds()}.xlsx`;
    const filePath = path.join(__dirname, "../reportes", fileName);
    const fileStram = fs.createWriteStream(filePath);
    const workbook = new Exceljs.stream.xlsx.WorkbookWriter({
        stream: fileStram,
        useSharedStrings: false,
        useStyles: true
    })
    
    const sheet = workbook.addWorksheet("Mi Excel");
    title(sheet, body)
    let header = JSON.parse(body.headers)
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
    let dataBody = generate(body.transactions);
    await insertRows(dataBody, sheet)
    
    await workbook.commit();
    fileStram.end();

    return {
        "fileName": fileName,
        "filePath": filePath,
        "fileDonwload": `/api/download/${fileName}`
    }
}

export default {generateExcel}