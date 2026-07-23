import React, {memo, useCallback, useMemo} from 'react';
import {Paper, Stack, Text, Select, MultiSelect, Button} from '@mantine/core';
import {DatePickerInput} from '@mantine/dates';
import {IconRefresh} from '@tabler/icons-react';
import type {FilterKey, FilterOptions, FilterParams} from '@/entities/filter';
import {nc} from '@/shared/lib/mantineTheme';

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
    modeOptions: {label: string; value: string}[];
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
    const data = useMemo(() => options.map((o) => ({label: o, value: o})), [options]);

    return (
        <Stack gap={6}>
            <Text size="sm" fw={500} c={nc.text}>{title}</Text>
            <Select
                value={currentFilters[modeKey] as string}
                onChange={(value) => value && onUpdate(modeKey, value as FilterParams[typeof modeKey])}
                data={modeOptions}
                disabled={isLoading}
                allowDeselect={false}
                size="xs"
                comboboxProps={{withinPortal: false}}
            />
            <MultiSelect
                placeholder={`Выберите ${title.toLowerCase()}`}
                value={currentFilters[valuesKey] as string[]}
                onChange={(value) => onUpdate(valuesKey, value as FilterParams[typeof valuesKey])}
                data={data}
                disabled={isLoading}
                clearable
                searchable
                size="xs"
                maxValues={undefined}
                comboboxProps={{withinPortal: false}}
            />
        </Stack>
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
        () => (filterOptions?.filter_modes ?? []).map((mode) => ({
            label: mode === 'in' ? 'Включить' : 'Исключить',
            value: mode,
        })),
        [filterOptions?.filter_modes],
    );

    const updateFilter = useCallback(<K extends keyof FilterParams>(key: K, value: FilterParams[K]) => {
        onFilterChange({...currentFilters, [key]: value});
    }, [currentFilters, onFilterChange]);

    const dateRange: [string | null, string | null] = useMemo(
        () => [currentFilters.date_from ?? null, currentFilters.date_to ?? null],
        [currentFilters.date_from, currentFilters.date_to],
    );

    const handleDateChange = useCallback((dates: [string | null, string | null]) => {
        onFilterChange({
            ...currentFilters,
            date_from: dates[0] ?? null,
            date_to: dates[1] ?? null,
        });
    }, [currentFilters, onFilterChange]);

    if (!filterOptions) {
        return <Text c="dimmed" size="sm">Загрузка фильтров...</Text>;
    }

    // Какие секции фильтров рендерить. Если бэк прислал `available_filters` —
    // используем его как whitelist, иначе считаем все секции применимыми.
    const isApplicable = (key: FilterKey): boolean =>
        !filterOptions.available_filters || filterOptions.available_filters.includes(key);

    const groups: {key: FilterKey; title: string; modeKey: keyof FilterParams; valuesKey: keyof FilterParams; options: string[]}[] = [
        {key: 'diameters', title: 'Диаметры', modeKey: 'diameters_mode', valuesKey: 'diameters', options: filterOptions.diameters},
        {key: 'types', title: 'Типы', modeKey: 'types_mode', valuesKey: 'types', options: filterOptions.types},
        {key: 'targets', title: 'Куда', modeKey: 'targets_mode', valuesKey: 'targets', options: filterOptions.targets},
        {key: 'sources', title: 'Откуда', modeKey: 'sources_mode', valuesKey: 'sources', options: filterOptions.sources},
        {key: 'states', title: 'Состояния', modeKey: 'states_mode', valuesKey: 'states', options: filterOptions.states},
    ];

    return (
        <Paper withBorder radius="md" p="md" w={300} style={{borderColor: nc.border, background: nc.panel}}>
            <Stack gap="md">
                {groups.map((g) => isApplicable(g.key) && (
                    <FilterGroup
                        key={g.key}
                        title={g.title}
                        modeKey={g.modeKey}
                        valuesKey={g.valuesKey}
                        options={g.options}
                        currentFilters={currentFilters}
                        modeOptions={modeOptions}
                        onUpdate={updateFilter}
                        isLoading={isLoading}
                    />
                ))}

                {isApplicable('date_range') && (
                    <DatePickerInput
                        type="range"
                        label="Период"
                        placeholder="Выберите диапазон"
                        value={dateRange}
                        onChange={handleDateChange}
                        valueFormat="YYYY-MM-DD"
                        minDate={filterOptions.date_range.min}
                        maxDate={filterOptions.date_range.max}
                        disabled={isLoading}
                        size="xs"
                        popoverProps={{withinPortal: false}}
                    />
                )}

                <Button
                    fullWidth
                    leftSection={<IconRefresh size={16} />}
                    onClick={onApplyFilters}
                    loading={isLoading}
                >
                    Обновить диаграмму
                </Button>
            </Stack>
        </Paper>
    );
});

export default FiltersPanel;
