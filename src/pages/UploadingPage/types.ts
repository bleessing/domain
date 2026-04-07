import type {FileType} from '@/shared/api/tablesApi';
import type {WorkBook} from 'xlsx';

export type UploadStatus = 'idle' | 'success';

export interface FileSelection {
    type: 'upload' | 'existing';
    file?: File;
    workbook?: WorkBook;
    sheetNames?: string[];
    selectedSheet?: string;
    tableName?: string;
    existingTableName?: string;
    dvFile?: File;
    dvTableName?: string;
}

export interface OstatokItem {
    id: string;
    sostoyanie: string;
    value: number;
}

export interface FileStepConfig {
    fileType: FileType;
    label: string;
    required: boolean;
}

export const FILE_STEP_CONFIGS: FileStepConfig[] = [
    {fileType: 'RSS', label: 'RSS + ДВ', required: true},
    {fileType: 'ZVZ', label: 'Завоз/Вывоз', required: true},
    {fileType: 'OG', label: 'Отгрузка', required: true},
    {fileType: 'VG', label: 'Поступление', required: true},
    {fileType: 'Остатки', label: 'Остатки', required: false},
];

export function getFileTypeLabel(fileType: FileType): string {
    return FILE_STEP_CONFIGS.find(c => c.fileType === fileType)?.label || fileType;
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

/**
 * Собирает query string для навигации на /main
 */
export function buildQueryParams(
    fileStatuses: Record<FileType, UploadStatus>,
    savedSelections: Record<FileType, FileSelection | null>,
    ostatkiManualTableName?: string,
): string {
    const queryParams: string[] = [];
    const tableNames: Record<string, string> = {};

    for (const fileType of ['ZVZ', 'RSS'] as FileType[]) {
        const selection = savedSelections[fileType];
        if (!selection) continue;

        if (selection.type === 'upload') {
            tableNames[fileType] = selection.tableName || '';
        } else if (selection.type === 'existing') {
            tableNames[fileType] = selection.existingTableName || '';
        }
    }

    queryParams.push(`zvz_table=${tableNames['ZVZ'] || ''}`);
    queryParams.push(`rss_table=${tableNames['RSS'] || ''}`);

    if (fileStatuses['OG'] === 'success') {
        const sel = savedSelections['OG'];
        if (sel) {
            const name = sel.type === 'upload' ? sel.tableName : sel.existingTableName;
            if (name) queryParams.push(`og_table=${name}`);
        }
    }

    if (fileStatuses['VG'] === 'success') {
        const sel = savedSelections['VG'];
        if (sel) {
            const name = sel.type === 'upload' ? sel.tableName : sel.existingTableName;
            if (name) queryParams.push(`vg_table=${name}`);
        }
    }

    if (fileStatuses['DV'] === 'success') {
        const sel = savedSelections['DV'];
        if (sel) {
            const name = sel.dvTableName || sel.existingTableName;
            if (name) queryParams.push(`dv_table=${name}`);
        }
    }

    let leftoversTable = '';
    if (ostatkiManualTableName) {
        leftoversTable = ostatkiManualTableName;
    } else if (fileStatuses['Остатки'] === 'success' && savedSelections['Остатки']) {
        const sel = savedSelections['Остатки'];
        leftoversTable = sel.type === 'upload' ? (sel.tableName || '') : (sel.existingTableName || '');
    }
    if (leftoversTable) {
        queryParams.push(`leftovers_table=${leftoversTable}`);
    }

    return queryParams.join('&');
}
