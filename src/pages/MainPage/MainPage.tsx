import {useNavigate} from 'react-router';
import {Box, Container, SimpleGrid, Paper, Stack, Group, Title, Text, ThemeIcon, Button} from '@mantine/core';
import {IconCylinder, IconTool, IconRulerMeasure, IconArrowRight, IconHome} from '@tabler/icons-react';
import type {EquipmentType} from '@/shared/lib/equipment';
import {EQUIPMENT_LABELS, ALL_EQUIPMENT} from '@/shared/lib/equipment';
import {nc} from '@/shared/lib/mantineTheme';

const EQUIPMENT_DESCRIPTIONS: Record<EquipmentType, string> = {
    PIPES: 'Анализ движения насосно-компрессорных труб: остатки, ремонты, отгрузки и поступления.',
    PUMPS: 'Глубинные штанговые насосы: учёт состояний, движение по этапам, баланс по периоду.',
    RODS: 'Насосные штанги: контроль остатков и движение между состояниями.',
};

const EQUIPMENT_ICONS: Record<EquipmentType, React.ReactNode> = {
    PIPES: <IconCylinder size={26} />,
    PUMPS: <IconTool size={26} />,
    RODS: <IconRulerMeasure size={26} />,
};

const MainPage = () => {
    const navigate = useNavigate();

    const handleSelect = (eq: EquipmentType) => {
        navigate(`/upload?eq=${eq}`);
    };

    return (
        <Box style={{minHeight: '100vh', background: nc.surface}}>
            <Box
                style={{
                    height: 45,
                    display: 'flex',
                    alignItems: 'center',
                    paddingInline: 16,
                    borderBottom: `1px solid ${nc.border}`,
                }}
            >
                <Button
                    variant="subtle"
                    color="gray"
                    size="compact-sm"
                    leftSection={<IconHome size={15} />}
                    onClick={() => navigate('/')}
                >
                    На главную
                </Button>
            </Box>

            <Container size={1100} py={56}>
                <Stack gap={6} mb={36}>
                    <Title order={2} fw={700} c={nc.text}>Выберите тип оборудования</Title>
                    <Text c="dimmed">От этого зависит набор фильтров, формат таблиц и логика расчётов.</Text>
                </Stack>

                <SimpleGrid cols={{base: 1, md: 3}} spacing="lg">
                    {ALL_EQUIPMENT.map((eq) => (
                        <Paper
                            key={eq}
                            withBorder
                            radius="md"
                            p="xl"
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelect(eq)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleSelect(eq);
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
                                    {EQUIPMENT_ICONS[eq]}
                                </ThemeIcon>
                                <Title order={4} c={nc.text}>{EQUIPMENT_LABELS[eq]}</Title>
                                <Text c="dimmed" size="sm" style={{minHeight: 66}}>{EQUIPMENT_DESCRIPTIONS[eq]}</Text>
                                <Group gap={6}>
                                    <Text size="sm" fw={500} c={nc.green}>Начать</Text>
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

export default MainPage;
