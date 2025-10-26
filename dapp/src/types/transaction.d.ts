export interface TransactionProps {
  address: string;
  _id: string;
  winnings: number;
  winningsInUsd: number;
  total_rounds_won: number;
  total_rounds_played: number;
}

export interface PaginationProps {
  totalPages: number;
  currentPage: number;
  limit: number;
}
