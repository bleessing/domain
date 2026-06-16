import {useState, useEffect} from 'react';
import {Steps, Button, Flex, Card, message, Layout, Typography, Tag} from 'antd';
import {CheckCircleOutlined, ClearOutlined, LeftOutlined, RightOutlined, HomeOutlined} from '@ant-design/icons';
import {useNavigate, useSearchParams} from 'react-router';
import {fetchTables, type TableInfo, type FileType} from '@/shared/api/tablesApi';
import type {UploadStatus, FileSelection} from './types';
import {FILE_STEP_CONFIGS, buildQueryParams} from './types';
import FileStepContent from './components/FileStepContent';
import OstatkiStepContent from './components/OstatkiStepContent';
import {EQUIPMENT_LABELS, isEquipmentType, type EquipmentType} from '@/shared/lib/equipment';
import {colors} from '@/shared/lib/theme';

const {Header, Content} = Layout;
const {Text} = Typography;

const INITIAL_STATUSES: Record<FileType, UploadStatus> = {
    'ZVZ': 'idle',
    'RSS': 'idle',
    'Словарь': 'idle', // не используется в UI, но нужен для типа Record<FileType>
    'Остатки': 'idle',
    'OG': 'idle',
    'VG': 'idle',
    'DV': 'idle',
};

const INITIAL_SELECTIONS: Record<FileType, FileSelection | null> = {
    'ZVZ': null,
    'RSS': null,
    'Словарь': null,
    'Остатки': null,
    'OG': null,
    'VG': null,
    'DV': null,
};

const UploadingPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const equipmentParam = searchParams.get('eq');
    const equipmentType: EquipmentType | null = isEquipmentType(equipmentParam) ? equipmentParam : null;

    // Без выбранного оборудования вернёмся на главную — UI выбора фильтров зависит от типа.
    useEffect(() => {
        if (!equipmentType) {
            navigate('/', {replace: true});
        }
    }, [equipmentType, navigate]);

    const [currentStep, setCurrentStep] = useState(0);
    const [fileStatuses, setFileStatuses] = useState<Record<FileType, UploadStatus>>({...INITIAL_STATUSES});
    const [savedSelections, setSavedSelections] = useState<Record<FileType, FileSelection | null>>({...INITIAL_SELECTIONS});
    const [existingTables, setExistingTables] = useState<TableInfo[]>([]);
    const [isLoadingTables, setIsLoadingTables] = useState(true);

    // Separate tracking for manual ostatki entryd
    const [ostatkiManualTableName, setOstatkiManualTableName] = useState('');
    const [ostatkiManualStatus, setOstatkiManualStatus] = useState<UploadStatus>('idle');

    useEffect(() => {
        fetchTables()
            .then(setExistingTables)
            .catch(() => message.error('Не удалось загрузить таблицы'))
            .finally(() => setIsLoadingTables(false));
    }, []);

    const refreshTables = async () => {
        setIsLoadingTables(true);
        try {
            const tables = await fetchTables();
            setExistingTables(tables);
        } catch {
            void message.error('Не удалось обновить список таблиц');
        } finally {
            setIsLoadingTables(false);
        }
    };

    const handleSaveSuccess = (fileType: FileType, selection: FileSelection) => {
        setFileStatuses(prev => {
            const next = {...prev, [fileType]: 'success' as UploadStatus};
            if (fileType === 'RSS') {
                next['DV'] = 'success';
            }
            return next;
        });
        setSavedSelections(prev => {
            const next = {...prev, [fileType]: selection};
            if (fileType === 'RSS') {
                next['DV'] = {
                    type: selection.type,
                    dvFile: selection.dvFile,
                    dvTableName: selection.dvTableName,
                    existingTableName: selection.type === 'existing' ? selection.existingTableName : undefined,
                };
            }
            return next;
        });
        // Auto-advance to next step
        if (currentStep < FILE_STEP_CONFIGS.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleOstatkiManualSave = (tableName: string) => {
        setOstatkiManualTableName(tableName);
        setOstatkiManualStatus('success');
        if (currentStep < FILE_STEP_CONFIGS.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const resetAll = () => {
        setFileStatuses({...INITIAL_STATUSES});
        setSavedSelections({...INITIAL_SELECTIONS});
        setCurrentStep(0);
        setOstatkiManualTableName('');
        setOstatkiManualStatus('idle');
    };

    const allConfigured =
        fileStatuses['RSS'] === 'success' &&
        fileStatuses['DV'] === 'success' &&
        fileStatuses['ZVZ'] === 'success' &&
        fileStatuses['OG'] === 'success' &&
        fileStatuses['VG'] === 'success';

    const handleSubmitAll = () => {
        if (!allConfigured) {
            void message.warning('Настройте RSS + ДВ, Завоз/Вывоз, Отгрузку и Поступление');
            return;
        }

        const queryString = buildQueryParams(
            fileStatuses,
            savedSelections,
            ostatkiManualStatus === 'success' ? ostatkiManualTableName : undefined,
            equipmentType ?? undefined,
        );
        void message.success('Переход к анализу...');
        setTimeout(() => navigate(`/main?${queryString}`), 500);
    };

    const goNext = () => setCurrentStep(prev => Math.min(prev + 1, FILE_STEP_CONFIGS.length - 1));
    const goPrev = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const isLastStep = currentStep === FILE_STEP_CONFIGS.length - 1;
    const isFirstStep = currentStep === 0;
    const isOptional = !FILE_STEP_CONFIGS[currentStep].required;
    const currentFileType = FILE_STEP_CONFIGS[currentStep].fileType;

    const stepsItems = FILE_STEP_CONFIGS.map((config, index) => {
        const isOstatkiDone =
            config.fileType === 'Остатки' &&
            (fileStatuses['Остатки'] === 'success' || ostatkiManualStatus === 'success');

        const isDone = isOstatkiDone || fileStatuses[config.fileType] === 'success';

        let stepStatus: 'wait' | 'process' | 'finish' | 'error';
        if (isDone) {
            stepStatus = 'finish';
        } else if (currentStep === index) {
            stepStatus = 'process';
        } else {
            stepStatus = 'wait';
        }

        return {
            title: config.label,
            description: !config.required ? '(опционально)' : undefined,
            status: stepStatus,
        };
    });

    const renderStepContent = () => {
        if (currentFileType === 'Остатки') {
            return (
                <OstatkiStepContent
                    key="Остатки"
                    fileStatus={fileStatuses['Остатки']}
                    savedSelection={savedSelections['Остатки']}
                    existingTables={existingTables}
                    isLoadingTables={isLoadingTables}
                    fileStatuses={fileStatuses}
                    savedSelections={savedSelections}
                    onExistingSaveSuccess={handleSaveSuccess}
                    onManualSaveSuccess={handleOstatkiManualSave}
                    onTablesRefresh={refreshTables}
                    manualStatus={ostatkiManualStatus}
                    equipmentType={equipmentType ?? undefined}
                />
            );
        }

        return (
            <FileStepContent
                key={currentFileType}
                fileType={currentFileType}
                fileStatus={fileStatuses[currentFileType]}
                savedSelection={savedSelections[currentFileType]}
                existingTables={existingTables}
                isLoadingTables={isLoadingTables}
                onSaveSuccess={handleSaveSuccess}
                equipmentType={equipmentType ?? undefined}
            />
        );
    };

    if (!equipmentType) {
        // useEffect выше уже редиректит на главную — рендерим заглушку чтобы избежать ошибок.
        return null;
    }

    return (
        <Layout style={{minHeight: '100vh'}}>
            <Header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingInline: 32,
                    background: colors.headerBg,
                    borderBottom: `3px solid ${colors.accent}`,
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                }}
            >
                <Flex align="center" gap={16}>
                    <Button
                        type="text"
                        icon={<HomeOutlined/>}
                        onClick={() => navigate('/')}
                    >
                        На главную
                    </Button>
                    <span style={{display: 'inline-block', width: 1, height: 24, background: colors.border}} aria-hidden/>
                    <Text style={{color: colors.text, fontSize: 16, fontWeight: 600}}>
                        Загрузка данных
                    </Text>
                    <Tag
                        style={{
                            margin: 0,
                            padding: '2px 10px',
                            fontSize: 13,
                            border: `1px solid ${colors.primary}`,
                            background: 'rgba(0, 154, 68, 0.10)',
                            color: colors.primary,
                            fontWeight: 500,
                        }}
                    >
                        {EQUIPMENT_LABELS[equipmentType]}
                    </Tag>
                </Flex>
                <Flex gap={8}>
                    <Button icon={<ClearOutlined/>} onClick={resetAll}>
                        Очистить
                    </Button>
                    <Button
                        type="primary"
                        icon={<CheckCircleOutlined/>}
                        onClick={handleSubmitAll}
                        disabled={!allConfigured}
                    >
                        Анализ
                    </Button>
                </Flex>
            </Header>

            <Content style={{padding: '32px 24px', maxWidth: 900, margin: '0 auto', width: '100%'}}>
            <Steps
                current={currentStep}
                items={stepsItems}
                onChange={setCurrentStep}
                size="small"
                style={{marginBottom: 24}}
            />

            <Card style={{minHeight: 400, marginBottom: 24}}>
                {renderStepContent()}
            </Card>

            <Flex justify="space-between">
                <Button
                    icon={<LeftOutlined/>}
                    onClick={goPrev}
                    disabled={isFirstStep}
                >
                    Назад
                </Button>
                <Flex gap="small">
                    {isOptional && !isLastStep && (
                        <Button onClick={goNext}>
                            Пропустить
                        </Button>
                    )}
                    {isLastStep ? (
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined/>}
                            onClick={handleSubmitAll}
                            disabled={!allConfigured}
                        >
                            Перейти к анализу
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            onClick={goNext}
                        >
                            Далее <RightOutlined/>
                        </Button>
                    )}
                </Flex>
            </Flex>
            </Content>
        </Layout>
    );
};

export default UploadingPage;
