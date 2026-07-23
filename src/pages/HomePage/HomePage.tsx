import {useNavigate} from 'react-router';
import {Box, Container, SimpleGrid, Paper, Stack, Group, Title, Text, ThemeIcon} from '@mantine/core';
import {IconChartBar, IconCloudUpload, IconArrowRight} from '@tabler/icons-react';
import {nc} from '@/shared/lib/mantineTheme';

interface Action {
    key: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    to: string;
}

const ACTIONS: Action[] = [
    {
        key: 'calculate',
        title: 'Рассчитать отчёт',
        description: 'Сформировать готовый отчёт (РСС, материальный баланс или отбраковка) и скачать в Excel.',
        icon: <IconChartBar size={26} />,
        to: '/calculate',
    },
    {
        key: 'upload',
        title: 'Загрузить данные',
        description: 'Загрузить исходные таблицы (завоз/вывоз, РСС, отгрузка/поступление, остатки) для отчётов.',
        icon: <IconCloudUpload size={26} />,
        to: '/upload-select',
    },
];

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <Box style={{minHeight: '100vh', background: nc.surface}}>
            <Container size={860} py={72}>
                <Stack gap={6} mb={40}>
                    <Title order={2} fw={700} c={nc.text}>С чего начнём?</Title>
                    <Text c="dimmed">
                        Выберите следующий шаг: рассчитать отчёт по загруженным данным или загрузить новые данные.
                    </Text>
                </Stack>

                <SimpleGrid cols={{base: 1, sm: 2}} spacing="lg">
                    {ACTIONS.map((action) => (
                        <Paper
                            key={action.key}
                            withBorder
                            radius="md"
                            p="xl"
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate(action.to)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    navigate(action.to);
                                }
                            }}
                            style={{borderColor: nc.border, cursor: 'pointer', transition: 'border-color .15s, box-shadow .15s'}}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = nc.green;
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(35,165,119,.12)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = nc.border;
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <Stack gap="md">
                                <ThemeIcon variant="light" color="tatneft" size={54} radius="md">
                                    {action.icon}
                                </ThemeIcon>
                                <Title order={4} c={nc.text}>{action.title}</Title>
                                <Text c="dimmed" size="sm" style={{minHeight: 60}}>{action.description}</Text>
                                <Group gap={6} c={nc.green} style={{color: nc.green, fontWeight: 500}}>
                                    <Text size="sm" fw={500} c={nc.green}>Перейти</Text>
                                    <IconArrowRight size={16} color={nc.green} />
                                </Group>
                            </Stack>
                        </Paper>
                    ))}
                </SimpleGrid>

                <Text ta="center" c="dimmed" size="xs" mt={56}>
                    ЦТР · Платформа мониторинга оборудования
                </Text>
            </Container>
        </Box>
    );
};

export default HomePage;
