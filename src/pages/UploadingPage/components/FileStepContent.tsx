import {useState} from 'react';
import {Tabs, Upload, Input, Select, Button, message} from 'antd';
import {InboxOutlined, UploadOutlined, DatabaseOutlined, CheckCircleOutlined} from '@ant-design/icons';
import type {UploadProps} from 'antd';
import {filterTablesByType, type TableInfo, type FileType} from '@/shared/api/tablesApi';
import {API_BASE_URL} from '@/shared/lib/constants';
import type {UploadStatus, FileSelection} from '../types';
import {getErrorMessage, getFileTypeLabel} from '../types';
import UploadErrorModal from './UploadErrorModal';
import {useFileUploadState} from './useFileUploadState';

interface FileStepContentProps {
    fileType: FileType;
    fileStatus: UploadStatus;
    savedSelection: FileSelection | null;
    existingTables: TableInfo[];
    isLoadingTables: boolean;
    onSaveSuccess: (fileType: FileType, selection: FileSelection) => void;
}

const FileStepContent = ({
    fileType,
    fileStatus,
    savedSelection,
    existingTables,
    isLoadingTables,
    onSaveSuccess,
}: FileStepContentProps) => {
    const [activeTab, setActiveTab] = useState<'upload' | 'existing'>(() =>
        savedSelection ? savedSelection.type as 'upload' | 'existing' : 'upload'
    );

    const {
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
    } = useFileUploadState(savedSelection);

    // DV file state (only used when fileType === 'RSS')
    const [dvFile, setDvFile] = useState<File | null>(savedSelection?.dvFile || null);
    const isRssStep = fileType === 'RSS';

    const filteredTables = filterTablesByType(existingTables, fileType);
    const isSaved = fileStatus === 'success';

    const handleSaveUpload = async () => {
        if (!uploadedFile) {
            message.warning('Пожалуйста, загрузите файл');
            return;
        }
        if (isRssStep && !dvFile) {
            message.warning('Пожалуйста, загрузите файл ДВ');
            return;
        }
        if (!tableName.trim()) {
            message.warning('Пожалуйста, укажите название таблицы');
            return;
        }
        if (!selectedSheet) {
            message.warning('Пожалуйста, выберите лист');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('files', uploadedFile);
            if (isRssStep && dvFile) {
                formData.append('files', dvFile);
            }
            formData.append('table_type', fileType);
            formData.append('table_name', tableName);
            formData.append('sheet_name', selectedSheet);

            const response = await fetch(`${API_BASE_URL}/upload/files`, {
                method: 'POST',
                headers: {'ngrok-skip-browser-warning': 'false'},
                body: formData,
            });

            if (response.status === 422) {
                const errorData = await response.json();
                const detail = errorData?.detail;
                setErrorMessage(detail?.message || 'Ошибка валидации таблиц');
                setMissingCombinations(detail?.missing_combinations || []);
                setDictionaryType(detail?.dictionary_type || 'RSS');
                setErrorModalOpen(true);
                return;
            }
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Ошибка ответа:', errorText);
                message.error(`Ошибка при загрузке: ${response.status} ${response.statusText}`);
                return;
            }


            const responseData = await response.json();

            onSaveSuccess(fileType, {
                type: 'upload',
                file: uploadedFile,
                workbook: workbook || undefined,
                sheetNames,
                selectedSheet,
                tableName,
                dvFile: isRssStep ? dvFile || undefined : undefined,
                dvTableName: isRssStep ? responseData?.dv_table_name : undefined,
            });

            message.success(`${getFileTypeLabel(fileType)} успешно загружен на сервер`);
        } catch (error: unknown) {
            message.error(`Ошибка при загрузке файла: ${getErrorMessage(error)}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveExisting = () => {
        if (!selectedExistingTable) {
             void message.warning('Пожалуйста, выберите таблицу');
            return;
        }

        onSaveSuccess(fileType, {
            type: 'existing',
            existingTableName: selectedExistingTable,
        });

        void message.success(`${getFileTypeLabel(fileType)} успешно настроен`);
    };

    const dvUploadProps: UploadProps = {
        name: 'dvFile',
        multiple: false,
        accept: '.xlsx,.xls',
        beforeUpload: (file) => {
            setDvFile(file);
            void message.success(`Файл ДВ ${file.name} успешно загружен`);
            return false;
        },
        onRemove: () => {
            setDvFile(null);
        },
        fileList: dvFile ? [{uid: 'dv-1', name: dvFile.name, status: 'done'}] : [],
    };

    const tabItems = [
        {
            key: 'upload',
            label: <span><UploadOutlined/> Загрузить новый файл</span>,
            children: (
                <>
                    {isRssStep && (
                        <label style={{display: 'block', marginBottom: 8, fontWeight: 500}}>Файл RSS</label>
                    )}
                    <Upload.Dragger {...uploadProps}>
                        <p className="ant-upload-drag-icon"><InboxOutlined/></p>
                        <p className="ant-upload-text">Кликните или перетащите файл для загрузки</p>
                        <p className="ant-upload-hint">Поддерживаются форматы: .xlsx, .xls</p>
                    </Upload.Dragger>

                    {isRssStep && (
                        <div style={{marginTop: 16}}>
                            <label style={{display: 'block', marginBottom: 8, fontWeight: 500}}>Файл ДВ</label>
                            <Upload.Dragger {...dvUploadProps}>
                                <p className="ant-upload-drag-icon"><InboxOutlined/></p>
                                <p className="ant-upload-text">Кликните или перетащите файл ДВ</p>
                                <p className="ant-upload-hint">Поддерживаемые форматы: .xlsx, .xls</p>
                            </Upload.Dragger>
                        </div>
                    )}

                    {uploadedFile && (
                        <>
                            <div style={{marginTop: 16}}>
                                <label style={{display: 'block', marginBottom: 8}}>Название таблицы</label>
                                <Input
                                    placeholder="Назовите таблицу"
                                    value={tableName}
                                    onChange={(e) => setTableName(e.target.value)}
                                />
                            </div>

                            <div style={{marginTop: 16}}>
                                <label style={{display: 'block', marginBottom: 8}}>Выберите лист (страницу)</label>
                                <Select
                                    placeholder="Выберите нужную страницу"
                                    value={selectedSheet}
                                    onChange={setSelectedSheet}
                                    options={sheetNames.map(name => ({value: name, label: name}))}
                                    style={{width: '100%'}}
                                />
                            </div>
                        </>
                    )}

                    <Button
                        type="primary"
                        onClick={handleSaveUpload}
                        block
                        disabled={isSaved}
                        loading={isUploading}
                        icon={isSaved ? <CheckCircleOutlined/> : undefined}
                        style={{marginTop: 16}}
                    >
                        {isSaved ? 'Сохранено' : isUploading ? 'Загрузка...' : 'Сохранить выбор'}
                    </Button>
                </>
            ),
        },
        {
            key: 'existing',
            label: <span><DatabaseOutlined/> Использовать существующую таблицу</span>,
            children: (
                <>
                    <div>
                        <label style={{display: 'block', marginBottom: 8}}>Доступные таблицы</label>
                        <Select
                            placeholder={isLoadingTables ? 'Загрузка...' : 'Выберите таблицу'}
                            value={selectedExistingTable}
                            onChange={(value) => setSelectedExistingTable(value as string)}
                            loading={isLoadingTables}
                            disabled={isLoadingTables}
                            options={filteredTables.map(t => ({value: t.table_name, label: t.table_name}))}
                            style={{width: '100%'}}
                            notFoundContent={
                                isLoadingTables ? 'Загрузка...' :
                                filteredTables.length === 0 ? `Нет доступных таблиц типа "${getFileTypeLabel(fileType)}"` : null
                            }
                        />
                    </div>

                    <Button
                        type="primary"
                        onClick={handleSaveExisting}
                        block
                        disabled={isSaved}
                        icon={isSaved ? <CheckCircleOutlined/> : undefined}
                        style={{marginTop: 16}}
                    >
                        {isSaved ? 'Сохранено' : 'Сохранить выбор'}
                    </Button>
                </>
            ),
        },
    ];

    return (
        <>
            <Tabs
                activeKey={activeTab}
                items={tabItems}
                onChange={(key) => setActiveTab(key as 'upload' | 'existing')}
            />
            <UploadErrorModal
                open={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                errorMessage={errorMessage}
                missingCombinations={missingCombinations}
                dictionaryType={dictionaryType}
            />
        </>
    );
};

export default FileStepContent;
