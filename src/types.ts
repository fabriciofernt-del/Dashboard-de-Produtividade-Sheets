/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RawData {
  colaborador: string;
  data: string; // YYYY-MM-DD
  hora: string; // HH:MM
  qtd: number;
}

export interface DbAttendance {
  colaborador: string;
  data: string; // YYYY-MM-DD
  hora: string; // HH:MM:00
  qtd: number;
  hora_faixa: string; // HH:00
}

export interface PivotRow {
  colaborador: string;
  dia: string; // DD/MM or just numerical day
  fullDate: Date;
  hours: Record<string, number>; // "00:00": 5, etc.
  totalDia: number;
}

export interface DashboardFilters {
  startDate: string;
  endDate: string;
  colaborador: string;
}

export const HOURS_LIST = [
  "00:00", "01:00", "02:00", "03:00", "04:00", "05:00",
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
];

export const CONFIG = {
  DEMO_MODE: false, 
};
