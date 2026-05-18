import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Col, Row, Radio, Spin, message } from 'antd';
import { useSearchParams } from 'react-router';
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

// Тяжёлые Plotly-компоненты (~3MB) — загружаются лениво при первом показе данных
const SankeyDiagram = lazy(() => import('@/widgets/sankey-diagram/ui/SankeyDiagram'));
const DynamicsChart = lazy(() => import('@/widgets/dynamics-chart/ui/DynamicsChart'));
const LeftoversChart = lazy(() => import('@/widgets/leftovers-chart/ui/LeftoversChart'));
const WaterfallChart = lazy(() => import('@/widgets/waterfall-chart/ui/WaterfallChart'));

const ChartFallback = (
    <div style={{ padding: '48px', textAlign: 'center' }}>
        <Spin size="large" aria-label="Загрузка графика..." />
    </div>
);

function DashboardPage() {
    const [searchParams] = useSearchParams();

    // Получаем названия таблиц из URL
    const zvz_table = searchParams.get('zvz_table') || '';
    const rss_table = searchParams.get('rss_table') || '';
    const og_table = searchParams.get('og_table') || '';
    const vg_table = searchParams.get('vg_table') || '';
    // Таблицы остатков: на начало и на конец периода. Fallback на старый leftovers_table
    // (он трактуется как «конец», т.к. ранее использовался для всех графиков как текущая картина).
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
    });

    const { data: filterOptions, isLoading: isLoadingFilters, isError: isFilterError } =
        useGetFilterOptionsQuery(
            { zvz_table, rss_table, og_table: og_table || undefined, vg_table: vg_table || undefined },
            { skip: !zvz_table || !rss_table },
        );

    useEffect(() => {
        if (isFilterError) message.error('Ошибка при загрузке фильтров');
    }, [isFilterError]);

    // Подставляем даты из filterOptions как дефолтные, пока пользователь их не выбрал вручную
    const effectiveFilters = useMemo<FilterParams>(() => ({
        ...currentFilters,
        date_from: currentFilters.date_from ?? filterOptions?.date_range.min ?? null,
        date_to: currentFilters.date_to ?? filterOptions?.date_range.max ?? null,
    }), [currentFilters, filterOptions]);

    // Виджеты с их хуками
    const sankeyWidget = useSankeyData();
    const balanceWidget = useBalanceData();
    const dynamicsWidget = useDynamicsData();
    const leftoversWidget = useLeftoversData();
    const waterfallWidget = useWaterfallData();

    // Суффикс заголовков с выбранными состояниями
    const statesSuffix = useMemo(
        () => currentFilters.states?.length > 0 ? ` (${currentFilters.states.join(', ')})` : '',
        [currentFilters.states],
    );

    // Обработка нажатия кнопки "Обновить диаграмму"
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
            message.error('Ошибка при загрузке данных');
            console.error('handleApplyFilters error:', error);
        }
    }, [effectiveFilters, sankeyWidget, balanceWidget, dynamicsWidget, leftoversWidget, waterfallWidget]);

    if (!zvz_table || !rss_table) {
        return (
            <div style={{ padding: '48px', textAlign: 'center' }}>
                <h2>Отсутствуют параметры таблиц</h2>
                <p>Пожалуйста, вернитесь на <a href="/">страницу загрузки</a> и выберите таблицы.</p>
            </div>
        );
    }

    if (isLoadingFilters) {
        return (
            <div style={{ padding: '48px', textAlign: 'center' }}>
                <Spin size="large" />
                <p style={{ marginTop: '16px' }}>Загрузка фильтров...</p>
            </div>
        );
    }

    return (
        <>
            <Row style={{ marginBottom: '16px' }}>
                <Col span={24}>
                    <div style={{
                        padding: '12px 16px',
                        background: '#f0f2f5',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <span style={{ fontWeight: 500, color: '#000' }}>Экспорт данных:</span>
                        <ExportButtons filters={effectiveFilters} />
                    </div>
                </Col>
            </Row>

            <Row gutter={24} wrap={false}>
                <Col>
                    <FiltersPanel
                        filterOptions={filterOptions ?? null}
                        currentFilters={effectiveFilters}
                        onFilterChange={setCurrentFilters}
                        onApplyFilters={handleApplyFilters}
                        isLoading={sankeyWidget.isLoading}
                    />
                </Col>
                <Col>
                    {sankeyWidget.data ? (
                        <Suspense fallback={ChartFallback}>
                            <SankeyDiagram
                                colorScheme='pastel'
                                data={sankeyWidget.data}
                                title={`Учет движения ГНО${statesSuffix}`}
                            />
                        </Suspense>
                    ) : (
                        <div style={{ padding: '48px', textAlign: 'center' }}>
                            <p style={{ color: 'darkred' }}>Нет данных для отображения. Настройте фильтры и нажмите "Обновить диаграмму".</p>
                        </div>
                    )}
                </Col>
            </Row>

            {balanceWidget.data.length > 0 && (
                <Row style={{ marginTop: '24px' }}>
                    <Col span={24}>
                        <BalanceTable data={balanceWidget.data} />
                    </Col>
                </Row>
            )}

            {dynamicsWidget.data && (
                <Row style={{ marginTop: '24px' }}>
                    <Col span={24}>
                        <div style={{ marginBottom: '10px', paddingBottom: '10px' }}>
                            <span style={{ marginRight: '12px', fontWeight: 500, color: 'black' }}>Тип графика динамики:</span>
                            <Radio.Group
                                value={dynamicsChartType}
                                onChange={(e) => setDynamicsChartType(e.target.value)}
                            >
                                <Radio.Button value="bar">Гистограмма</Radio.Button>
                                <Radio.Button value="line">Линейный график</Radio.Button>
                            </Radio.Group>
                        </div>
                        <Suspense fallback={ChartFallback}>
                            <DynamicsChart
                                data={dynamicsWidget.data}
                                chartType={dynamicsChartType}
                                title={`Динамика${statesSuffix}`}
                            />
                        </Suspense>
                    </Col>
                </Row>
            )}

            {leftoversWidget.data && (
                <Row style={{ marginTop: '24px' }}>
                    <Col span={24}>
                        <Suspense fallback={ChartFallback}>
                            <LeftoversChart
                                data={leftoversWidget.data}
                                title={`Накопительный баланс${statesSuffix}`}
                            />
                        </Suspense>
                    </Col>
                </Row>
            )}

            {waterfallWidget.data && (
                <Row style={{ marginTop: '24px' }}>
                    <Col span={24}>
                        <Suspense fallback={ChartFallback}>
                            <WaterfallChart
                                data={waterfallWidget.data}
                                title={`Waterfall${statesSuffix}`}
                            />
                        </Suspense>
                    </Col>
                </Row>
            )}
        </>
    );
}

export default DashboardPage;
