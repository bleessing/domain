import { useEffect, useState } from 'react';
import { Col, Row, Radio, message } from 'antd';
import { useSearchParams } from 'react-router';

import { SankeyDiagram, useSankeyData } from '@/widgets/sankey-diagram';
import { BalanceTable, useBalanceData } from '@/widgets/balance-table';
import { DynamicsChart, useDynamicsData } from '@/widgets/dynamics-chart';
import { LeftoversChart, useLeftoversData } from '@/widgets/leftovers-chart';
import { FiltersPanel } from '@/features/filters';
import { ExportButtons } from '@/features/export';
import { fetchFilterOptions, type FilterOptions, type FilterParams } from '@/entities/filter';

function DashboardPage() {
    const [searchParams] = useSearchParams();

    // Получаем названия таблиц из URL
    const zvz_table = searchParams.get('zvz_table') || '';
    const rss_table = searchParams.get('rss_table') || '';
    const spr_zvz_table = searchParams.get('spr_zvz_table') || '';
    const spr_rss_table = searchParams.get('spr_rss_table') || '';
    const spr_ov_table = searchParams.get('spr_ov_table') || '';
    const ov_table = searchParams.get('ov_table') || '';
    const leftovers_table = searchParams.get('leftovers_table') || '';

    const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
    const [isLoadingFilters, setIsLoadingFilters] = useState<boolean>(false);
    const [dynamicsChartType, setDynamicsChartType] = useState<'bar' | 'line'>('bar');

    const [currentFilters, setCurrentFilters] = useState<FilterParams>({
        zvz_table,
        rss_table,
        spr_zvz_table,
        spr_rss_table,
        spr_ov_table,
        ov_table,
        ost_table: leftovers_table,
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

    // Виджеты с их хуками
    const sankeyWidget = useSankeyData();
    const balanceWidget = useBalanceData();
    const dynamicsWidget = useDynamicsData();
    const leftoversWidget = useLeftoversData();

    // Загрузка фильтров при монтировании компонента
    useEffect(() => {
        if (!zvz_table || !rss_table || !spr_zvz_table || !spr_rss_table || !spr_ov_table) {
            message.error('Отсутствуют параметры таблиц в URL. Пожалуйста, вернитесь на страницу загрузки.');
            return;
        }

        const loadFilters = async () => {
            setIsLoadingFilters(true);
            try {
                const options = await fetchFilterOptions(
                    zvz_table,
                    rss_table,
                    spr_rss_table,
                    spr_zvz_table,
                    spr_ov_table,
                    ov_table,
                    leftovers_table
                );
                setFilterOptions(options);

                // Инициализируем фильтры с пустыми значениями
                setCurrentFilters({
                    zvz_table,
                    rss_table,
                    spr_zvz_table,
                    spr_rss_table,
                    spr_ov_table,
                    ov_table,
                    ost_table: leftovers_table,
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
                    date_from: options.date_range.min,
                    date_to: options.date_range.max,
                    is_leftovers: false,
                });
            } catch (error) {
                message.error('Ошибка при загрузке фильтров');
                console.error(error);
            } finally {
                setIsLoadingFilters(false);
            }
        };

        loadFilters();
    }, [zvz_table, rss_table, spr_zvz_table, spr_rss_table, spr_ov_table, ov_table, leftovers_table]);

    // Обработка нажатия кнопки "Обновить диаграмму"
    const handleApplyFilters = async () => {
        // Для графика остатков всегда используем is_leftovers: true
        const leftoverFilters = {
            ...currentFilters,
            is_leftovers: true,
        };

        await Promise.all([
            sankeyWidget.loadData(currentFilters),
            balanceWidget.loadData(currentFilters),
            dynamicsWidget.loadData(currentFilters),
            leftoversWidget.loadData(leftoverFilters),
        ]);
    };

    if (!zvz_table || !rss_table || !spr_zvz_table || !spr_rss_table || !spr_ov_table) {
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
                        <ExportButtons filters={currentFilters} />
                    </div>
                </Col>
            </Row>

            <Row gutter={24} wrap={false}>
                <Col>
                    <FiltersPanel
                        filterOptions={filterOptions}
                        currentFilters={currentFilters}
                        onFilterChange={setCurrentFilters}
                        onApplyFilters={handleApplyFilters}
                        isLoading={sankeyWidget.isLoading}
                    />
                </Col>
                <Col>
                    {sankeyWidget.data ? (
                        <SankeyDiagram
                            colorScheme='pastel'
                            data={sankeyWidget.data}
                            title={`Учет движения ГНО${currentFilters.states && currentFilters.states.length > 0 ? ` (${currentFilters.states.join(', ')})` : ''}`}
                        />
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
                        <DynamicsChart
                            data={dynamicsWidget.data}
                            chartType={dynamicsChartType}
                            title={`Динамика${currentFilters.states && currentFilters.states.length > 0 ? ` (${currentFilters.states.join(', ')})` : ''}`}
                        />
                    </Col>
                </Row>
            )}

            {leftoversWidget.data && (
                <Row style={{ marginTop: '24px' }}>
                    <Col span={24}>
                        <LeftoversChart
                            data={leftoversWidget.data}
                            title={`Накопительный баланс${currentFilters.states && currentFilters.states.length > 0 ? ` (${currentFilters.states.join(', ')})` : ''}`}
                        />
                    </Col>
                </Row>
            )}
        </>
    );
}

export default DashboardPage;
