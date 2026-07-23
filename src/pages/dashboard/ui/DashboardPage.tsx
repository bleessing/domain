import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Container, Group, Stack, Button, Text, Loader, SegmentedControl, Paper, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconHome } from '@tabler/icons-react';
import { useSearchParams, useNavigate } from 'react-router';
import { useGetFilterOptionsQuery } from '@/entities/filter/api/filterApiSlice';

// Хуки данных импортируются напрямую из model-файлов,
// чтобы не тянуть Plotly через barrel-файлы виджетов
import { useSankeyData } from '@/widgets/sankey-diagram/model/useSankeyData';
import { useBalanceData } from '@/widgets/balance-table/model/useBalanceData';
import { useDynamicsData } from '@/widgets/dynamics-chart/model/useDynamicsData';
import { useLeftoversData } from '@/widgets/leftovers-chart/model/useLeftoversData';
import { useWaterfallData } from '@/widgets/waterfall-chart/model/useWaterfallData';

// BalanceTable не использует Plotly — можно грузить сразу
import BalanceTable from '@/widgets/balance-table/ui/BalanceTable';

import { FiltersPanel } from '@/features/filters';
import { ExportButtons } from '@/features/export';
import type { FilterParams } from '@/entities/filter';
import { nc } from '@/shared/lib/mantineTheme';

// Тяжёлые Plotly-компоненты (~3MB) — загружаются лениво при первом показе данных
const SankeyDiagram = lazy(() => import('@/widgets/sankey-diagram/ui/SankeyDiagram'));
const DynamicsChart = lazy(() => import('@/widgets/dynamics-chart/ui/DynamicsChart'));
const LeftoversChart = lazy(() => import('@/widgets/leftovers-chart/ui/LeftoversChart'));
const WaterfallChart = lazy(() => import('@/widgets/waterfall-chart/ui/WaterfallChart'));

const ChartFallback = (
    <Group justify="center" p={48}>
        <Loader color="tatneft" aria-label="Загрузка графика..." />
    </Group>
);

function DashboardPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Получаем названия таблиц из URL
    const zvz_table = searchParams.get('zvz_table') || '';
    const rss_table = searchParams.get('rss_table') || '';
    const og_table = searchParams.get('og_table') || '';
    const vg_table = searchParams.get('vg_table') || '';
    // Тип оборудования с главной страницы — попадёт в каждый API-запрос.
    const equipment_type = searchParams.get('eq') || undefined;
    // Таблицы остатков: на начало и на конец периода.
    const leftovers_table_legacy = searchParams.get('leftovers_table') || '';
    const ost_table_start = searchParams.get('leftovers_table_start') || '';
    const ost_table_end = searchParams.get('leftovers_table_end') || leftovers_table_legacy;

    const [dynamicsChartType, setDynamicsChartType] = useState<'bar' | 'line'>('bar');

    const [currentFilters, setCurrentFilters] = useState<FilterParams>({
        zvz_table,
        rss_table,
        og_table,
        vg_table,
        ost_table_start: ost_table_start || undefined,
        ost_table_end: ost_table_end || undefined,
        sources_mode: 'in',
        targets_mode: 'in',
        diameters_mode: 'in',
        types_mode: 'in',
        states_mode: 'in',
        sources: [],
        targets: [],
        diameters: [],
        types: [],
        states: [],
        date_from: null,
        date_to: null,
        is_leftovers: false,
        equipment_type,
    });

    const { data: filterOptions, isLoading: isLoadingFilters, isError: isFilterError } =
        useGetFilterOptionsQuery(
            {
                zvz_table,
                rss_table,
                og_table: og_table || undefined,
                vg_table: vg_table || undefined,
                equipment_type,
            },
            { skip: !zvz_table || !rss_table },
        );

    useEffect(() => {
        if (isFilterError) {
            notifications.show({ color: 'brandRed', message: 'Ошибка при загрузке фильтров' });
        }
    }, [isFilterError]);

    // Подставляем даты из filterOptions как дефолтные, пока пользователь их не выбрал вручную
    const effectiveFilters = useMemo<FilterParams>(() => ({
        ...currentFilters,
        date_from: currentFilters.date_from ?? filterOptions?.date_range.min ?? null,
        date_to: currentFilters.date_to ?? filterOptions?.date_range.max ?? null,
    }), [currentFilters, filterOptions]);

    const sankeyWidget = useSankeyData();
    const balanceWidget = useBalanceData();
    const dynamicsWidget = useDynamicsData();
    const leftoversWidget = useLeftoversData();
    const waterfallWidget = useWaterfallData();

    // Суффикс заголовков с выбранными состояниями
    const statesSuffix = useMemo(
        () => (!currentFilters.states?.length ? '' : ` (${currentFilters.states.join(', ')})`),
        [currentFilters.states],
    );

    const handleApplyFilters = useCallback(async () => {
        // Для графика остатков всегда используем is_leftovers: true
        const leftoverFilters = { ...effectiveFilters, is_leftovers: true };

        try {
            await Promise.all([
                sankeyWidget.loadData(effectiveFilters),
                balanceWidget.loadData(effectiveFilters),
                dynamicsWidget.loadData(effectiveFilters),
                leftoversWidget.loadData(leftoverFilters),
                waterfallWidget.loadData(effectiveFilters),
            ]);
        } catch (error) {
            notifications.show({ color: 'brandRed', message: 'Ошибка при загрузке данных' });
            console.error('handleApplyFilters error:', error);
        }
    }, [effectiveFilters, sankeyWidget, balanceWidget, dynamicsWidget, leftoversWidget, waterfallWidget]);

    if (!zvz_table || !rss_table) {
        return (
            <Container size={640} py={80}>
                <Stack align="center" gap="sm">
                    <Title order={3} c={nc.text}>Отсутствуют параметры таблиц</Title>
                    <Text c="dimmed" ta="center">
                        Вернитесь на страницу загрузки и выберите таблицы.
                    </Text>
                    <Button leftSection={<IconHome size={16} />} onClick={() => navigate('/')}>
                        На главную
                    </Button>
                </Stack>
            </Container>
        );
    }

    if (isLoadingFilters) {
        return (
            <Stack align="center" gap="sm" py={80}>
                <Loader color="tatneft" />
                <Text c="dimmed">Загрузка фильтров...</Text>
            </Stack>
        );
    }

    return (
        <Box style={{ minHeight: '100vh', background: nc.surface }}>
            <Box
                style={{
                    minHeight: 45,
                    display: 'flex',
                    alignItems: 'center',
                    paddingInline: 16,
                    borderBottom: `1px solid ${nc.border}`,
                    flexWrap: 'wrap',
                    gap: 12,
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
                <Text c={nc.dimmed}>/</Text>
                <Text size="sm" fw={600} c={nc.text}>Экспорт данных</Text>
                <ExportButtons filters={effectiveFilters} />
            </Box>

            <Container size={1600} py="lg">
                <Group align="flex-start" gap="lg" wrap="nowrap" style={{ overflowX: 'auto' }}>
                    <FiltersPanel
                        filterOptions={filterOptions ?? null}
                        currentFilters={effectiveFilters}
                        onFilterChange={setCurrentFilters}
                        onApplyFilters={handleApplyFilters}
                        isLoading={sankeyWidget.isLoading}
                    />

                    <Box style={{ flex: 1, minWidth: 0 }}>
                        {sankeyWidget.data ? (
                            <Suspense fallback={ChartFallback}>
                                <SankeyDiagram
                                    colorScheme='pastel'
                                    data={sankeyWidget.data}
                                    title={`Учет движения ГНО${statesSuffix}`}
                                />
                            </Suspense>
                        ) : (
                            <Paper withBorder radius="md" p={48} style={{ borderColor: nc.border }}>
                                <Text c="dimmed" ta="center">
                                    Нет данных для отображения. Настройте фильтры и нажмите «Обновить диаграмму».
                                </Text>
                            </Paper>
                        )}
                    </Box>
                </Group>

                <Stack gap="lg" mt="lg">
                    {balanceWidget.data.length > 0 && <BalanceTable data={balanceWidget.data} />}

                    {dynamicsWidget.data && (
                        <Stack gap="sm">
                            <Group gap="md">
                                <Text size="sm" fw={500} c={nc.text}>Тип графика динамики:</Text>
                                <SegmentedControl
                                    value={dynamicsChartType}
                                    onChange={(v) => setDynamicsChartType(v as 'bar' | 'line')}
                                    color="tatneft"
                                    size="xs"
                                    data={[
                                        { value: 'bar', label: 'Гистограмма' },
                                        { value: 'line', label: 'Линейный график' },
                                    ]}
                                />
                            </Group>
                            <Suspense fallback={ChartFallback}>
                                <DynamicsChart
                                    data={dynamicsWidget.data}
                                    chartType={dynamicsChartType}
                                    title={`Динамика${statesSuffix}`}
                                />
                            </Suspense>
                        </Stack>
                    )}

                    {leftoversWidget.data && (
                        <Suspense fallback={ChartFallback}>
                            <LeftoversChart
                                data={leftoversWidget.data}
                                title={`Накопительный баланс${statesSuffix}`}
                            />
                        </Suspense>
                    )}

                    {waterfallWidget.data && (
                        <Suspense fallback={ChartFallback}>
                            <WaterfallChart
                                data={waterfallWidget.data}
                                title={`Waterfall${statesSuffix}`}
                            />
                        </Suspense>
                    )}
                </Stack>
            </Container>
        </Box>
    );
}

export default DashboardPage;
