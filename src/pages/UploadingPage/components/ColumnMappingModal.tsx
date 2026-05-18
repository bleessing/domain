import { useEffect, useMemo, useState } from 'react';
import { Modal, Select, Space, Typography, Alert } from 'antd';

const { Text } = Typography;

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

/**
 * Модалка для ручного маппинга колонок Excel-файла к каноническим именам.
 * Открывается, когда upload вернул 422 с code="MISSING_COLUMNS".
 */
const ColumnMappingModal = ({
    open,
    onClose,
    missing,
    availableInFile,
    tableType,
    onSubmit,
    isSubmitting = false,
}: Props) => {
    // Состояние: каноническое имя (что мы ищем) → выбранное имя в файле.
    const [selection, setSelection] = useState<Record<string, string | undefined>>({});

    useEffect(() => {
        if (open) setSelection({});
    }, [open, missing.join(',')]);

    const fileColumnOptions = useMemo(
        () => availableInFile.map(c => ({ label: c, value: c })),
        [availableInFile],
    );

    const allFilled = missing.every(c => !!selection[c]);

    const handleOk = () => {
        // Собираем формат который ждёт бэк: {имя_в_файле: каноническое_имя}.
        const mapping: Record<string, string> = {};
        for (const canonical of missing) {
            const chosen = selection[canonical];
            if (chosen) mapping[chosen] = canonical;
        }
        onSubmit(mapping);
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            okText="Загрузить с выбранными колонками"
            cancelText="Отмена"
            okButtonProps={{ disabled: !allFilled, loading: isSubmitting }}
            title="Сопоставление колонок"
            width={620}
            maskClosable={!isSubmitting}
        >
            <Alert
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
                message={
                    tableType
                        ? `В файле для типа "${tableType}" не распознаны обязательные колонки.`
                        : 'В файле не распознаны обязательные колонки.'
                }
                description="Укажите соответствие. После загрузки колонки будут сохранены в БД под каноническими именами."
            />

            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {missing.map(canonical => (
                    <div key={canonical}>
                        <Text strong>{canonical}</Text>
                        <Select
                            style={{ width: '100%', marginTop: 4 }}
                            placeholder="Выберите колонку из файла"
                            options={fileColumnOptions}
                            value={selection[canonical]}
                            onChange={value => setSelection(prev => ({ ...prev, [canonical]: value }))}
                            showSearch
                            optionFilterProp="label"
                            allowClear
                        />
                    </div>
                ))}
            </Space>
        </Modal>
    );
};

export default ColumnMappingModal;
