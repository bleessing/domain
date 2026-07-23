import type {FileType} from '@/shared/api/tablesApi';
import type {WorkBook} from 'xlsx';

export type UploadStatus = 'idle' | 'success';

export interface FileSelection {
    type: 'upload';
    file?: File;
    workbook?: WorkBook;
    sheetNames?: string[];
    selectedSheet?: string;
    dvFile?: File;
}

/** Идентификатор шага загрузки. `SHIPMENT` объединяет Отгрузку (OG) и Поступление (VG). */
export type StepId = 'RSS' | 'ZVZ' | 'SHIPMENT' | 'OSTATKI';

export interface StepConfig {
    id: StepId;
    label: string;
    required: boolean;
}

export const STEP_CONFIGS: StepConfig[] = [
    {id: 'RSS', label: 'РСС (+ ДВ опц.)', required: true},
    {id: 'ZVZ', label: 'Завоз/Вывоз', required: true},
    {id: 'SHIPMENT', label: 'Отгрузка / Поступление', required: true},
    {id: 'OSTATKI', label: 'Остатки', required: false},
];

/** Строки `table_type`, которые ждёт бэкенд `/upload/files` для каждого шага. */
export const BACKEND_TABLE_TYPE: Record<StepId, string> = {
    RSS: 'rss',
    ZVZ: 'zvz',
    SHIPMENT: 'otgruzka_postuplenie',
    OSTATKI: 'ostatki',
};

const FILE_TYPE_LABELS: Record<FileType, string> = {
    'RSS': 'РСС',
    'ZVZ': 'Завоз/Вывоз',
    'OG': 'Отгрузка',
    'VG': 'Поступление',
    'DV': 'ДВ',
    'Остатки': 'Остатки',
    'Словарь': 'Словарь',
};

export function getFileTypeLabel(fileType: FileType): string {
    return FILE_TYPE_LABELS[fileType] || fileType;
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

/**
 * Собирает query string для навигации на /main.
 * В v2 таблицы — master-таблицы, резолвятся бэком по equipment_type,
 * поэтому имён таблиц в URL больше нет — передаём только тип оборудования.
 */
export function buildQueryParams(equipmentType?: string): string {
    if (!equipmentType) return '';
    return `eq=${encodeURIComponent(equipmentType)}`;
}
