import React from 'react';
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

const FiltersPanel: React.FC<FiltersPanelProps> = ({
    filterOptions,
    currentFilters,
    onFilterChange,
    onApplyFilters,
    isLoading = false,
}) => {
    if (!filterOptions) {
        return <div>Загрузка фильтров...</div>;
    }

    const modeOptions = filterOptions.filter_modes.map(mode => ({
        label: mode === 'in' ? 'Включить' : 'Исключить',
        value: mode,
    }));

    const updateFilter = <K extends keyof FilterParams>(key: K, value: FilterParams[K]) => {
        onFilterChange({
            ...currentFilters,
            [key]: value,
        });
    };

    const dateRange: [Dayjs, Dayjs] | null = currentFilters.date_from && currentFilters.date_to
        ? [dayjs(currentFilters.date_from), dayjs(currentFilters.date_to)]
        : null;

    const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
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
    };

    const FilterGroup = ({
        title,
        modeKey,
        valuesKey,
        options,
    }: {
        title: string;
        modeKey: keyof FilterParams;
        valuesKey: keyof FilterParams;
        options: string[];
    }) => (
        <Space vertical style={{width: '100%'}} size="small">
            <Text strong>{title}</Text>
            <Select
                style={{width: '100%'}}
                value={currentFilters[modeKey] as string}
                onChange={(value) => updateFilter(modeKey, value as string)}
                options={modeOptions}
                disabled={isLoading}
            />
            <Select
                mode="multiple"
                allowClear
                placeholder={`Выберите ${title.toLowerCase()}`}
                style={{width: '100%'}}
                value={currentFilters[valuesKey] as string[]}
                onChange={(value) => updateFilter(valuesKey, value as string[])}
                options={options.map(option => ({
                    label: option,
                    value: option,
                }))}
                maxTagCount="responsive"
                disabled={isLoading}
            />
        </Space>
    );

    return (
        <div style={{padding: ' 24px', background: '#f3f6f4', borderRadius: '8px', }}>
            <Row gutter={[12,16]} >
                <Col xs={23}>
                    <Space vertical  style={{width: '100%'}}>
                        <FilterGroup
                            title="Диаметры"
                            modeKey="diameters_mode"
                            valuesKey="diameters"
                            options={filterOptions.diameters}
                        />
                        <FilterGroup
                            title="Типы"
                            modeKey="types_mode"
                            valuesKey="types"
                            options={filterOptions.types}
                        />


                        <FilterGroup
                            title="Куда"
                            modeKey="targets_mode"
                            valuesKey="targets"
                            options={filterOptions.targets}
                        />
                        <FilterGroup
                            title="Откуда"
                            modeKey="sources_mode"
                            valuesKey="sources"
                            options={filterOptions.sources}
                        />
                        <Flex vertical gap={'20px'}>
                        <FilterGroup
                            title="Состояния"
                            modeKey="states_mode"
                            valuesKey="states"
                            options={filterOptions.states}
                        />
                        <RangePicker
                            style={{width: '100%'}}
                            value={dateRange}
                            onChange={handleDateChange}
                            format="YYYY-MM-DD"
                            disabled={isLoading}
                            minDate={dayjs(filterOptions.date_range.min)}
                            maxDate={dayjs(filterOptions.date_range.max)}
                        />
                        </Flex>
                        <Button
                            type="primary"
                            block
                            size="large"
                            icon={<ReloadOutlined/>}
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
};

export default FiltersPanel;
