import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { StatCard } from '@/components/common/StatCard';
import { DailyTaskList } from '@/components/common/DailyTaskList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ListTodo, CheckSquare, TrendingUp, Clock } from 'lucide-react';
import { 
  getTaskStatistics, 
  getCheckInStatistics, 
  getCategoryStatistics,
  getCategories,
  getTasks,
  getTodayTasks,
  createDailyTask,
  updateDailyTask,
  toggleDailyTask,
  deleteDailyTask
} from '@/db/api';
import type { DailyTask, DailyTaskInput, Category, Task } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { toast } from 'sonner';

const COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(142, 71%, 45%)',
  'hsl(38, 92%, 50%)',
  'hsl(280, 65%, 60%)',
  'hsl(340, 75%, 55%)',
  'hsl(199, 89%, 48%)',
  'hsl(0, 72%, 51%)',
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [taskStats, setTaskStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    completionRate: 0
  });
  const [checkInStats, setCheckInStats] = useState({
    totalCheckIns: 0,
    totalDuration: 0
  });
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadStatistics();
    loadDailyTasks();
    loadCategories();
    loadAllTasks();
  }, []);

  async function loadStatistics() {
    try {
      setLoading(true);
      const [tasks, checkIns, categories] = await Promise.all([
        getTaskStatistics(),
        getCheckInStatistics(),
        getCategoryStatistics()
      ]);
      setTaskStats(tasks);
      setCheckInStats(checkIns);
      setCategoryStats(categories);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadDailyTasks() {
    try {
      const tasks = await getTodayTasks();
      setDailyTasks(tasks);
    } catch (error) {
      console.error('加载今日任务失败:', error);
      toast.error('加载今日任务失败');
    }
  }

  async function loadCategories() {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  }

  async function loadAllTasks() {
    try {
      const tasks = await getTasks();
      setAllTasks(tasks);
    } catch (error) {
      console.error('加载任务列表失败:', error);
    }
  }

  async function handleAddDailyTask(task: DailyTaskInput) {
    try {
      await createDailyTask(task);
      toast.success('今日任务添加成功');
      loadDailyTasks();
    } catch (error) {
      console.error('添加今日任务失败:', error);
      toast.error('添加今日任务失败');
    }
  }

  async function handleToggleDailyTask(id: string, completed: boolean) {
    try {
      await toggleDailyTask(id, completed);
      loadDailyTasks();
    } catch (error) {
      console.error('更新任务失败:', error);
      toast.error('更新任务失败');
    }
  }

  async function handleUpdateDailyTask(id: string, updates: Partial<DailyTaskInput>) {
    try {
      await updateDailyTask(id, updates);
      toast.success('今日任务更新成功');
      loadDailyTasks();
    } catch (error) {
      console.error('更新今日任务失败:', error);
      toast.error('更新今日任务失败');
    }
  }

  async function handleDeleteDailyTask(id: string) {
    try {
      await deleteDailyTask(id);
      toast.success('任务删除成功');
      loadDailyTasks();
    } catch (error) {
      console.error('删除任务失败:', error);
      toast.error('删除任务失败');
    }
  }

  const chartData = categoryStats.map(stat => ({
    name: stat.category.name,
    任务数: stat.taskCount,
    已完成: stat.completedCount,
    打卡次数: stat.checkInCount
  }));

  const pieData = categoryStats.map(stat => ({
    name: stat.category.name,
    value: stat.taskCount
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">仪表盘</h1>
          <p className="text-muted-foreground mt-2">45天学习计划总览</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid gap-4 @container xl:grid-cols-4">
          {loading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-20 bg-muted" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="总任务数"
                value={taskStats.totalTasks}
                icon={ListTodo}
                description="所有学习任务"
              />
              <StatCard
                title="已完成"
                value={taskStats.completedTasks}
                icon={CheckSquare}
                description="完成的任务"
              />
              <StatCard
                title="完成率"
                value={`${taskStats.completionRate.toFixed(1)}%`}
                icon={TrendingUp}
                description="任务完成百分比"
              />
              <StatCard
                title="学习时长"
                value={`${Math.floor(checkInStats.totalDuration / 60)}h`}
                icon={Clock}
                description={`共${checkInStats.totalDuration}分钟`}
              />
            </>
          )}
        </div>

        {/* 今日任务模块 */}
        <DailyTaskList
          tasks={dailyTasks}
          categories={categories}
          allTasks={allTasks}
          onAdd={handleAddDailyTask}
          onToggle={handleToggleDailyTask}
          onUpdate={handleUpdateDailyTask}
          onDelete={handleDeleteDailyTask}
        />

        {/* 图表区域 */}
        <div className="grid gap-6 @container xl:grid-cols-2">
          {/* 分类任务统计柱状图 */}
          <Card>
            <CardHeader>
              <CardTitle>分类任务统计</CardTitle>
              <CardDescription>各学习模块的任务完成情况</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[300px] w-full bg-muted" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="任务数" fill="hsl(var(--primary))" />
                    <Bar dataKey="已完成" fill="hsl(var(--success))" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* 任务分布饼图 */}
          <Card>
            <CardHeader>
              <CardTitle>任务分布</CardTitle>
              <CardDescription>各学习模块的任务数量占比</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[300px] w-full bg-muted" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 分类详细统计 */}
        <Card>
          <CardHeader>
            <CardTitle>学习模块详情</CardTitle>
            <CardDescription>各模块的详细统计信息</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full bg-muted" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {categoryStats.map((stat, index) => (
                  <div
                    key={stat.category.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
                        style={{ backgroundColor: COLORS[index % COLORS.length] + '20' }}
                      >
                        {stat.category.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{stat.category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {stat.category.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-semibold">{stat.taskCount}</div>
                        <div className="text-muted-foreground">任务</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{stat.completedCount}</div>
                        <div className="text-muted-foreground">完成</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{stat.checkInCount}</div>
                        <div className="text-muted-foreground">打卡</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
