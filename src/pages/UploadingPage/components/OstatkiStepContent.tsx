import {useState} from 'react';
import {Tabs, Upload, Select, Button, Input, InputNumber, DatePicker, Flex, List, message} from 'antd';
import {InboxOutlined, UploadOutlined, DatabaseOutlined, CheckCircleOutlined, DeleteOutlined, PlusOutlined} from '@ant-design/icons';
import dayjs, {type Dayjs} from 'dayjs';
import {filterTablesByType, type TableInfo, type FileType} from '@/shared/api/tablesApi';
import {API_BASE_URL} from '@/shared/lib/constants';
import {type UploadStatus, type FileSelection, type OstatokItem, getFileTypeLabel, getErrorMessage} from '../types';
import UploadErrorModal from './UploadErrorModal';
import {useFileUploadState} from './useFileUploadState';

interface OstatkiStepContentProps {
    fileStatus: UploadStatus;
    savedSelection: FileSelection | null;
    existingTables: TableInfo[];
    isLoadingTables: boolean;
    fileStatuses: Record<FileType, UploadStatus>;
    savedSelections: Record<FileType, FileSelection | null>;
    onExistingSaveSuccess: (fileType: FileType, selection: FileSelection) => void;
    onManualSaveSuccess: (tableName: string) => void;
    manualStatus: UploadStatus;
}

const MONTHS = [
    'Январь', 'Февраль', 'Март', 'Апрель',
    'Май', 'Июнь', 'Июль', 'Август',
    'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const OstatkiStepContent = ({
    fileStatus,
    savedSelection,
    existingTables,
    isLoadingTables,
    onExistingSaveSuccess,
    onManualSaveSuccess,
    manualStatus,
}: OstatkiStepContentProps) => {
    const [activeTab, setActiveTab] = useState<'upload' | 'existing' | 'ostatki'>(() =>
        savedSelection ? savedSelection.type as 'upload' | 'existing' : 'existing'
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
        selectedExistingTable,
        setSelectedExistingTable,
        uploadProps,
    } = useFileUploadState(savedSelection);

    const [selectedMonth, setSelectedMonth] = useState<string | undefined>();

    // Manual ostatki state
    const [selectedSostoyanie, setSelectedSostoyanie] = useState<string | undefined>();
    const [ostatkiValue, setOstatkiValue] = useState<number | null>(null);
    const [ostatkiList, setOstatkiList] = useState<OstatokItem[]>([]);
    const [ostatkiTableName, setOstatkiTableName] = useState('');
    const [ostatkiMonthYear, setOstatkiMonthYear] = useState<Dayjs | null>(dayjs());
    const filteredTables = filterTablesByType(existingTables, 'Остатки');
    const isSaved = fileStatus === 'success';
    const isManualSaved = manualStatus === 'success';

    const handleSaveUpload = async () => {
        if (!uploadedFile) {
            message.warning('Пожалуйста, загрузите файл');
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
        if (!selectedMonth) {
            message.warning('Пожалуйста, выберите месяц');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('files', uploadedFile);
            formData.append('table_type', 'Остатки');
            formData.append('table_name', tableName);
            formData.append('sheet_name', selectedSheet);
            formData.append('month', selectedMonth);

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
                setErrorModalOpen(true);
                return;
            }
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Ошибка ответа:', errorText);
                message.error(`Ошибка при загрузке: ${response.status} ${response.statusText}`);
                return;
            }

            onExistingSaveSuccess('Остатки', {
                type: 'upload',
                file: uploadedFile,
                workbook: workbook || undefined,
                sheetNames,
                selectedSheet,
                tableName,
            });

            message.success(`${getFileTypeLabel('Остатки')} успешно загружен на сервер`);
        } catch (error: unknown) {
            message.error(`Ошибка при загрузке файла: ${getErrorMessage(error)}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddOstatok = () => {
        if (!selectedSostoyanie) {
             void message.warning('Пожалуйста, выберите состояние');
            return;
        }
        if (ostatkiValue === null || ostatkiValue === undefined || ostatkiValue <= 0) {
            void message.warning('Значение должно быть больше нуля');
            return;
        }

        setOstatkiList(prev => [...prev, {
            id: Date.now().toString(),
            sostoyanie: selectedSostoyanie,
            value: ostatkiValue,
        }]);
        setSelectedSostoyanie(undefined);
        setOstatkiValue(null);
         void message.success('Остаток добавлен');
    };

    const handleRemoveOstatok = (id: string) => {
        setOstatkiList(prev => prev.filter(item => item.id !== id));
        void message.success('Остаток удален');
    };

    const handleSaveOstatki = async () => {
        if (!ostatkiTableName.trim()) {
            message.warning('Пожалуйста, укажите название таблицы');
            return;
        }
        if (!ostatkiMonthYear) {
            message.warning('Пожалуйста, выберите дату');
            return;
        }
        if (ostatkiList.length === 0) {
            message.warning('Добавьте хотя бы один остаток');
            return;
        }

        try {
            const leftoversObject = ostatkiList.reduce((acc, item) => {
                acc[item.sostoyanie] = item.value;
                return acc;
            }, {} as Record<string, number>);

            const response = await fetch(`${API_BASE_URL}/leftovers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                },
                body: JSON.stringify({
                    table_name: ostatkiTableName,
                    date: ostatkiMonthYear.format('YYYY-MM-DD'),
                    leftovers: leftoversObject,
                }),
            });

            if (!response.ok) {
                message.error('Не удалось сохранить остатки');
                return;
            }

            message.success('Остатки успешно сохранены!');
            onManualSaveSuccess(ostatkiTableName);
        } catch (error: unknown) {
            message.error(`Ошибка при сохранении остатков: ${getErrorMessage(error)}`);
        }
    };

    const handleSaveExisting = () => {
        if (!selectedExistingTable) {
             void message.warning('Пожалуйста, выберите таблицу');
            return;
        }

        onExistingSaveSuccess('Остатки', {
            type: 'existing',
            existingTableName: selectedExistingTable,
        });

        void message.success('Остатки успешно настроены');
    };

    const tabItems = [
        {
            key: 'upload',
            label: <span><UploadOutlined/> Загрузить новый файл</span>,
            children: (
                <>
                    <Upload.Dragger {...uploadProps}>
                        <p className="ant-upload-drag-icon"><InboxOutlined/></p>
                        <p className="ant-upload-text">Кликните или перетащите файл для загрузки</p>
                        <p className="ant-upload-hint">Поддерживаемые форматы: .xlsx, .xls</p>
                    </Upload.Dragger>

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

                            <div style={{marginTop: 16}}>
                                <label style={{display: 'block', marginBottom: 8}}>Месяц</label>
                                <Select
                                    placeholder="Выберите месяц"
                                    value={selectedMonth}
                                    onChange={setSelectedMonth}
                                    options={MONTHS.map(m => ({value: m, label: m}))}
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
                            onChange={setSelectedExistingTable}
                            loading={isLoadingTables}
                            disabled={isLoadingTables}
                            options={filteredTables.map(t => ({value: t.table_name, label: t.table_name}))}
                            style={{width: '100%'}}
                            notFoundContent={
                                isLoadingTables ? 'Загрузка...' :
                                filteredTables.length === 0 ? 'Нет доступных таблиц типа "Остатки"' : null
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
        {
            key: 'ostatki',
            label: <span><PlusOutlined/> Добавить остатки</span>,
            children: (
                <>
                    <div>
                        <label style={{display: 'block', marginBottom: 8, fontWeight: 500}}>Название таблицы</label>
                        <Input
                            placeholder="Введите название таблицы остатков"
                            value={ostatkiTableName}
                            onChange={(e) => setOstatkiTableName(e.target.value)}
                            disabled={isManualSaved}
                        />
                    </div>

                    <div style={{marginTop: 16}}>
                        <label style={{display: 'block', marginBottom: 8, fontWeight: 500}}>Дата</label>
                        <DatePicker
                            placeholder="Выберите дату (ДД.ММ.ГГГГ)"
                            value={ostatkiMonthYear}
                            onChange={setOstatkiMonthYear}
                            style={{width: '100%'}}
                            disabled={isManualSaved}
                            format="DD.MM.YYYY"
                        />
                    </div>

                    <Flex gap="middle" align="flex-end" style={{marginTop: 16}}>
                        <div style={{flex: 1}}>
                            <label style={{display: 'block', marginBottom: 8, fontWeight: 500}}>Состояние</label>
                            <Input
                                placeholder="Введите состояние"
                                value={selectedSostoyanie ?? ''}
                                onChange={(e) => setSelectedSostoyanie(e.target.value || undefined)}
                            />
                        </div>

                        <div style={{flex: 1}}>
                            <label style={{display: 'block', marginBottom: 8, fontWeight: 500}}>Значение</label>
                            <InputNumber
                                placeholder="Введите значение"
                                value={ostatkiValue}
                                onChange={setOstatkiValue}
                                style={{width: '100%'}}
                                min={0}
                            />
                        </div>

                        <Button type="primary" icon={<PlusOutlined/>} onClick={handleAddOstatok}>
                            Добавить
                        </Button>
                    </Flex>

                    {ostatkiList.length > 0 && (
                        <>
                            <div style={{marginTop: 16}}>
                                <label style={{display: 'block', marginBottom: 8, fontWeight: 500}}>
                                    Добавленные остатки
                                </label>
                                <List
                                    bordered
                                    dataSource={ostatkiList}
                                    renderItem={(item) => (
                                        <List.Item
                                            actions={[
                                                <Button
                                                    key="delete"
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined/>}
                                                    onClick={() => handleRemoveOstatok(item.id)}
                                                >
                                                    Удалить
                                                </Button>
                                            ]}
                                        >
                                            <Flex justify="space-between" style={{width: '100%'}}>
                                                <span><strong>{item.sostoyanie}</strong></span>
                                                <span>{item.value}</span>
                                            </Flex>
                                        </List.Item>
                                    )}
                                />
                            </div>

                            <Button
                                type="primary"
                                onClick={handleSaveOstatki}
                                block
                                disabled={isManualSaved}
                                icon={isManualSaved ? <CheckCircleOutlined/> : <UploadOutlined/>}
                                style={{marginTop: 16}}
                            >
                                {isManualSaved ? 'Сохранено' : 'Сохранить остатки'}
                            </Button>
                        </>
                    )}
                </>
            ),
        },
    ];

    return (
        <>
            <Tabs
                activeKey={activeTab}
                items={tabItems}
                onChange={(key) => setActiveTab(key as 'upload' | 'existing' | 'ostatki')}
            />
            <UploadErrorModal
                open={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                errorMessage={errorMessage}
                missingCombinations={missingCombinations}
            />
        </>
    );
};

export default OstatkiStepContent;
