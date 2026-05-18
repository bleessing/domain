/**
 * Тип оборудования — выбирается на главной странице.
 * Совпадает с EquipmentType.value на бэке (PIPES/PUMPS/RODS).
 */
export type EquipmentType = 'PIPES' | 'PUMPS' | 'RODS';

export const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
    PIPES: 'Трубы',
    PUMPS: 'ШГН',
    RODS: 'Штанги',
};

export const ALL_EQUIPMENT: EquipmentType[] = ['PIPES', 'PUMPS', 'RODS'];

export const isEquipmentType = (value: string | null | undefined): value is EquipmentType =>
    value === 'PIPES' || value === 'PUMPS' || value === 'RODS';
