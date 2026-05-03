import * as XLSX from "xlsx";
import { parse } from "csv-parse/sync";
import { DbAttendance } from "../types";

export async function processFileBuffer(buffer: Buffer, mimetype: string, originalname: string): Promise<DbAttendance[]> {
  const extension = originalname.split('.').pop()?.toLowerCase();

  let rawData: Record<string, any>[] = [];

  if (mimetype === 'text/csv' || extension === 'csv') {
    rawData = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      bom: true
    });
  } else if (mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mimetype === 'application/vnd.ms-excel' || extension === 'xlsx' || extension === 'xls') {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
  } else {
    throw new Error(`Formato não suportado: ${mimetype} (${extension}). Use PDF, CSV ou XLSX.`);
  }

  return normalizeData(rawData);
}

export function mapToDbAttendance(row: any): DbAttendance {
  let horaHH = "00";
  let horaStr = row.hora || "00:00";
  
  if (horaStr.includes(':')) {
    horaHH = horaStr.split(':')[0].padStart(2, '0');
  }

  let dataStr = row.data || new Date().toISOString().split('T')[0];
  if (dataStr.includes('/')) {
      const parts = dataStr.split('/');
      if (parts.length === 3) {
          dataStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
  }

  // basic date check
  let itemDate = new Date(dataStr + "T00:00:00");
  if (isNaN(itemDate.getTime())) {
      dataStr = new Date().toISOString().split('T')[0];
  }

  return {
    colaborador: String(row.colaborador).trim(),
    data: dataStr,
    hora: `${horaStr}:00`, // adding seconds
    qtd: Number(row.qtd) || 1,
    hora_faixa: `${horaHH}:00`
  };
}

function normalizeData(jsonData: Record<string, any>[]): DbAttendance[] {
  return jsonData.map(row => {
    // Attempt to dynamically find the correct columns based on common names
    const colabKey = Object.keys(row).find(k => k.toLowerCase().match(/colab|prof|func|nome|médico/i));
    const dataKey = Object.keys(row).find(k => k.toLowerCase().match(/data|dt|dia/i));
    const horaKey = Object.keys(row).find(k => k.toLowerCase().match(/hora|hr|período/i));
    const qtdKey = Object.keys(row).find(k => k.toLowerCase().match(/qtd|quant|total/i));

    let dataStr = dataKey ? String(row[dataKey]) : "";
    let horaStr = horaKey ? String(row[horaKey]) : "";
    
    // basic cleanup for excel float days 
    if (typeof row[dataKey!] === 'number') {
      const date = new Date((row[dataKey!] - (25567 + 1)) * 86400 * 1000);
      dataStr = date.toISOString().split('T')[0];
    } else if (dataStr.includes('/')) {
        // Assume DD/MM/YYYY
        const parts = dataStr.split('/');
        if (parts.length === 3) {
            dataStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
    }

    if (typeof row[horaKey!] === 'number') {
       // Excel hours are fraction of the day 
       const totalSeconds = Math.round(row[horaKey!] * 86400);
       const hours = Math.floor(totalSeconds / 3600);
       const minutes = Math.floor((totalSeconds % 3600) / 60);
       horaStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    return mapToDbAttendance({
        colaborador: colabKey ? row[colabKey] : "Desconhecido",
        data: dataStr,
        hora: horaStr,
        qtd: qtdKey ? row[qtdKey] : 1
    });

  }).filter(row => row.colaborador && row.data && row.hora);
}
