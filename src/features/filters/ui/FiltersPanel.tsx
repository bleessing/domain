import React, { memo, useMemo, useCallback } from 'react';
import { Select, DatePicker, Button, Row, Col, Space, Typography, Flex } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { FilterOptions, FilterParams } from '@/entities/filter';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface FiltersPanelProps {
    filterOptions: FilterOptions | null;
    currentFilters: FilterParams;
    onFilterChange: (filters: FilterParams) => void;
    onApplyFilters: () => void;
    isLoading?: boolean;
}

interface FilterGroupProps {
    title: string;
    modeKey: keyof FilterParams;
    valuesKey: keyof FilterParams;
    options: string[];
    currentFilters: FilterParams;
    modeOptions: { label: string; value: string }[];
    onUpdate: <K extends keyof FilterParams>(key: K, value: FilterParams[K]) => void;
    isLoading: boolean;
}

const FilterGroup = memo(({
    title,
    modeKey,
    valuesKey,
    options,
    currentFilters,
    modeOptions,
    onUpdate,
    isLoading,
}: FilterGroupProps) => {
    const mappedOptions = useMemo(
        () => options.map(option => ({ label: option, value: option })),
        [options],
    );

    return (
        <Space vertical style={{ width: '100%' }} size="small">
            <Text strong>{title}</Text>
            <Select
                style={{ width: '100%' }}
                value={currentFilters[modeKey] as string}
                onChange={(value) => onUpdate(modeKey, value as FilterParams[typeof modeKey])}
                options={modeOptions}
                disabled={isLoading}
            />
            <Select
                mode="multiple"
                allowClear
                placeholder={`Выберите ${title.toLowerCase()}`}
                style={{ width: '100%' }}
                value={currentFilters[valuesKey] as string[]}
                onChange={(value) => onUpdate(valuesKey, value as FilterParams[typeof valuesKey])}
                options={mappedOptions}
                maxTagCount="responsive"
                disabled={isLoading}
            />
        </Space>
    );
});

const FiltersPanel: React.FC<FiltersPanelProps> = memo(({
    filterOptions,
    currentFilters,
    onFilterChange,
    onApplyFilters,
    isLoading = false,
}) => {
    const modeOptions = useMemo(
        () => (filterOptions?.filter_modes ?? []).map(mode => ({
            label: mode === 'in' ? 'Включить' : 'Исключить',
            value: mode,
        })),
        [filterOptions?.filter_modes],
    );

    const updateFilter = useCallback(<K extends keyof FilterParams>(key: K, value: FilterParams[K]) => {
        onFilterChange({
            ...currentFilters,
            [key]: value,
        });
    }, [currentFilters, onFilterChange]);

    const dateRange: [Dayjs, Dayjs] | null = useMemo(
        () => currentFilters.date_from && currentFilters.date_to
            ? [dayjs(currentFilters.date_from), dayjs(currentFilters.date_to)]
            : null,
        [currentFilters.date_from, currentFilters.date_to],
    );

    const minDate = useMemo(() => dayjs(filterOptions?.date_range.min), [filterOptions?.date_range.min]);
    const maxDate = useMemo(() => dayjs(filterOptions?.date_range.max), [filterOptions?.date_range.max]);

    const handleDateChange = useCallback((dates: [Dayjs | null, Dayjs | null] | null) => {
        if (dates && dates[0] && dates[1]) {
            onFilterChange({
                ...currentFilters,
                date_from: dates[0].format('YYYY-MM-DD'),
                date_to: dates[1].format('YYYY-MM-DD'),
            });
        } else {
            onFilterChange({
                ...currentFilters,
                date_from: null,
                date_to: null,
            });
        }
    }, [currentFilters, onFilterChange]);

    if (!filterOptions) {
        return <div>Загрузка фильтров...</div>;
    }

    return (
        <div style={{ padding: '24px', background: '#f3f6f4', borderRadius: '8px' }}>
            <Row gutter={[12, 16]}>
                <Col xs={23}>
                    <Space vertical style={{ width: '100%' }}>
                        <FilterGroup
                            title="Диаметры"
                            modeKey="diameters_mode"
                            valuesKey="diameters"
                            options={filterOptions.diameters}
                            currentFilters={currentFilters}
                            modeOptions={modeOptions}
                            onUpdate={updateFilter}
                            isLoading={isLoading}
                        />
                        <FilterGroup
                            title="Типы"
                            modeKey="types_mode"
                            valuesKey="types"
                            options={filterOptions.types}
                            currentFilters={currentFilters}
                            modeOptions={modeOptions}
                            onUpdate={updateFilter}
                            isLoading={isLoading}
                        />
                        <FilterGroup
                            title="Куда"
                            modeKey="targets_mode"
                            valuesKey="targets"
                            options={filterOptions.targets}
                            currentFilters={currentFilters}
                            modeOptions={modeOptions}
                            onUpdate={updateFilter}
                            isLoading={isLoading}
                        />
                        <FilterGroup
                            title="Откуда"
                            modeKey="sources_mode"
                            valuesKey="sources"
                            options={filterOptions.sources}
                            currentFilters={currentFilters}
                            modeOptions={modeOptions}
                            onUpdate={updateFilter}
                            isLoading={isLoading}
                        />
                        <Flex vertical gap={'20px'}>
                            <FilterGroup
                                title="Состояния"
                                modeKey="states_mode"
                                valuesKey="states"
                                options={filterOptions.states}
                                currentFilters={currentFilters}
                                modeOptions={modeOptions}
                                onUpdate={updateFilter}
                                isLoading={isLoading}
                            />
                            <RangePicker
                                style={{ width: '100%' }}
                                value={dateRange}
                                onChange={handleDateChange}
                                format="YYYY-MM-DD"
                                disabled={isLoading}
                                minDate={minDate}
                                maxDate={maxDate}
                            />
                        </Flex>
                        <Button
                            type="primary"
                            block
                            size="large"
                            icon={<ReloadOutlined />}
                            onClick={onApplyFilters}
                            loading={isLoading}
                        >
                            Обновить диаграмму
                        </Button>
                    </Space>
                </Col>
            </Row>
        </div>
    );
});

export default FiltersPanel;
