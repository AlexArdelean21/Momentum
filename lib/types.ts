export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  password?: string | null;
  image?: string | null;
}

export interface Activity {
  id: string
  name: string
  emoji: string | null
  description: string | null
  createdAt: Date
  todayCount?: number
  totalDays?: number
  currentStreak?: number
  bestStreak?: number
}

export interface ActivityLog {
  id: string
  activityId: string
  date: string
  count: number
  createdAt: Date
}

export interface CreateActivityData {
  name: string
  emoji: string
  description: string | null
}
