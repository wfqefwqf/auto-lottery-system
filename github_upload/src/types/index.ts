export interface Category {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  name: string;
  category_id?: string;
  extra_info?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LotteryRecord {
  id: string;
  category_id?: string;
  participant_id?: string;
  participant_name: string;
  prize_name: string;
  lottery_date: string;
  created_at: string;
}

export interface LotteryWinner {
  id: string;
  name: string;
  prizeName: string;
  lotteryDate: string;
}

export interface LotteryResult {
  winners: LotteryWinner[];
  totalParticipants: number;
  categoryId: string;
  lotteryRecords: LotteryRecord[];
}