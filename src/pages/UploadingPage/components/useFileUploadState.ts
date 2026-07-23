import {useState} from 'react';
import {notifications} from '@mantine/notifications';
import * as XLSX from 'xlsx';
import type {FileSelection} from '../types';

export function useFileUploadState(savedSelection: FileSelection | null) {
    const [uploadedFile, setUploadedFile] = useState<File | null>(savedSelection?.file || null);
    const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(savedSelection?.workbook || null);
    const [sheetNames, setSheetNames] = useState<string[]>(savedSelection?.sheetNames || []);
    const [selectedSheet, setSelectedSheet] = useState<string>(savedSelection?.selectedSheet || '');
    const [isUploading, setIsUploading] = useState(false);

    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [missingCombinations, setMissingCombinations] = useState<Record<string, string>[]>([]);
    const [dictionaryType, setDictionaryType] = useState<string>('RSS');

    /** Разбирает выбранный Excel-файл и заполняет список листов. */
    const handleFile = async (file: File | null) => {
        if (!file) {
            resetUploadState();
            return;
        }
        try {
            const data = await file.arrayBuffer();
            const wb = XLSX.read(data, {type: 'array'});
            setWorkbook(wb);
            setUploadedFile(file);
            setSheetNames(wb.SheetNames);
            if (wb.SheetNames.length > 0) {
                setSelectedSheet(wb.SheetNames[0]);
            }
            notifications.show({color: 'tatneft', message: `Файл ${file.name} загружен`});
        } catch {
            notifications.show({color: 'brandRed', message: 'Ошибка при чтении файла Excel'});
        }
    };

    /** Сброс формы в исходное состояние (без файла). */
    const resetUploadState = () => {
        setUploadedFile(null);
        setWorkbook(null);
        setSheetNames([]);
        setSelectedSheet('');
    };

    return {
        uploadedFile,
        workbook,
        sheetNames,
        selectedSheet,
        setSelectedSheet,
        isUploading,
        setIsUploading,
        errorModalOpen,
        setErrorModalOpen,
        errorMessage,
        setErrorMessage,
        missingCombinations,
        setMissingCombinations,
        dictionaryType,
        setDictionaryType,
        handleFile,
        resetUploadState,
    };
}
