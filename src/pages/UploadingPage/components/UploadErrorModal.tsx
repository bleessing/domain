import {useState} from 'react';
import {Modal, Table, Button, message} from 'antd';
import {SendOutlined, CheckCircleOutlined} from '@ant-design/icons';
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
        setLoadingRows(prev => ({...prev, [index]: true}));
        try {
            const response = await fetch(`${API_BASE_URL}/dictionary/${dictionaryType}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'false',
                },
                body: JSON.stringify({data}),
            });
            if (!response.ok) {
                const errorText = await response.text();
                message.error(errorText || `Ошибка ${response.status}`);
                return;
            }
            setSentRows(prev => new Set(prev).add(index));
            message.success('Запись добавлена в словарь');
        } catch (error) {
            message.error(`Ошибка: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setLoadingRows(prev => ({...prev, [index]: false}));
        }
    };

    const columns = missingCombinations.length > 0
        ? [
            ...Object.keys(missingCombinations[0]).map(key => ({
                title: key,
                dataIndex: key,
                key,
            })),
            {
                title: '',
                key: 'action',
                render: (_: unknown, record: MissingCombination, index: number) => {
                    const isSent = sentRows.has(index);
                    return isSent ? (
                        <Button
                            size="small"
                            disabled
                            icon={<CheckCircleOutlined/>}
                            style={{color: '#52c41a', borderColor: '#b7eb8f'}}
                        >
                            Отправлено
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            icon={<SendOutlined/>}
                            loading={loadingRows[index]}
                            onClick={() => void handleSendToDictionary(record, index)}
                            size="small"
                        >
                            В словарь
                        </Button>
                    );
                },
            },
        ]
        : [];

    return (
        <Modal
            title={`Ошибка валидации — отправлено ${sentRows.size} из ${missingCombinations.length}`}
            open={open}
            onCancel={onClose}
            onOk={onClose}
            width={1200}
            cancelButtonProps={{style: {display: 'none'}}}
        >
            <p style={{marginBottom: 16}}>{errorMessage}</p>
            {missingCombinations.length > 0 && (
                <Table
                    dataSource={missingCombinations.map((item, index) => ({...item, key: String(index)}))}
                    columns={columns}
                    pagination={missingCombinations.length > 10 ? {pageSize: 10} : false}
                    size="large"
                    scroll={{x: 'max-content'}}
                />
            )}
        </Modal>
    );
};

export default UploadErrorModal;
