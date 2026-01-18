// 任务状态类型
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'archived';

// 任务优先级类型
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// 分类类型
export interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  created_at: string;
}

// 任务类型
export interface Task {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// 打卡记录类型
export interface CheckIn {
  id: string;
  task_id: string | null;
  date: string;
  duration: number | null;
  notes: string | null;
  created_at: string;
}

// 每日任务类型
export interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
  date: string;
  created_at: string;
  updated_at: string;
}

// 周总结类型
export interface WeeklySummary {
  id: string;
  week_start: string;
  week_end: string;
  current_goals: string | null;
  achievements: string | null;
  challenges: string | null;
  next_goals: string | null;
  created_at: string;
  updated_at: string;
}

// 任务创建输入类型
export interface TaskInput {
  title: string;
  description?: string;
  category_id?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
}

// 打卡记录创建输入类型
export interface CheckInInput {
  task_id?: string;
  date?: string;
  duration?: number;
  notes?: string;
}

// 每日任务创建输入类型
export interface DailyTaskInput {
  title: string;
  completed?: boolean;
  date?: string;
}

// 周总结创建输入类型
export interface WeeklySummaryInput {
  week_start: string;
  week_end: string;
  current_goals?: string;
  achievements?: string;
  challenges?: string;
  next_goals?: string;
}

// 统计数据类型
export interface Statistics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  totalCheckIns: number;
  totalDuration: number;
  completionRate: number;
  categoryStats: CategoryStats[];
}

// 分类统计类型
export interface CategoryStats {
  category: Category;
  taskCount: number;
  completedCount: number;
  checkInCount: number;
}
