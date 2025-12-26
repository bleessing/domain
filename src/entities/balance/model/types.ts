export interface BalanceFlow {
    flow: string;
    income: number;
    expense: number;
    balance: number;
}

export interface BalanceState {
    state: string;
    flows: BalanceFlow[];
    total: BalanceFlow;
}

export interface BalanceResponse {
    states: BalanceState[];
}

export interface BalanceTableItem {
    key: string;
    flow: string;
    income: number;
    expense: number;
    balance: number;
    state: string;
    isTotal?: boolean;
}
