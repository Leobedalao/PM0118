import { supabase } from './supabase';
import type { Task, TaskInput, CheckIn, CheckInInput, Category, DailyTask, DailyTaskInput, WeeklySummary, WeeklySummaryInput } from '@/types';

// ==================== 分类相关 API ====================

// 获取所有分类
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 根据ID获取分类
export async function getCategoryById(id: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// ==================== 任务相关 API ====================

// 获取所有任务
export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 根据分类获取任务
export async function getTasksByCategory(categoryId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 根据状态获取任务
export async function getTasksByStatus(status: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 根据ID获取任务
export async function getTaskById(id: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// 创建任务
export async function createTask(task: TaskInput): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 更新任务
export async function updateTask(id: string, updates: Partial<TaskInput>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 删除任务
export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// 完成任务
export async function completeTask(id: string): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==================== 打卡记录相关 API ====================

// 获取所有打卡记录
export async function getCheckIns(): Promise<CheckIn[]> {
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 根据任务ID获取打卡记录
export async function getCheckInsByTask(taskId: string): Promise<CheckIn[]> {
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('task_id', taskId)
    .order('date', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 根据日期范围获取打卡记录
export async function getCheckInsByDateRange(startDate: string, endDate: string): Promise<CheckIn[]> {
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 创建打卡记录
export async function createCheckIn(checkIn: CheckInInput): Promise<CheckIn> {
  const { data, error } = await supabase
    .from('check_ins')
    .insert([checkIn])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 更新打卡记录
export async function updateCheckIn(id: string, updates: Partial<CheckInInput>): Promise<CheckIn> {
  const { data, error } = await supabase
    .from('check_ins')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 删除打卡记录
export async function deleteCheckIn(id: string): Promise<void> {
  const { error } = await supabase
    .from('check_ins')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ==================== 统计相关 API ====================

// 获取任务统计
export async function getTaskStatistics() {
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*');

  if (error) throw error;

  const allTasks = Array.isArray(tasks) ? tasks : [];
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = allTasks.filter(t => t.status === 'in_progress').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    completionRate
  };
}

// 获取打卡统计
export async function getCheckInStatistics() {
  const { data: checkIns, error } = await supabase
    .from('check_ins')
    .select('*');

  if (error) throw error;

  const allCheckIns = Array.isArray(checkIns) ? checkIns : [];
  const totalCheckIns = allCheckIns.length;
  const totalDuration = allCheckIns.reduce((sum, ci) => sum + (ci.duration || 0), 0);

  return {
    totalCheckIns,
    totalDuration
  };
}

// ==================== 分类统计 API ====================

// 获取分类统计
export async function getCategoryStatistics() {
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*');

  if (catError) throw catError;

  const { data: tasks, error: taskError } = await supabase
    .from('tasks')
    .select('*');

  if (taskError) throw taskError;

  const { data: checkIns, error: checkInError } = await supabase
    .from('check_ins')
    .select('*');

  if (checkInError) throw checkInError;

  const allCategories = Array.isArray(categories) ? categories : [];
  const allTasks = Array.isArray(tasks) ? tasks : [];
  const allCheckIns = Array.isArray(checkIns) ? checkIns : [];

  return allCategories.map(category => {
    const categoryTasks = allTasks.filter(t => t.category_id === category.id);
    const taskIds = categoryTasks.map(t => t.id);
    const categoryCheckIns = allCheckIns.filter(ci => ci.task_id && taskIds.includes(ci.task_id));

    return {
      category,
      taskCount: categoryTasks.length,
      completedCount: categoryTasks.filter(t => t.status === 'completed').length,
      checkInCount: categoryCheckIns.length
    };
  });
}

// ==================== 每日任务相关 API ====================

// 获取指定日期的每日任务
export async function getDailyTasksByDate(date: string): Promise<DailyTask[]> {
  const { data, error } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('date', date)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 获取今日任务
export async function getTodayTasks(): Promise<DailyTask[]> {
  const today = new Date().toISOString().split('T')[0];
  return getDailyTasksByDate(today);
}

// 创建每日任务
export async function createDailyTask(task: DailyTaskInput): Promise<DailyTask> {
  const { data, error } = await supabase
    .from('daily_tasks')
    .insert([{
      ...task,
      date: task.date || new Date().toISOString().split('T')[0]
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 更新每日任务
export async function updateDailyTask(id: string, updates: Partial<DailyTaskInput>): Promise<DailyTask> {
  const { data, error } = await supabase
    .from('daily_tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 切换每日任务完成状态
export async function toggleDailyTask(id: string, completed: boolean): Promise<DailyTask> {
  const { data, error } = await supabase
    .from('daily_tasks')
    .update({ 
      completed, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 删除每日任务
export async function deleteDailyTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('daily_tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ==================== 周总结相关 API ====================

// 获取所有周总结
export async function getWeeklySummaries(): Promise<WeeklySummary[]> {
  const { data, error } = await supabase
    .from('weekly_summaries')
    .select('*')
    .order('week_start', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 根据周起始日期获取周总结
export async function getWeeklySummaryByWeek(weekStart: string): Promise<WeeklySummary | null> {
  const { data, error } = await supabase
    .from('weekly_summaries')
    .select('*')
    .eq('week_start', weekStart)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// 获取当前周的周总结
export async function getCurrentWeekSummary(): Promise<WeeklySummary | null> {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 周一为一周的开始
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diff);
  const weekStartStr = weekStart.toISOString().split('T')[0];

  return getWeeklySummaryByWeek(weekStartStr);
}

// 创建周总结
export async function createWeeklySummary(summary: WeeklySummaryInput): Promise<WeeklySummary> {
  const { data, error } = await supabase
    .from('weekly_summaries')
    .insert([summary])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 更新周总结
export async function updateWeeklySummary(id: string, updates: Partial<WeeklySummaryInput>): Promise<WeeklySummary> {
  const { data, error } = await supabase
    .from('weekly_summaries')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 删除周总结
export async function deleteWeeklySummary(id: string): Promise<void> {
  const { error } = await supabase
    .from('weekly_summaries')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// 获取本周日期范围
export function getCurrentWeekRange(): { weekStart: string; weekEnd: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diff);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  return {
    weekStart: weekStart.toISOString().split('T')[0],
    weekEnd: weekEnd.toISOString().split('T')[0]
  };
}
