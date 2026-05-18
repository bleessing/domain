import {useState} from 'react';
import {message} from 'antd';
import type {UploadProps} from 'antd';
import * as XLSX from 'xlsx';
import type {FileSelection} from '../types';

export function useFileUploadState(savedSelection: FileSelection | null) {
    const [uploadedFile, setUploadedFile] = useState<File | null>(savedSelection?.file || null);
    const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(savedSelection?.workbook || null);
    const [sheetNames, setSheetNames] = useState<string[]>(savedSelection?.sheetNames || []);
    const [selectedSheet, setSelectedSheet] = useState<string>(savedSelection?.selectedSheet || '');
    const [tableName, setTableName] = useState<string>(savedSelection?.tableName || '');
    const [isUploading, setIsUploading] = useState(false);

    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [missingCombinations, setMissingCombinations] = useState<Record<string, string>[]>([]);
    const [dictionaryType, setDictionaryType] = useState<string>('RSS');

    const [selectedExistingTable, setSelectedExistingTable] = useState<string | undefined>(
        savedSelection?.existingTableName
    );

    const handleFileUpload = async (file: File) => {
        try {
            const data = await file.arrayBuffer();
            const wb = XLSX.read(data, {type: 'array'});
            setWorkbook(wb);
            setUploadedFile(file);
            setSheetNames(wb.SheetNames);
            if (wb.SheetNames.length > 0) {
                setSelectedSheet(wb.SheetNames[0]);
            }
            message.success(`Файл ${file.name} успешно загружен`);
        } catch {
            message.error('Ошибка при чтении файла Excel');
        }
    };

    const uploadProps: UploadProps = {
        name: 'file',
        multiple: false,
        accept: '.xlsx,.xls',
        beforeUpload: (file) => {
            handleFileUpload(file);
            return false;
        },
        onRemove: () => {
            setUploadedFile(null);
            setWorkbook(null);
            setSheetNames([]);
            setSelectedSheet('');
            setTableName('');
        },
        fileList: uploadedFile ? [{uid: '1', name: uploadedFile.name, status: 'done'}] : [],
    };

    /**
     * Сброс upload-вкладки в исходное состояние (без файла).
     * Нужен после успешной загрузки, когда форму надо переиспользовать
     * для следующего файла (например в шаге Остатки — на начало/на конец).
     */
    const resetUploadState = () => {
        setUploadedFile(null);
        setWorkbook(null);
        setSheetNames([]);
        setSelectedSheet('');
        setTableName('');
    };

    return {
        uploadedFile,
        workbook,
        sheetNames,
        selectedSheet,
        setSelectedSheet,
        tableName,
        setTableName,
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
        selectedExistingTable,
        setSelectedExistingTable,
        uploadProps,
        resetUploadState,
    };
}
