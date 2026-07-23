import {useState} from 'react';
import {Stack, Group, Text, Select, NumberInput, Button} from '@mantine/core';
import {Dropzone, MIME_TYPES} from '@mantine/dropzone';
import {notifications} from '@mantine/notifications';
import {IconUpload, IconFileSpreadsheet, IconX, IconCircleCheck} from '@tabler/icons-react';
import {API_V2_BASE_URL} from '@/shared/lib/constants';
import {type UploadStatus, type FileSelection, getErrorMessage} from '../types';
import {nc} from '@/shared/lib/mantineTheme';
import UploadErrorModal from './UploadErrorModal';
import ColumnMappingModal from './ColumnMappingModal';
import {useFileUploadState} from './useFileUploadState';

interface OstatkiStepContentProps {
    fileStatus: UploadStatus;
    savedSelection: FileSelection | null;
    onSaveSuccess: (fileType: 'Остатки', selection: FileSelection) => void;
    equipmentType?: 'PIPES' | 'PUMPS' | 'RODS';
}

const EXCEL_MIME = [MIME_TYPES.xlsx, MIME_TYPES.xls];

const OstatkiStepContent = ({
    fileStatus,
    savedSelection,
    onSaveSuccess,
    equipmentType,
}: OstatkiStepContentProps) => {
    const {
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
    } = useFileUploadState(savedSelection);

    const [year, setYear] = useState<number | ''>('');

    const [mappingModalOpen, setMappingModalOpen] = useState(false);
    const [missingColumns, setMissingColumns] = useState<string[]>([]);
    const [availableColumnsInFile, setAvailableColumnsInFile] = useState<string[]>([]);
    const [mappingTableType, setMappingTableType] = useState<string>('');

    const isSaved = fileStatus === 'success';

    const performUpload = async (columnMappingJson?: string): Promise<boolean> => {
        const formData = new FormData();
        formData.append('files', uploadedFile as File);
        formData.append('table_type', 'ostatki');
        if (equipmentType) {
            formData.append('equipment_type', equipmentType);
        }
        if (selectedSheet) {
            formData.append('sheet_name', selectedSheet);
        }
        if (year !== '') {
            formData.append('year', String(year));
        }
        if (columnMappingJson) {
            formData.append('column_mapping', columnMappingJson);
        }

        const response = await fetch(`${API_V2_BASE_URL}/upload`, {
            method: 'POST',
            headers: {'ngrok-skip-browser-warning': 'false'},
            body: formData,
        });

        if (response.status === 422) {
            const errorData = await response.json();
            const detail = errorData?.detail;
            if (detail?.code === 'MISSING_COLUMNS') {
                setMissingColumns(detail.missing || []);
                setAvailableColumnsInFile(detail.available_in_file || []);
                setMappingTableType(detail.table_type || 'ostatki');
                setMappingModalOpen(true);
                return false;
            }
            setErrorMessage(detail?.message || 'Ошибка валидации таблиц');
            setMissingCombinations(detail?.missing_combinations || []);
            setDictionaryType(detail?.dictionary_type || 'RSS');
            setErrorModalOpen(true);
            return false;
        }
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Ошибка ответа:', errorText);
            let detailText = `${response.status} ${response.statusText}`;
            try {
                const parsed = JSON.parse(errorText);
                if (typeof parsed?.detail === 'string') {
                    detailText = parsed.detail;
                } else if (parsed?.detail?.message) {
                    detailText = parsed.detail.message;
                }
            } catch { /* errorText не JSON — оставляем status text */ }
            notifications.show({color: 'brandRed', message: `Ошибка при загрузке: ${detailText}`});
            return false;
        }

        onSaveSuccess('Остатки', {
            type: 'upload',
            file: uploadedFile as File,
            workbook: workbook || undefined,
            sheetNames,
            selectedSheet,
        });

        notifications.show({color: 'tatneft', message: 'Остатки загружены на сервер'});
        return true;
    };

    const handleSaveUpload = async () => {
        if (!uploadedFile) {
            notifications.show({color: 'yellow', message: 'Пожалуйста, загрузите файл'});
            return;
        }
        setIsUploading(true);
        try {
            await performUpload();
        } catch (error: unknown) {
            notifications.show({color: 'brandRed', message: `Ошибка при загрузке файла: ${getErrorMessage(error)}`});
        } finally {
            setIsUploading(false);
        }
    };

    const handleMappingSubmit = async (mapping: Record<string, string>) => {
        setIsUploading(true);
        try {
            const ok = await performUpload(JSON.stringify(mapping));
            if (ok) setMappingModalOpen(false);
        } catch (error: unknown) {
            notifications.show({color: 'brandRed', message: `Ошибка при загрузке файла: ${getErrorMessage(error)}`});
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Stack gap="md">
            <Dropzone
                onDrop={(files) => handleFile(files[0] ?? null)}
                accept={EXCEL_MIME}
                multiple={false}
                maxFiles={1}
                radius="md"
            >
                <Group justify="center" gap="md" mih={110} style={{pointerEvents: 'none'}}>
                    <Dropzone.Accept><IconUpload size={34} color={nc.green} /></Dropzone.Accept>
                    <Dropzone.Reject><IconX size={34} color={nc.red} /></Dropzone.Reject>
                    <Dropzone.Idle><IconFileSpreadsheet size={34} color={nc.dimmed} /></Dropzone.Idle>
                    <div>
                        <Text size="sm" c={nc.text}>Кликните или перетащите файл для загрузки</Text>
                        <Text size="xs" c="dimmed">Форматы: .xlsx, .xls</Text>
                    </div>
                </Group>
            </Dropzone>

            {uploadedFile && (
                <Group gap={6}>
                    <IconFileSpreadsheet size={16} color={nc.green} />
                    <Text size="sm" c={nc.text}>{uploadedFile.name}</Text>
                </Group>
            )}

            {uploadedFile && sheetNames.length > 0 && (
                <Select
                    label="Лист (страница)"
                    description="По умолчанию — первый осмысленный лист"
                    placeholder="Выберите лист"
                    value={selectedSheet || null}
                    onChange={(v) => setSelectedSheet(v ?? '')}
                    data={sheetNames.map((name) => ({value: name, label: name}))}
                    clearable
                    comboboxProps={{withinPortal: false}}
                />
            )}

            {uploadedFile && (
                <NumberInput
                    label="Год"
                    description="Опционально — для дат без года («1 января», «30 марта»)"
                    placeholder="Например, 2026"
                    value={year}
                    onChange={(v) => setYear(typeof v === 'number' ? v : '')}
                    min={2000}
                    max={2100}
                    allowDecimal={false}
                    hideControls
                />
            )}

            <Button
                onClick={handleSaveUpload}
                fullWidth
                loading={isUploading}
                disabled={isSaved}
                color={isSaved ? 'gray' : 'tatneft'}
                leftSection={isSaved ? <IconCircleCheck size={16} /> : undefined}
            >
                {isSaved ? 'Сохранено' : 'Загрузить'}
            </Button>

            <UploadErrorModal
                open={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                errorMessage={errorMessage}
                missingCombinations={missingCombinations}
                dictionaryType={dictionaryType}
            />
            <ColumnMappingModal
                open={mappingModalOpen}
                onClose={() => setMappingModalOpen(false)}
                missing={missingColumns}
                availableInFile={availableColumnsInFile}
                tableType={mappingTableType}
                onSubmit={handleMappingSubmit}
                isSubmitting={isUploading}
            />
        </Stack>
    );
};

export default OstatkiStepContent;
