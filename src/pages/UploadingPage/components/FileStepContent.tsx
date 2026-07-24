import {useState} from 'react';
import {Stack, Group, Text, Select, Button, Box} from '@mantine/core';
import {Dropzone, MIME_TYPES} from '@mantine/dropzone';
import {notifications} from '@mantine/notifications';
import {IconUpload, IconFileSpreadsheet, IconX, IconCircleCheck} from '@tabler/icons-react';
import {type FileType} from '@/shared/api/tablesApi';
import {API_V2_BASE_URL} from '@/shared/lib/constants';
import type {UploadStatus, FileSelection} from '../types';
import {getErrorMessage, getFileTypeLabel} from '../types';
import {nc} from '@/shared/lib/mantineTheme';
import UploadErrorModal from './UploadErrorModal';
import ColumnMappingModal from './ColumnMappingModal';
import {useFileUploadState} from './useFileUploadState';

interface FileStepContentProps {
    fileType: FileType;
    tableType: string;
    fileStatus: UploadStatus;
    savedSelection: FileSelection | null;
    onSaveSuccess: (fileType: FileType, selection: FileSelection) => void;
    equipmentType?: 'PIPES' | 'PUMPS' | 'RODS';
}

const EXCEL_MIME = [MIME_TYPES.xlsx, MIME_TYPES.xls];

function DropzoneBody({label}: {label: string}) {
    return (
        <Group justify="center" gap="md" mih={110} style={{pointerEvents: 'none'}}>
            <Dropzone.Accept><IconUpload size={34} color={nc.green} /></Dropzone.Accept>
            <Dropzone.Reject><IconX size={34} color={nc.red} /></Dropzone.Reject>
            <Dropzone.Idle><IconFileSpreadsheet size={34} color={nc.dimmed} /></Dropzone.Idle>
            <div>
                <Text size="sm" c={nc.text}>{label}</Text>
                <Text size="xs" c="dimmed">Форматы: .xlsx, .xls</Text>
            </div>
        </Group>
    );
}

const FileStepContent = ({
    fileType,
    tableType,
    fileStatus,
    savedSelection,
    onSaveSuccess,
    equipmentType,
}: FileStepContentProps) => {
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

    const [dvFile, setDvFile] = useState<File | null>(savedSelection?.dvFile || null);
    const isRssStep = fileType === 'RSS';

    const [mappingModalOpen, setMappingModalOpen] = useState(false);
    const [missingColumns, setMissingColumns] = useState<string[]>([]);
    const [availableColumnsInFile, setAvailableColumnsInFile] = useState<string[]>([]);
    const [mappingTableType, setMappingTableType] = useState<string>('');

    const isSaved = fileStatus === 'success';

    const performUpload = async (columnMappingJson?: string): Promise<boolean> => {
        const formData = new FormData();
        formData.append('files', uploadedFile as File);
        if (isRssStep && dvFile) {
            formData.append('files', dvFile);
        }
        formData.append('table_type', tableType);
        if (equipmentType) {
            formData.append('equipment_type', equipmentType);
        }
        if (selectedSheet) {
            formData.append('sheet_name', selectedSheet);
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
                setMappingTableType(detail.table_type || tableType);
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

        onSaveSuccess(fileType, {
            type: 'upload',
            file: uploadedFile as File,
            workbook: workbook || undefined,
            sheetNames,
            selectedSheet,
            dvFile: isRssStep ? dvFile || undefined : undefined,
        });

        notifications.show({color: 'tatneft', message: `${getFileTypeLabel(fileType)} загружен на сервер`});
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
            {isRssStep && <Text size="sm" fw={500} c={nc.text}>Файл РСС</Text>}
            <Dropzone
                onDrop={(files) => handleFile(files[0] ?? null)}
                accept={EXCEL_MIME}
                multiple={false}
                maxFiles={1}
                radius="md"
            >
                <DropzoneBody label="Перетащите файл или нажмите" />
            </Dropzone>

            {uploadedFile && (
                <Group gap={6}>
                    <IconFileSpreadsheet size={16} color={nc.green} />
                    <Text size="sm" c={nc.text}>{uploadedFile.name}</Text>
                </Group>
            )}

            {isRssStep && (
                <Box>
                    <Text size="sm" fw={500} c={nc.text} mb={6}>
                        Файл ДВ <Text span c="dimmed" size="xs">(опционально)</Text>
                    </Text>
                    <Dropzone
                        onDrop={(files) => setDvFile(files[0] ?? null)}
                        accept={EXCEL_MIME}
                        multiple={false}
                        maxFiles={1}
                        radius="md"
                    >
                        <DropzoneBody label="Файл ДВ (дефектная ведомость) — необязательно" />
                    </Dropzone>
                    {dvFile && (
                        <Group gap={6} mt={6}>
                            <IconFileSpreadsheet size={16} color={nc.green} />
                            <Text size="sm" c={nc.text}>{dvFile.name}</Text>
                        </Group>
                    )}
                </Box>
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

export default FileStepContent;
