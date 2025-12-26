import { API_BASE_URL } from '@/shared/lib/constants';

export type FileType = 'Завоз/Вывоз' | 'RSS' | 'Словарь' | 'Остатки' | 'OV';

export interface TableInfo {
  table_name: string;
  table_type: FileType;
  created_at?: string;
}

export interface TableTypeGroup {
  table_type: string;
  tables: string[];
  count: number;
}

export interface TablesApiResponse {
  data: TableTypeGroup[];

}

const TABLES_API_URL = `${API_BASE_URL}/tables`;

// Маппинг типов таблиц из API (с подчеркиваниями) в локальные типы (с слэшами)
const TABLE_TYPE_MAP: Record<string, FileType> = {
  'Завоз_Вывоз': 'Завоз/Вывоз',
  'RSS': 'RSS',
  'Словарь': 'Словарь',
  'Остатки': 'Остатки',
  'Отгруз_Выгруз': 'OV',
};

/**
 * Получает список всех доступных таблиц с бекенда
 */
export async function fetchTables(): Promise<TableInfo[]> {
  try {
    const response = await fetch(TABLES_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },

    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tables: ${response.statusText}`);
    }

    const apiResponse: TablesApiResponse = await response.json();

    // Преобразуем формат API в плоский список TableInfo
    const tablesList: TableInfo[] = [];

    apiResponse.data.forEach((group) => {
      const mappedType = TABLE_TYPE_MAP[group.table_type];

      if (mappedType) {
        group.tables.forEach((tableName) => {
          tablesList.push({
            table_name: tableName,
            table_type: mappedType,
          });
        });
      }
    });

    return tablesList;
  } catch (error) {
    console.error('Ошибка загрузки таблиц:', error);
    throw error;
  }
}

/**
 * Фильтрует таблицы по типу
 */
export function filterTablesByType(
  tables: TableInfo[],
  type: FileType
): TableInfo[] {
  return tables.filter((table) => table.table_type === type);
}
