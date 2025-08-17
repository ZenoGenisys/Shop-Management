export type ProfitLoss = {
  total_income: string;
  total_expense: string;
  profit: string;
};

export type ProfitLossResponse = {
  data: ProfitLoss;
};

export type ProfitLossTable = {
    title: string;
    value: string;
    icon: string;
    color: string;
};
