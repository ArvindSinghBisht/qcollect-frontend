export interface DashboardCounts {
  projects: number;
  forms: number;
  users: number;
  submissions: number;
}

export interface Activity {
  type: string;
  userName: string;
  description: string;
  createdAt: string;
}

export interface Trend {
  date: string;
  total: number;
}