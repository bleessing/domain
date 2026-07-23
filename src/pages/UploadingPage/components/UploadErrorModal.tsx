import {useState} from 'react';
import {Modal, Table, Button, Text, ScrollArea} from '@mantine/core';
import {notifications} from '@mantine/notifications';
import {IconSend, IconCircleCheck} from '@tabler/icons-react';
import {API_BASE_URL} from '@/shared/lib/constants';

interface MissingCombination {
    [key: string]: string;
}

interface UploadErrorModalProps {
    open: boolean;
    onClose: () => void;
    errorMessage: string;
    missingCombinations: MissingCombination[];
    dictionaryType?: string;
}

const UploadErrorModal = ({open, onClose, errorMessage, missingCombinations, dictionaryType = 'RSS'}: UploadErrorModalProps) => {
    const [loadingRows, setLoadingRows] = useState<Record<number, boolean>>({});
    const [sentRows, setSentRows] = useState<Set<number>>(new Set());

    const handleSendToDictionary = async (record: MissingCombination, index: number) => {
        const {key, ...data} = record;
        void key;
        setLoadingRows((prev) => ({...prev, [index]: true}));
        try {
            const response = await fetch(`${API_BASE_URL}/dictionary/${dictionaryType}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'false'},
                body: JSON.stringify({data}),
            });
            if (!response.ok) {
                const errorText = await response.text();
                notifications.show({color: 'brandRed', message: errorText || `Ошибка ${response.status}`});
                return;
            }
            setSentRows((prev) => new Set(prev).add(index));
            notifications.show({color: 'tatneft', message: 'Запись добавлена в словарь'});
        } catch (error) {
            notifications.show({color: 'brandRed', message: `Ошибка: ${error instanceof Error ? error.message : String(error)}`});
        } finally {
            setLoadingRows((prev) => ({...prev, [index]: false}));
        }
    };

    const columnKeys = missingCombinations.length > 0 ? Object.keys(missingCombinations[0]) : [];

    return (
        <Modal
            opened={open}
            onClose={onClose}
            title={`Ошибка валидации — отправлено ${sentRows.size} из ${missingCombinations.length}`}
            size={1100}
            centered
        >
            <Text mb="md">{errorMessage}</Text>
            {missingCombinations.length > 0 && (
                <ScrollArea>
                    <Table striped highlightOnHover withTableBorder verticalSpacing="xs">
                        <Table.Thead>
                            <Table.Tr>
                                {columnKeys.map((key) => (
                                    <Table.Th key={key}>{key}</Table.Th>
                                ))}
                                <Table.Th />
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {missingCombinations.map((record, index) => {
                                const isSent = sentRows.has(index);
                                return (
                                    <Table.Tr key={index}>
                                        {columnKeys.map((key) => (
                                            <Table.Td key={key}>{record[key]}</Table.Td>
                                        ))}
                                        <Table.Td>
                                            {isSent ? (
                                                <Button
                                                    size="compact-sm"
                                                    variant="light"
                                                    color="tatneft"
                                                    disabled
                                                    leftSection={<IconCircleCheck size={14} />}
                                                >
                                                    Отправлено
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="compact-sm"
                                                    leftSection={<IconSend size={14} />}
                                                    loading={loadingRows[index]}
                                                    onClick={() => void handleSendToDictionary(record, index)}
                                                >
                                                    В словарь
                                                </Button>
                                            )}
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>
            )}
        </Modal>
    );
};

export default UploadErrorModal;
