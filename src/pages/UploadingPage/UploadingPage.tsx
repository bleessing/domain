import {useState, useEffect} from 'react';
import {Box, Container, Group, Button, Paper, Stepper, Text, Badge} from '@mantine/core';
import {notifications} from '@mantine/notifications';
import {
    IconHome, IconEraser, IconCircleCheck, IconChevronLeft, IconChevronRight,
} from '@tabler/icons-react';
import {useNavigate, useSearchParams} from 'react-router';
import type {FileType} from '@/shared/api/tablesApi';
import type {UploadStatus, FileSelection, StepId} from './types';
import {STEP_CONFIGS, BACKEND_TABLE_TYPE, buildQueryParams} from './types';
import FileStepContent from './components/FileStepContent';
import OstatkiStepContent from './components/OstatkiStepContent';
import {EQUIPMENT_LABELS, isEquipmentType, type EquipmentType} from '@/shared/lib/equipment';
import {nc} from '@/shared/lib/mantineTheme';

const INITIAL_STATUSES: Record<FileType, UploadStatus> = {
    'ZVZ': 'idle', 'RSS': 'idle', 'Словарь': 'idle', 'Остатки': 'idle',
    'OG': 'idle', 'VG': 'idle', 'DV': 'idle',
};

const INITIAL_SELECTIONS: Record<FileType, FileSelection | null> = {
    'ZVZ': null, 'RSS': null, 'Словарь': null, 'Остатки': null,
    'OG': null, 'VG': null, 'DV': null,
};

/** Завершён ли шаг: все обязательные для него таблицы загружены. */
function isStepComplete(id: StepId, statuses: Record<FileType, UploadStatus>): boolean {
    switch (id) {
        case 'RSS': return statuses['RSS'] === 'success';
        case 'ZVZ': return statuses['ZVZ'] === 'success';
        case 'SHIPMENT': return statuses['OG'] === 'success' && statuses['VG'] === 'success';
        case 'OSTATKI': return statuses['Остатки'] === 'success';
    }
}

const UploadingPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const equipmentParam = searchParams.get('eq');
    const equipmentType: EquipmentType | null = isEquipmentType(equipmentParam) ? equipmentParam : null;

    useEffect(() => {
        if (!equipmentType) {
            navigate('/', {replace: true});
        }
    }, [equipmentType, navigate]);

    const [currentStep, setCurrentStep] = useState(0);
    const [fileStatuses, setFileStatuses] = useState<Record<FileType, UploadStatus>>({...INITIAL_STATUSES});
    const [savedSelections, setSavedSelections] = useState<Record<FileType, FileSelection | null>>({...INITIAL_SELECTIONS});

    const handleSaveSuccess = (fileType: FileType, selection: FileSelection) => {
        const nextStatuses: Record<FileType, UploadStatus> = {...fileStatuses, [fileType]: 'success'};
        const nextSelections: Record<FileType, FileSelection | null> = {...savedSelections, [fileType]: selection};

        // Загрузка РСС опционально включает ДВ — помечаем и его.
        if (fileType === 'RSS') {
            nextStatuses['DV'] = 'success';
            nextSelections['DV'] = {type: 'upload', dvFile: selection.dvFile};
        }
        // Отгрузка/Поступление — один файл: покрывает оба типа сразу.
        if (fileType === 'OG') {
            nextStatuses['VG'] = 'success';
            nextSelections['VG'] = selection;
        }

        setFileStatuses(nextStatuses);
        setSavedSelections(nextSelections);

        const currentId = STEP_CONFIGS[currentStep].id;
        if (isStepComplete(currentId, nextStatuses) && currentStep < STEP_CONFIGS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const resetAll = () => {
        setFileStatuses({...INITIAL_STATUSES});
        setSavedSelections({...INITIAL_SELECTIONS});
        setCurrentStep(0);
    };

    const allConfigured =
        fileStatuses['RSS'] === 'success' &&
        fileStatuses['DV'] === 'success' &&
        fileStatuses['ZVZ'] === 'success' &&
        fileStatuses['OG'] === 'success' &&
        fileStatuses['VG'] === 'success';

    const handleSubmitAll = () => {
        if (!allConfigured) {
            notifications.show({color: 'yellow', message: 'Настройте РСС + ДВ, Завоз/Вывоз, Отгрузку/Поступление'});
            return;
        }
        const queryString = buildQueryParams(equipmentType ?? undefined);
        notifications.show({color: 'tatneft', message: 'Открываем дашборд…'});
        setTimeout(() => navigate(`/main?${queryString}`), 400);
    };

    const goNext = () => setCurrentStep((prev) => Math.min(prev + 1, STEP_CONFIGS.length - 1));
    const goPrev = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

    const currentConfig = STEP_CONFIGS[currentStep];
    const isLastStep = currentStep === STEP_CONFIGS.length - 1;
    const isFirstStep = currentStep === 0;
    const isOptional = !currentConfig.required;

    const renderStepContent = () => {
        switch (currentConfig.id) {
            case 'OSTATKI':
                return (
                    <OstatkiStepContent
                        key="Остатки"
                        fileStatus={fileStatuses['Остатки']}
                        savedSelection={savedSelections['Остатки']}
                        onSaveSuccess={handleSaveSuccess}
                        equipmentType={equipmentType ?? undefined}
                    />
                );
            case 'SHIPMENT':
                // Отгрузка и поступление — один файл, поэтому один загрузчик.
                return (
                    <FileStepContent
                        key="OG"
                        fileType="OG"
                        tableType={BACKEND_TABLE_TYPE.SHIPMENT}
                        fileStatus={fileStatuses['OG']}
                        savedSelection={savedSelections['OG']}
                        onSaveSuccess={handleSaveSuccess}
                        equipmentType={equipmentType ?? undefined}
                    />
                );
            default: {
                const fileType: FileType = currentConfig.id === 'ZVZ' ? 'ZVZ' : 'RSS';
                return (
                    <FileStepContent
                        key={fileType}
                        fileType={fileType}
                        tableType={BACKEND_TABLE_TYPE[currentConfig.id]}
                        fileStatus={fileStatuses[fileType]}
                        savedSelection={savedSelections[fileType]}
                        onSaveSuccess={handleSaveSuccess}
                        equipmentType={equipmentType ?? undefined}
                    />
                );
            }
        }
    };

    if (!equipmentType) {
        return null;
    }

    return (
        <Box style={{minHeight: '100vh', background: nc.surface}}>
            <Box
                style={{
                    minHeight: 45,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingInline: 16,
                    borderBottom: `1px solid ${nc.border}`,
                }}
            >
                <Group gap="xs">
                    <Button
                        variant="subtle"
                        color="gray"
                        size="compact-sm"
                        leftSection={<IconHome size={15} />}
                        onClick={() => navigate('/')}
                    >
                        На главную
                    </Button>
                    <Text c={nc.dimmed}>/</Text>
                    <Text size="sm" fw={600} c={nc.text}>Загрузка данных</Text>
                    <Badge variant="light" color="tatneft" radius="sm">{EQUIPMENT_LABELS[equipmentType]}</Badge>
                </Group>
                <Group gap="xs">
                    <Button variant="default" size="compact-sm" leftSection={<IconEraser size={15} />} onClick={resetAll}>
                        Очистить
                    </Button>
                    <Button
                        size="compact-sm"
                        leftSection={<IconCircleCheck size={15} />}
                        onClick={handleSubmitAll}
                        disabled={!allConfigured}
                    >
                        Анализ
                    </Button>
                </Group>
            </Box>

            <Container size={780} py={40}>
                <Stepper
                    active={currentStep}
                    onStepClick={setCurrentStep}
                    color="tatneft"
                    size="sm"
                    completedIcon={<IconCircleCheck size={18} />}
                    mb="xl"
                >
                    {STEP_CONFIGS.map((config) => (
                        <Stepper.Step
                            key={config.id}
                            label={config.label}
                            description={!config.required ? 'опционально' : undefined}
                            icon={isStepComplete(config.id, fileStatuses) ? <IconCircleCheck size={18} /> : undefined}
                        />
                    ))}
                </Stepper>

                <Paper withBorder radius="md" p="xl" mih={360} style={{borderColor: nc.border}}>
                    {renderStepContent()}
                </Paper>

                <Group justify="space-between" mt="lg">
                    <Button
                        variant="default"
                        leftSection={<IconChevronLeft size={16} />}
                        onClick={goPrev}
                        disabled={isFirstStep}
                    >
                        Назад
                    </Button>
                    <Group gap="xs">
                        {isOptional && !isLastStep && (
                            <Button variant="subtle" color="gray" onClick={goNext}>Пропустить</Button>
                        )}
                        {isLastStep ? (
                            <Button
                                leftSection={<IconCircleCheck size={16} />}
                                onClick={handleSubmitAll}
                                disabled={!allConfigured}
                            >
                                Перейти к анализу
                            </Button>
                        ) : (
                            <Button rightSection={<IconChevronRight size={16} />} onClick={goNext}>
                                Далее
                            </Button>
                        )}
                    </Group>
                </Group>
            </Container>
        </Box>
    );
};

export default UploadingPage;
