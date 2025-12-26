import {useState, useEffect} from "react";
import {Flex, Input, Modal, Select, message, Button, Steps, Upload, Space, Tabs, Card, List, InputNumber, DatePicker} from "antd";
import {InboxOutlined, UploadOutlined, DatabaseOutlined, CheckCircleOutlined, DeleteOutlined, PlusOutlined} from '@ant-design/icons';
import type {UploadProps, StepsProps} from "antd";
import * as XLSX from 'xlsx';
import {useNavigate} from "react-router";
import {fetchTables, filterTablesByType, type TableInfo} from "../../shared/api/tablesApi.ts";
import {fetchFilterOptions} from "@/entities/filter";
import {API_BASE_URL} from "@/shared/lib/constants";
import dayjs, {Dayjs} from 'dayjs';

// Вспомогательная функция для получения сообщения об ошибке
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

type FileType = 'zvz' | 'rss' | 'keyWords' | 'ostatki' | 'otgruzVygruz';

type UploadStatus = 'idle' | 'success';

interface FileSelection {
    type: 'upload' | 'existing';
    file?: File;
    workbook?: XLSX.WorkBook;
    sheetNames?: string[];
    selectedSheet?: string;
    tableName?: string;
    existingTableName?: string;
}

interface OstatokItem {
    id: string;
    sostoyanie: string;
    value: number;
}

interface Sostoyanie {
    name: string;
}

const UploadingPage = () => {
    const navigate = useNavigate();

    // Статус для каждого типа файла
    const [fileStatuses, setFileStatuses] = useState<Record<FileType, UploadStatus>>({
        zvz: 'idle',
        rss: 'idle',
        keyWords: 'idle',
        ostatki: 'idle',
        otgruzVygruz: 'idle',
    });

    // Сохраненные выборы файлов
    const [savedSelections, setSavedSelections] = useState<Record<FileType, FileSelection | null>>({
        zvz: null,
        rss: null,
        keyWords: null,
        ostatki: null,
        otgruzVygruz: null,
    });

    // Текущая форма
    const [currentFileType, setCurrentFileType] = useState<FileType>('zvz');
    const [activeTab, setActiveTab] = useState<'upload' | 'existing' | 'ostatki'>('upload');

    // Для загрузки нового файла
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
    const [sheetNames, setSheetNames] = useState<string[]>([]);
    const [selectedSheet, setSelectedSheet] = useState<string>("");
    const [tableName, setTableName] = useState<string>("");

    // Для выбора существующей таблицы
    const [existingTables, setExistingTables] = useState<TableInfo[]>([]);
    const [selectedExistingTable, setSelectedExistingTable] = useState<string | undefined>(undefined);
    const [isLoadingTables, setIsLoadingTables] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    // Для работы с остатками
    const [sostoyania, setSostoyania] = useState<Sostoyanie[]>([]);
    const [selectedSostoyanie, setSelectedSostoyanie] = useState<string | undefined>(undefined);
    const [ostatkiValue, setOstatkiValue] = useState<number | null>(null);
    const [ostatkiList, setOstatkiList] = useState<OstatokItem[]>([]);
    const [ostatkiTableName, setOstatkiTableName] = useState<string>("");
    const [ostatkiMonthYear, setOstatkiMonthYear] = useState<Dayjs | null>(dayjs());
    const [isLoadingSostoyania, setIsLoadingSostoyania] = useState<boolean>(false);
    const [ostatkiStatus, setOstatkiStatus] = useState<UploadStatus>('idle');

    const fileTypeOptions = [
        {value: 'Завоз/Вывоз', label: 'Завоз/Вывоз'},
        {value: 'RSS', label: 'RSS'},
        {value: 'Словарь', label: 'Словарь'},
        {value: 'Остатки', label: 'Остатки'},
        {value: 'OV', label: 'Отгруз/Выгруз'},
    ];

    // Загрузка существующих таблиц с сервера
    const loadExistingTables = async () => {
        setIsLoadingTables(true);
        try {
            const tables = await fetchTables();
            setExistingTables(tables);
        } catch (error: unknown) {
            message.error('Не удалось загрузить список таблиц');
            console.error(error);
        } finally {
            setIsLoadingTables(false);
        }
    };

    // Загрузка списка состояний с сервера
    const loadSostoyania = async () => {
        // Проверяем, что все три типа файлов настроены
        if (fileStatuses.zvz !== 'success' || fileStatuses.rss !== 'success' || fileStatuses.keyWords !== 'success') {
            message.warning('Сначала настройте Завоз/Вывоз, RSS и Словарь');
            return;
        }

        // Получаем названия таблиц из сохраненных выборов
        const zvzSelection = savedSelections.zvz;
        const rssSelection = savedSelections.rss;
        const keyWordsSelection = savedSelections.keyWords;

        if (!zvzSelection || !rssSelection || !keyWordsSelection) {
            message.warning('Не удалось получить названия таблиц');
            return;
        }

        const zvzTableName = zvzSelection.type === 'upload' ? zvzSelection.tableName : zvzSelection.existingTableName;
        const rssTableName = rssSelection.type === 'upload' ? rssSelection.tableName : rssSelection.existingTableName;
        const sprTableName = keyWordsSelection.type === 'upload' ? keyWordsSelection.tableName : keyWordsSelection.existingTableName;

        if (!zvzTableName || !rssTableName || !sprTableName) {
            message.warning('Не удалось определить названия таблиц');
            return;
        }

        setIsLoadingSostoyania(true);
        try {
            const filterOptions = await fetchFilterOptions(zvzTableName, rssTableName, sprTableName, '');

            // Преобразуем массив строк в массив объектов с name
            const sostoyaniOptions = filterOptions.states.map(state => ({ name: state }));
            setSostoyania(sostoyaniOptions);
        } catch (error: unknown) {
            message.error('Не удалось загрузить список состояний');
            console.error(error);
        } finally {
            setIsLoadingSostoyania(false);
        }
    };

    // Добавление остатка в список
    const handleAddOstatok = () => {
        if (!selectedSostoyanie) {
            message.warning('Пожалуйста, выберите состояние');
            return;
        }
        if (ostatkiValue === null || ostatkiValue === undefined) {
            message.warning('Пожалуйста, введите значение');
            return;
        }
        if (ostatkiValue <= 0) {
            message.warning('Значение должно быть больше нуля');
            return;
        }

        const newOstatok: OstatokItem = {
            id: Date.now().toString(),
            sostoyanie: selectedSostoyanie,
            value: ostatkiValue,
        };

        setOstatkiList([...ostatkiList, newOstatok]);
        setSelectedSostoyanie(undefined);
        setOstatkiValue(null);
        message.success('Остаток добавлен');
    };

    // Удаление остатка из списка
    const handleRemoveOstatok = (id: string) => {
        setOstatkiList(ostatkiList.filter(item => item.id !== id));
        message.success('Остаток удален');
    };

    // Сохранение остатков
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
            // Преобразуем массив остатков в объект { "состояние1": значение1, "состояние2": значение2 }
            const leftoversObject = ostatkiList.reduce((acc, item) => {
                acc[item.sostoyanie] = item.value;
                return acc;
            }, {} as Record<string, number>);

            // Форматируем дату в строку YYYY-MM-DD (ISO формат даты без времени)
            const formattedDate = ostatkiMonthYear.format('YYYY-MM-DD');

            const response = await fetch(`${API_BASE_URL}/leftovers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                },
                body: JSON.stringify({
                    table_name: ostatkiTableName,
                    date: formattedDate,
                    leftovers: leftoversObject,
                }),
            });

            if (!response.ok) {
                throw new Error('Не удалось сохранить остатки');
            }

            message.success('Остатки успешно сохранены!');
            setOstatkiStatus('success');
        } catch (error: unknown) {
            message.error(`Ошибка при сохранении остатков: ${getErrorMessage(error)}`);
            console.error(error);
        }
    };

    // Загружаем таблицы при переключении на вкладку "existing"
    useEffect(() => {
        if (activeTab === 'existing') {
            loadExistingTables();
        }
    }, [activeTab]);

    // Загружаем состояния при переключении на вкладку "ostatki"
    useEffect(() => {
        if (activeTab === 'ostatki') {
            loadSostoyania();
        }
    }, [activeTab]);

    // Фильтруем таблицы по текущему выбранному типу
    const filteredTables = filterTablesByType(existingTables, currentFileType);

    // Обработка загрузки файла
    const handleFileUpload = async (file: File) => {
        try {
            const data = await file.arrayBuffer();
            const wb = XLSX.read(data, {type: 'array'});

            setWorkbook(wb);
            setUploadedFile(file);
            setSheetNames(wb.SheetNames);

            if (wb.SheetNames.length > 0) {
                const firstSheet = wb.SheetNames[0];
                setSelectedSheet(firstSheet);
            }

            message.success(`Файл ${file.name} успешно загружен`);
        } catch (error: unknown) {
            message.error('Ошибка при чтении файла Excel');
            console.error(error);
        }
    };

    // Очистка текущей формы
    const resetCurrentForm = () => {
        setUploadedFile(null);
        setWorkbook(null);
        setSheetNames([]);
        setSelectedSheet("");
        setTableName("");
        setSelectedExistingTable(undefined);
    };

    // Изменение типа файла
    const handleFileTypeChange = (newType: FileType) => {
        setCurrentFileType(newType);
        resetCurrentForm();

        // Восстанавливаем сохраненный выбор, если есть
        const saved = savedSelections[newType];
        if (saved) {
            setActiveTab(saved.type);
            if (saved.type === 'upload') {
                setUploadedFile(saved.file || null);
                setWorkbook(saved.workbook || null);
                setSheetNames(saved.sheetNames || []);
                setSelectedSheet(saved.selectedSheet || '');
                setTableName(saved.tableName || '');
            } else {
                setSelectedExistingTable(saved.existingTableName);
            }
        } else {
            // Если нет сохраненного выбора, устанавливаем вкладку по умолчанию
            if (newType === 'ostatki') {
                setActiveTab('existing');
            } else {
                setActiveTab('upload');
            }
        }
    };

    // Сохранение выбора файла
    const handleSaveSelection = async () => {
        if (activeTab === 'upload') {
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

            // Сразу отправляем файл на сервер
            setIsUploading(true);
            try {
                const formData = new FormData();
                formData.append('file', uploadedFile);
                formData.append('table_type', currentFileType);
                formData.append('table_name', tableName);
                formData.append('sheet_name', selectedSheet);

                const response = await fetch(`${API_BASE_URL}/upload/file`, {
                    method: 'POST',
                    headers: {
                        'ngrok-skip-browser-warning': 'false',
                    },
                    body: formData,
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Ошибка ответа:', errorText);
                    throw new Error(`Ошибка при загрузке: ${response.status} ${response.statusText}`);
                }

                await response.json();

                // Сохраняем выбор после успешной загрузки
                setSavedSelections(prev => ({
                    ...prev,
                    [currentFileType]: {
                        type: 'upload',
                        file: uploadedFile,
                        workbook: workbook || undefined,
                        sheetNames: sheetNames,
                        selectedSheet: selectedSheet,
                        tableName: tableName,
                    }
                }));

                setFileStatuses(prev => ({
                    ...prev,
                    [currentFileType]: 'success'
                }));

                message.success(`${fileTypeOptions.find(o => o.value === currentFileType)?.label} успешно загружен на сервер`);

                // Переключаемся на следующий тип файла после успешной загрузки
                if (currentFileType === 'zvz' && fileStatuses.rss === 'idle') {
                    handleFileTypeChange('rss');
                } else if (currentFileType === 'rss' && fileStatuses.keyWords === 'idle') {
                    handleFileTypeChange('keyWords');
                } else if (currentFileType === 'keyWords' && fileStatuses.ostatki === 'idle') {
                    handleFileTypeChange('ostatki');
                } else if (currentFileType === 'ostatki' && fileStatuses.otgruzVygruz === 'idle') {
                    handleFileTypeChange('otgruzVygruz');
                }
            } catch (error: unknown) {
                message.error(`Ошибка при загрузке файла: ${getErrorMessage(error)}`);
                console.error('Ошибка:', error);
            } finally {
                setIsUploading(false);
            }
        } else {
            if (!selectedExistingTable) {
                message.warning('Пожалуйста, выберите таблицу');
                return;
            }

            setSavedSelections(prev => ({
                ...prev,
                [currentFileType]: {
                    type: 'existing',
                    existingTableName: selectedExistingTable,
                }
            }));

            setFileStatuses(prev => ({
                ...prev,
                [currentFileType]: 'success'
            }));

            message.success(`${fileTypeOptions.find(o => o.value === currentFileType)?.label} успешно настроен`);

            // Переключаемся на следующий тип файла после успешного сохранения
            if (currentFileType === 'zvz' && fileStatuses.rss === 'idle') {
                handleFileTypeChange('rss');
            } else if (currentFileType === 'rss' && fileStatuses.keyWords === 'idle') {
                handleFileTypeChange('keyWords');
            } else if (currentFileType === 'keyWords' && fileStatuses.ostatki === 'idle') {
                handleFileTypeChange('ostatki');
            } else if (currentFileType === 'ostatki' && fileStatuses.otgruzVygruz === 'idle') {
                handleFileTypeChange('otgruzVygruz');
            }
        }
    };

    // Переход на главную страницу с параметрами таблиц
    const handleSubmitAll = async () => {
        const allConfigured = fileStatuses.zvz === 'success' &&
                             fileStatuses.rss === 'success' &&
                             fileStatuses.keyWords === 'success';

        if (!allConfigured) {
            message.warning('Пожалуйста, настройте все три типа файлов');
            return;
        }

        const tableNames: Record<string, string> = {};

        // Собираем названия таблиц из сохраненных выборов
        for (const fileType of ['zvz', 'rss', 'keyWords'] as FileType[]) {
            const selection = savedSelections[fileType];
            if (!selection) continue;

            if (selection.type === 'upload') {
                tableNames[fileType] = selection.tableName || '';
            } else if (selection.type === 'existing') {
                tableNames[fileType] = selection.existingTableName || '';
            }
        }

        message.success('Переход на главную страницу...');

        // Формируем URL с параметрами таблиц
        const params = new URLSearchParams({
            zvz_table: tableNames['zvz'] || '',
            rss_table: tableNames['rss'] || '',
            spr_table: tableNames['keyWords'] || '',
        });

        // Добавляем таблицу остатков, если она была настроена
        // Проверяем два варианта: созданная новая таблица или выбранная существующая
        let leftoversTableName = '';
        if (ostatkiStatus === 'success' && ostatkiTableName) {
            // Новая таблица остатков через вкладку "Добавить остатки"
            leftoversTableName = ostatkiTableName;
        } else if (fileStatuses.ostatki === 'success' && savedSelections.ostatki?.existingTableName) {
            // Существующая таблица остатков выбранная через тип данных "Остатки"
            leftoversTableName = savedSelections.ostatki.existingTableName;
        }

        if (leftoversTableName) {
            params.append('leftovers_table', leftoversTableName);
        }

        // Добавляем таблицу отгруз/выгруз, если она была настроена
        if (fileStatuses.otgruzVygruz === 'success') {
            const otgruzSelection = savedSelections.otgruzVygruz;
            if (otgruzSelection) {
                const otgruzTableName = otgruzSelection.type === 'upload'
                    ? otgruzSelection.tableName
                    : otgruzSelection.existingTableName;
                if (otgruzTableName) {
                    params.append('otgruz_vygruz_table', otgruzTableName);
                }
            }
        }

        setTimeout(() => navigate(`/main?${params.toString()}`), 1000);
    };

    // Очистка всего
    const resetAll = () => {
        setFileStatuses({zvz: 'idle', rss: 'idle', keyWords: 'idle', ostatki: 'idle', otgruzVygruz: 'idle'});
        setSavedSelections({zvz: null, rss: null, keyWords: null, ostatki: null, otgruzVygruz: null});
        resetCurrentForm();
        setCurrentFileType('zvz');
        setActiveTab('upload');
        // Очистка остатков
        setOstatkiList([]);
        setOstatkiTableName("");
        setOstatkiMonthYear(dayjs());
        setSelectedSostoyanie(undefined);
        setOstatkiValue(null);
        setOstatkiStatus('idle');
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
            setSelectedSheet("");
            setTableName("");
        },
        fileList: uploadedFile ? [{
            uid: '1',
            name: uploadedFile.name,
            status: 'done',
        }] : [],
    };

    // Динамический список вкладок в зависимости от типа файла
    const tabItems = currentFileType === 'ostatki' ? [
        {
            key: 'existing',
            label: <span><DatabaseOutlined/> Использовать существующую таблицу</span>,
        },
        {
            key: 'ostatki',
            label: <span>+ Добавить остатки</span>,
        }
    ] : [
        {
            key: 'upload',
            label: <span><UploadOutlined/> Загрузить новый файл</span>,
        },
        {
            key: 'existing',
            label: <span><DatabaseOutlined/> Использовать существующую таблицу</span>,
        },
    ];

    const stepsItems: StepsProps['items'] = [
        {
            title: 'Завоз/Вывоз',
            status: fileStatuses.zvz === 'success' ? 'finish' : 'wait',
            icon: fileStatuses.zvz === 'success' ? <CheckCircleOutlined/> : undefined,
        },
        {
            title: 'RSS',
            status: fileStatuses.rss === 'success' ? 'finish' : 'wait',
            icon: fileStatuses.rss === 'success' ? <CheckCircleOutlined/> : undefined,
        },
        {
            title: 'Словарь',
            status: fileStatuses.keyWords === 'success' ? 'finish' : 'wait',
            icon: fileStatuses.keyWords === 'success' ? <CheckCircleOutlined/> : undefined,
        },
        {
            title: 'Остатки (опционально)',
            status: (ostatkiStatus === 'success' || fileStatuses.ostatki === 'success') ? 'finish' : 'wait',
            icon: (ostatkiStatus === 'success' || fileStatuses.ostatki === 'success') ? <CheckCircleOutlined/> : undefined,
        },
        {
            title: 'Отгруз/Выгруз (опционально)',
            status: fileStatuses.otgruzVygruz === 'success' ? 'finish' : 'wait',
            icon: fileStatuses.otgruzVygruz === 'success' ? <CheckCircleOutlined/> : undefined,
        }
    ];

    const allConfigured = fileStatuses.zvz === 'success' &&
                         fileStatuses.rss === 'success' &&
                         fileStatuses.keyWords === 'success';

    return (
        <div>
            <Modal
                title="Загрузка файлов для анализа"
                open={true}
                width={1200}
                footer={[
                    <Button key="cancel" onClick={resetAll}>
                        Очистить все
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        icon={<CheckCircleOutlined/>}
                        onClick={handleSubmitAll}
                        disabled={!allConfigured}
                    >
                        Перейти к анализу
                    </Button>,
                ]}
            >
                <Flex vertical gap="middle" style={{marginBottom: '24px'}}>
                    <Steps items={stepsItems}/>
                </Flex>

                <Card style={{marginBottom: '16px'}}>
                    <Space vertical style={{width: '100%'}} size="middle">
                        <div>
                            <label style={{display: 'block', marginBottom: '8px', fontWeight: 500}}>
                                Выберите тип данных
                            </label>
                            <Select
                                style={{width: '100%'}}
                                value={currentFileType}
                                onChange={handleFileTypeChange}
                                options={fileTypeOptions}
                            />
                        </div>

                        <Tabs
                            activeKey={activeTab}
                            items={tabItems}
                            onChange={(key) => setActiveTab(key as 'upload' | 'existing' | 'ostatki')}
                        />

                        {activeTab === 'upload' ? (
                            <>
                                <Upload.Dragger {...uploadProps}>
                                    <p className="ant-upload-drag-icon">
                                        <InboxOutlined/>
                                    </p>
                                    <p className="ant-upload-text">Кликните или перетащите файл для загрузки</p>
                                    <p className="ant-upload-hint">Поддерживаются форматы: .xlsx, .xls</p>
                                </Upload.Dragger>

                                {uploadedFile && (
                                    <>
                                        <div>
                                            <label style={{display: 'block', marginBottom: '8px'}}>
                                                Название таблицы
                                            </label>
                                            <Input
                                                placeholder="Назовите таблицу"
                                                value={tableName}
                                                onChange={(e) => setTableName(e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label style={{display: 'block', marginBottom: '8px'}}>
                                                Выберите лист (страницу)
                                            </label>
                                            <Select
                                                placeholder="Выберите нужную страницу"
                                                value={selectedSheet}
                                                onChange={setSelectedSheet}
                                                options={sheetNames.map(name => ({
                                                    value: name,
                                                    label: name,
                                                }))}
                                                style={{width: '100%'}}
                                            />
                                        </div>
                                    </>
                                )}

                                <Button
                                    type="primary"
                                    onClick={handleSaveSelection}
                                    block
                                    disabled={fileStatuses[currentFileType] === 'success'}
                                    loading={isUploading}
                                    icon={fileStatuses[currentFileType] === 'success' ? <CheckCircleOutlined/> : undefined}
                                >
                                    {fileStatuses[currentFileType] === 'success'
                                        ? 'Сохранено'
                                        : isUploading ? 'Загрузка...' : 'Сохранить выбор'}
                                </Button>
                            </>
                        ) : activeTab === 'existing' ? (
                            <>
                                <div>
                                    <label style={{display: 'block', marginBottom: '8px'}}>
                                        Доступные таблицы
                                    </label>
                                    <Select
                                        placeholder={isLoadingTables ? 'Загрузка...' : 'Выберите таблицу'}
                                        value={selectedExistingTable}
                                        onChange={setSelectedExistingTable}
                                        loading={isLoadingTables}
                                        disabled={isLoadingTables}
                                        options={filteredTables.map((table) => ({
                                            value: table.table_name,
                                            label: table.table_name,
                                        }))}
                                        style={{width: '100%'}}
                                        notFoundContent={
                                            isLoadingTables
                                                ? 'Загрузка...'
                                                : filteredTables.length === 0
                                                ? `Нет доступных таблиц типа "${fileTypeOptions.find(o => o.value === currentFileType)?.label}"`
                                                : null
                                        }
                                    />
                                </div>

                                <Button
                                    type="primary"
                                    onClick={handleSaveSelection}
                                    block
                                    disabled={fileStatuses[currentFileType] === 'success'}
                                    loading={isUploading}
                                    icon={fileStatuses[currentFileType] === 'success' ? <CheckCircleOutlined/> : undefined}
                                >
                                    {fileStatuses[currentFileType] === 'success'
                                        ? 'Сохранено'
                                        : isUploading ? 'Загрузка...' : 'Сохранить выбор'}
                                </Button>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 500}}>
                                        Название таблицы
                                    </label>
                                    <Input
                                        placeholder="Введите название таблицы остатков"
                                        value={ostatkiTableName}
                                        onChange={(e) => setOstatkiTableName(e.target.value)}
                                        disabled={ostatkiStatus === 'success'}
                                    />
                                </div>

                                <div>
                                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 500}}>
                                        Дата
                                    </label>
                                    <DatePicker
                                        placeholder="Выберите дату (ДД.ММ.ГГГГ)"
                                        value={ostatkiMonthYear}
                                        onChange={setOstatkiMonthYear}
                                        style={{width: '100%'}}
                                        disabled={ostatkiStatus === 'success'}
                                        format="DD.MM.YYYY"
                                    />
                                </div>

                                <Flex gap="middle" align="flex-end">
                                    <div style={{flex: 1}}>
                                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 500}}>
                                            Состояние
                                        </label>
                                        <Select
                                            placeholder={isLoadingSostoyania ? 'Загрузка...' : 'Выберите состояние'}
                                            value={selectedSostoyanie}
                                            onChange={setSelectedSostoyanie}
                                            loading={isLoadingSostoyania}
                                            disabled={isLoadingSostoyania}
                                            options={sostoyania.map((s) => ({
                                                value: s.name,
                                                label: s.name,
                                            }))}
                                            style={{width: '100%'}}
                                        />
                                    </div>

                                    <div style={{flex: 1}}>
                                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 500}}>
                                            Значение
                                        </label>
                                        <InputNumber
                                            placeholder="Введите значение"
                                            value={ostatkiValue}
                                            onChange={setOstatkiValue}
                                            style={{width: '100%'}}
                                            min={0}
                                        />
                                    </div>

                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined/>}
                                        onClick={handleAddOstatok}
                                    >
                                        Добавить
                                    </Button>
                                </Flex>

                                {ostatkiList.length > 0 && (
                                    <>
                                        <div>
                                            <label style={{display: 'block', marginBottom: '8px', fontWeight: 500}}>
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
                                            disabled={ostatkiStatus === 'success'}
                                            icon={ostatkiStatus === 'success' ? <CheckCircleOutlined/> : <UploadOutlined/>}
                                        >
                                            {ostatkiStatus === 'success' ? 'Сохранено' : 'Сохранить остатки'}
                                        </Button>
                                    </>
                                )}
                            </>
                        )}
                    </Space>
                </Card>
            </Modal>
        </div>
    );
};

export default UploadingPage;
