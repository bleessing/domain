import {useEffect, useMemo, useState} from 'react';
import {
    Container, Paper, Stack, Group, Box,
    Title, Text, Button, Select, SegmentedControl,
} from '@mantine/core';
import {DatePickerInput} from '@mantine/dates';
import {notifications} from '@mantine/notifications';
import {useNavigate, useSearchParams} from 'react-router';
import {
    exportRssReport,
    exportBalanceV2,
    exportOtbrakovka,
    getReportPeriods,
    type ReportKind,
    type ReportPeriodsResponse,
} from '@/entities/reports';
import {
    ALL_EQUIPMENT, EQUIPMENT_LABELS, isEquipmentType, type EquipmentType,
} from '@/shared/lib/equipment';
import {nc} from '@/shared/lib/mantineTheme';

type ZvzMonths = '1' | '2';

const REPORT_OPTIONS: {value: ReportKind; label: string; hint: string}[] = [
    {value: 'rss-report', label: 'РСС', hint: 'Ремонты по выбранному периоду. Опционально — окно ЗВ.'},
    {value: 'balance-v2', label: 'Баланс', hint: 'Материальный баланс: снапшоты остатков подставляются автоматически.'},
    {value: 'otbrakovka', label: 'Отбраковка', hint: 'Только лист «Отбраковка» без полного баланса.'},
];

const ZVZ_MONTHS_DATA = [
    {value: '1', label: 'Текущий месяц'},
    {value: '2', label: 'Пред. + текущий'},
];

function downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

function CalculateInner() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [reportKind, setReportKind] = useState<ReportKind>('rss-report');

    const eqParam = searchParams.get('eq');
    const [equipment, setEquipment] = useState<EquipmentType>(
        isEquipmentType(eqParam) ? eqParam : 'PUMPS',
    );

    const [periodsData, setPeriodsData] = useState<ReportPeriodsResponse | null>(null);
    const [periodsLoading, setPeriodsLoading] = useState(false);
    const [periodFromKey, setPeriodFromKey] = useState<string | null>(null);
    const [periodToKey, setPeriodToKey] = useState<string | null>(null);

    // Окно ЗВ (только РСС, опционально) — DatePickerInput range отдаёт ISO-строки.
    const [zvzRange, setZvzRange] = useState<[string | null, string | null]>([null, null]);
    const [zvzMonths, setZvzMonths] = useState<ZvzMonths>('2');

    const [isBuilding, setIsBuilding] = useState(false);

    const showsZvzWindow = reportKind === 'rss-report';
    const showsZvzMonths = reportKind === 'balance-v2' || reportKind === 'otbrakovka';

    useEffect(() => {
        let cancelled = false;
        setPeriodsLoading(true);
        setPeriodFromKey(null);
        setPeriodToKey(null);
        setPeriodsData(null);

        getReportPeriods(equipment, reportKind)
            .then((data) => {
                if (!cancelled) setPeriodsData(data);
            })
            .catch((error) => {
                if (cancelled) return;
                notifications.show({color: 'brandRed', message: 'Не удалось загрузить периоды'});
                console.error('Report periods error:', error);
            })
            .finally(() => {
                if (!cancelled) setPeriodsLoading(false);
            });

        return () => {
            cancelled = true;
        };
        // Отбраковка тянет периоды со своего эндпоинта — перезапрашиваем при смене отчёта.
    }, [equipment, reportKind]);

    const periods = useMemo(() => periodsData?.periods ?? [], [periodsData]);
    const fromIndex = periods.findIndex((p) => p.key === periodFromKey);
    const toIndex = periods.findIndex((p) => p.key === periodToKey);

    const fromData = periods.map((p) => ({value: p.key, label: p.label}));
    const toData = periods.map((p, i) => ({
        value: p.key,
        label: p.label,
        disabled: fromIndex >= 0 && i < fromIndex,
    }));

    const handleFromChange = (key: string | null) => {
        setPeriodFromKey(key);
        const newFromIdx = periods.findIndex((p) => p.key === key);
        if (toIndex >= 0 && toIndex < newFromIdx) {
            setPeriodToKey(null);
        }
    };

    const handleBuild = async () => {
        const from = periods.find((p) => p.key === periodFromKey);
        const to = periods.find((p) => p.key === periodToKey);
        if (!from || !to) {
            notifications.show({color: 'yellow', message: 'Выберите период (с / по)'});
            return;
        }

        const base = {
            equipment_type: equipment,
            date_from: from.date_from,
            date_to: to.date_to,
        };
        const rangeKey = from.key === to.key ? from.key : `${from.key}_${to.key}`;

        setIsBuilding(true);
        try {
            let blob: Blob;
            let filename: string;

            if (reportKind === 'rss-report') {
                blob = await exportRssReport({
                    ...base,
                    zvz_date_from: zvzRange[0] ?? undefined,
                    zvz_date_to: zvzRange[1] ?? undefined,
                });
                filename = `rss_report_${equipment}_${rangeKey}.xlsx`;
            } else if (reportKind === 'balance-v2') {
                blob = await exportBalanceV2({
                    ...base,
                    ost_date_start: from.ost_date_start,
                    ost_date_end: to.ost_date_end,
                    otbrakovka_zvz_months: Number(zvzMonths) as 1 | 2,
                });
                filename = `balance_v2_${equipment}_${rangeKey}.xlsx`;
            } else {
                blob = await exportOtbrakovka({
                    ...base,
                    otbrakovka_zvz_months: Number(zvzMonths) as 1 | 2,
                });
                filename = `otbrakovka_${equipment}_${rangeKey}.xlsx`;
            }

            downloadBlob(blob, filename);
            notifications.show({color: 'tatneft', message: 'Отчёт сформирован и скачан'});
            // Чистим поля под следующий отчёт. Тип отчёта и оборудование оставляем —
            // это контекст, при их сбросе пришлось бы перезапрашивать периоды.
            setPeriodFromKey(null);
            setPeriodToKey(null);
            setZvzRange([null, null]);
            setZvzMonths('2');
        } catch (error) {
            notifications.show({color: 'brandRed', message: 'Ошибка при формировании отчёта'});
            console.error('Build report error:', error);
        } finally {
            setIsBuilding(false);
        }
    };

    const activeHint = REPORT_OPTIONS.find((o) => o.value === reportKind)?.hint;

    return (
        <Box style={{minHeight: '100vh', background: '#ffffff'}}>
            {/* Шапка в духе Notion: белая, тонкая линия снизу, приглушённые элементы. */}
            <Box
                style={{
                    height: 45,
                    display: 'flex',
                    alignItems: 'center',
                    paddingInline: 16,
                    borderBottom: '1px solid #e9e9e7',
                }}
            >
                <Button
                    variant="subtle"
                    color="gray"
                    size="compact-sm"
                    onClick={() => navigate('/')}
                >
                    ← На главную
                </Button>
                <Text c="dimmed" mx={8}>/</Text>
                <Text size="sm" fw={500} c={nc.text}>Расчёт отчёта</Text>
            </Box>

            <Container size={680} py={56}>
                <Stack gap={4} mb={28}>
                    <Title order={2} fw={700} c={nc.text}>Новый отчёт</Title>
                    <Text c="dimmed" size="sm">
                        Отчёт формируется на сервере и скачивается в формате Excel.
                    </Text>
                </Stack>

                <Paper withBorder radius="md" p="xl" style={{borderColor: '#e9e9e7'}}>
                    <Stack gap="xl">
                        <Stack gap={8}>
                            <Text size="sm" fw={500} c={nc.text}>Тип отчёта</Text>
                            <SegmentedControl
                                value={reportKind}
                                onChange={(v) => setReportKind(v as ReportKind)}
                                data={REPORT_OPTIONS.map((o) => ({value: o.value, label: o.label}))}
                                color="tatneft"
                                fullWidth
                            />
                            {activeHint && <Text size="xs" c="dimmed">{activeHint}</Text>}
                        </Stack>

                        <Select
                            label="Тип оборудования"
                            value={equipment}
                            onChange={(v) => v && setEquipment(v as EquipmentType)}
                            data={ALL_EQUIPMENT.map((eq) => ({value: eq, label: EQUIPMENT_LABELS[eq]}))}
                            allowDeselect={false}
                            comboboxProps={{withinPortal: false}}
                        />

                        <Group grow align="flex-start">
                            <Select
                                label="Период с"
                                placeholder={periodsLoading ? 'Загрузка…' : 'Начало'}
                                value={periodFromKey}
                                onChange={handleFromChange}
                                data={fromData}
                                disabled={periodsLoading}
                                nothingFoundMessage="Нет доступных периодов"
                                comboboxProps={{withinPortal: false}}
                            />
                            <Select
                                label="Период по"
                                placeholder={periodsLoading ? 'Загрузка…' : 'Конец'}
                                value={periodToKey}
                                onChange={setPeriodToKey}
                                data={toData}
                                disabled={periodsLoading}
                                nothingFoundMessage="Нет доступных периодов"
                                comboboxProps={{withinPortal: false}}
                            />
                        </Group>

                        {showsZvzWindow && (
                            <DatePickerInput
                                type="range"
                                label="Окно ЗВ — «Дата вывоза со скважины»"
                                description="Опционально"
                                placeholder="Выберите диапазон"
                                value={zvzRange}
                                onChange={setZvzRange}
                                valueFormat="YYYY-MM-DD"
                                clearable
                                popoverProps={{withinPortal: false}}
                            />
                        )}

                        {showsZvzMonths && (
                            <Stack gap={8}>
                                <Text size="sm" fw={500} c={nc.text}>Окно ZVZ для «Отбраковки»</Text>
                                <SegmentedControl
                                    value={zvzMonths}
                                    onChange={(v) => setZvzMonths(v as ZvzMonths)}
                                    data={ZVZ_MONTHS_DATA}
                                    color="tatneft"
                                />
                            </Stack>
                        )}

                        <Group justify="flex-end" mt={4}>
                            <Button
                                onClick={handleBuild}
                                loading={isBuilding}
                                disabled={!periodFromKey || !periodToKey}
                            >
                                Сформировать отчёт
                            </Button>
                        </Group>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}

export default CalculateInner;
