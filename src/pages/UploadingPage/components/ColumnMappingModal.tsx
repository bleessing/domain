import {useMemo, useState} from 'react';
import {Modal, Stack, Group, Select, Alert, Button} from '@mantine/core';
import {IconInfoCircle} from '@tabler/icons-react';

interface Props {
    open: boolean;
    onClose: () => void;
    /** Каноническое имя → варианты в файле. Пользователь выбирает из available_in_file. */
    missing: string[];
    availableInFile: string[];
    /** Тип таблицы (для текста заголовка). */
    tableType?: string;
    /** Колбэк при подтверждении. Получает { "имя_в_файле": "каноническое" }. */
    onSubmit: (mapping: Record<string, string>) => void;
    isSubmitting?: boolean;
}

/** Внутренняя форма — своё состояние, сбрасывается через key при смене набора колонок. */
function MappingForm({
    missing,
    availableInFile,
    tableType,
    onSubmit,
    isSubmitting,
    onClose,
}: Omit<Props, 'open'>) {
    const [selection, setSelection] = useState<Record<string, string | null>>({});

    const fileColumnData = useMemo(
        () => availableInFile.map((c) => ({label: c, value: c})),
        [availableInFile],
    );

    const allFilled = missing.every((c) => !!selection[c]);

    const handleOk = () => {
        const mapping: Record<string, string> = {};
        for (const canonical of missing) {
            const chosen = selection[canonical];
            if (chosen) mapping[chosen] = canonical;
        }
        onSubmit(mapping);
    };

    return (
        <Stack gap="md">
            <Alert icon={<IconInfoCircle size={18} />} color="tatneft" variant="light">
                {tableType
                    ? `В файле для типа «${tableType}» не распознаны обязательные колонки.`
                    : 'В файле не распознаны обязательные колонки.'}
                {' '}Укажите соответствие — после загрузки колонки сохранятся под каноническими именами.
            </Alert>

            {missing.map((canonical) => (
                <Select
                    key={canonical}
                    label={canonical}
                    placeholder="Выберите колонку из файла"
                    data={fileColumnData}
                    value={selection[canonical] ?? null}
                    onChange={(value) => setSelection((prev) => ({...prev, [canonical]: value}))}
                    searchable
                    clearable
                    comboboxProps={{withinPortal: false}}
                />
            ))}

            <Group justify="flex-end" mt={4}>
                <Button variant="default" onClick={onClose}>Отмена</Button>
                <Button onClick={handleOk} disabled={!allFilled} loading={isSubmitting}>
                    Загрузить с выбранными колонками
                </Button>
            </Group>
        </Stack>
    );
}

/**
 * Модалка ручного маппинга колонок Excel к каноническим именам.
 * Открывается, когда upload вернул 422 с code="MISSING_COLUMNS".
 */
const ColumnMappingModal = ({open, onClose, missing, ...rest}: Props) => (
    <Modal opened={open} onClose={onClose} title="Сопоставление колонок" size={620} centered>
        <MappingForm key={missing.join(',')} missing={missing} onClose={onClose} {...rest} />
    </Modal>
);

export default ColumnMappingModal;
