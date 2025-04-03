import Exceljs from "exceljs";
import fs from "fs";
import path from "path";
import {fileURLToPath } from "url";


let data = {
    "rptWords": "{\"title\":\"AVLA CL - Grouped Invoice Report\",\"periodRange\":\"Period range\",\"compName\":\"Company Name\"}",
    "parameters": "{\"subsidiaryId\":\"25\",\"reportType\":\"2\",\"nameReport\":\"AVLA CL - Grouped Invoice Report\",\"extractionType\":\"2\",\"startDate\":\"\",\"endDate\":\"28/3/2025\",\"mainLine\":\"1\",\"saleGreen\":\"F\",\"arrAccount\":[\"7151\"],\"entityId\":\"0\",\"status\":\"\",\"idFolder\":380203,\"idEmployee\":4560,\"genLogId\":248}",
    "subsidiary": "{\"name\":\"Avla  Seguros de Crédito y Garantía S.A.\",\"sbTaxRegNum\":\"76363534\"}",
    "headers": "[\"Date\",\"Fecha Vencimiento\",\"Type\",\"Cuenta por Cobrar\",\"Internal ID\",\"Document Number\",\"Nombre del Cliente...\",\"Status\",\"Memo\",\"Currency\",\"Subtotal\",\"IVA\",\"Total\",\"Nro Poliza\",\"Nro Movimiento\",\"Proyecto\",\"Fecha Inicio Poliza\",\"Fecha fin Poliza\",\"Tipo cambio ori\",\"Moneda Ori\",\"Total Moneda Ori\",\"Total Pago Mon Ori\",\"Fecha Pago\",\"AVLA - N° PAGO RELACIONADO\",\"NRO Cuota AVLA\",\"Monto cuota CLP\",\"Revaluacion Cuota\",\"Cuota Actualizada\",\"Cuota Mon Ori\",\"Fecha Venc Cuota\",\"Nro Poliza Cuota\",\"Importe Ori Aplicado\",\"Latam - Document Date Ref\",\"Latam - Document Number Ref\",\"Installment Number\",\"Estado Cuota\",\"Amount Paid\",\"Amount Paid\",\"AVLA - Total Pago CLP\"]",
    "transactions": "[[{\"name\":\"Date\",\"value\":\"31/12/2024\"},{\"name\":\"Fecha Vencimiento\",\"value\":\"30/7/2025\"},{\"name\":\"Type\",\"value\":\"CustInvc\"},{\"name\":\"Cuenta por Cobrar\",\"value\":\"1104012201 CUENTAS POR COBRAR : PRIMA POR COBRAR CH\"},{\"name\":\"Internal ID\",\"value\":\"1159476\"},{\"name\":\"Document Number\",\"value\":\"FV-22222772\"},{\"name\":\"Nombre del Cliente...\",\"value\":\"12584 HECTOR ALEXIS VIVERO MOLINA\"},{\"name\":\"Status\",\"value\":\"Open\"},{\"name\":\"Memo\",\"value\":\"Saldo Inicial Prima en cuotas MH|Fac:186512|Fec:28/02/2023\"},{\"name\":\"Currency\",\"value\":\"CLP\"},{\"name\":\"Subtotal\",\"value\":4394832},{\"name\":\"IVA\",\"value\":\"\"},{\"name\":\"Total\",\"value\":4394832},{\"name\":\"Nro Poliza\",\"value\":\"8002023005533\"},{\"name\":\"Nro Movimiento\",\"value\":\"2602\"},{\"name\":\"Proyecto\",\"value\":\"Test\"},{\"name\":\"Fecha Inicio Poliza\",\"value\":\"\"},{\"name\":\"Fecha fin Poliza\",\"value\":\"\"},{\"name\":\"Tipo cambio ori\",\"value\":\"38416.36364\"},{\"name\":\"Moneda Ori\",\"value\":\"UF\"},{\"name\":\"Total Moneda Ori\",\"value\":\"114.4\"},{\"name\":\"Total Pago Mon Ori\",\"value\":\"\"},{\"name\":\"Fecha Pago\",\"value\":\"10/2/2025\"},{\"name\":\"AVLA - N° PAGO RELACIONADO\",\"value\":\"\"},{\"name\":\"NRO Cuota AVLA\",\"value\":\"72\"},{\"name\":\"Monto cuota CLP\",\"value\":\"42258.00\"},{\"name\":\"Revaluacion Cuota\",\"value\":\"\"},{\"name\":\"Cuota Actualizada\",\"value\":\"72\"},{\"name\":\"Cuota Mon Ori\",\"value\":\"\"},{\"name\":\"Fecha Venc Cuota\",\"value\":\"30/8/2029\"},{\"name\":\"Nro Poliza Cuota\",\"value\":\"\"},{\"name\":\"Importe Ori Aplicado\",\"value\":\"\"},{\"name\":\"Latam - Document Date Ref\",\"value\":\"31/12/2024\"},{\"name\":\"Latam - Document Number Ref\",\"value\":\"22222772\"},{\"name\":\"Installment Number\",\"value\":\"56\"},{\"name\":\"Estado Cuota\",\"value\":\"Pendiente\"},{\"name\":\"Amount Paid\",\"value\":\"253548.00\"},{\"name\":\"Amount Paid\",\"value\":\".00\"},{\"name\":\"AVLA - Total Pago CLP\",\"value\":\"-254\"}]]"
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)
// const file = path.join(__dirname, "../reportes")

const generate = () =>{
    let body = JSON.parse(data.transactions);
    
    for (let i = 0; i < 10000000; i++) {
    // for (let i = 0; i < 50; i++) {
        body.push(body[0])
    }

    return body;
}

const generateData = async(body, sheet)=>{
    let i = 1;
    for (const element of body) {
        let arrayTmp = element.map(e => e.value);

        sheet.addRow(arrayTmp).commit();

        console.log(`Procesadas ${i} filas...`);
        if (i % 10000 === 0) await new Promise(resolve => setImmediate(resolve));
        i++;
    }
}

const generateExcel = async(port)=>{
    let date = new Date();
    const fileName = `Reporte${date.getMilliseconds()}.xlsx`;
    const filePath = path.join(__dirname, "../reportes", fileName);
    const fileStram = fs.createWriteStream(filePath);
    const workbook = new Exceljs.stream.xlsx.WorkbookWriter({
        stream: fileStram,
        useSharedStrings: false,
        useStyles: false
    })
    
    const sheet = workbook.addWorksheet("Mi Excel");
    let header = JSON.parse(data.headers)

    sheet.addRow(header).commit();
    let body = generate();
    await generateData(body, sheet)
    // let i = 1;
    // body.forEach(async(tra)=>{
    //     let arrayTmp = []
    //     tra.forEach(e=>{
    //         arrayTmp.push(e.value)
    //     })
    //     sheet.addRow(arrayTmp).commit()
    //     if (i % 10000 === 0) await new Promise(resolve => setImmediate(resolve));
    //     console.log(`Procesadas ${i} filas...`);
    //     i++
    // }) 
    
    await workbook.commit();
    fileStram.end();

    return {
        "fileName": fileName,
        "filePath": filePath,
        "fileDonwload": `/api/download/${fileName}`
    }
}

export default {generateExcel}