import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Plus, Trash2 } from 'lucide-react';
import { getCheckIns, getTasks, createCheckIn, deleteCheckIn } from '@/db/api';
import type { CheckIn, Task } from '@/types';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function CheckInPage() {
  const [loading, setLoading] = useState(true);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      task_id: 'none',
      date: new Date().toISOString().split('T')[0],
      duration: 30,
      notes: '',
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [checkInsData, tasksData] = await Promise.all([
        getCheckIns(),
        getTasks()
      ]);
      setCheckIns(checkInsData);
      setTasks(tasksData);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  }

  function handleAddCheckIn() {
    form.reset({
      task_id: 'none',
      date: new Date().toISOString().split('T')[0],
      duration: 30,
      notes: '',
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(data: any) {
    try {
      await createCheckIn({
        task_id: data.task_id === 'none' ? null : data.task_id,
        date: data.date,
        duration: data.duration,
        notes: data.notes || null,
      });
      toast.success('打卡记录添加成功');
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('添加打卡记录失败:', error);
      toast.error('添加打卡记录失败');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定要删除这条打卡记录吗？')) return;
    try {
      await deleteCheckIn(id);
      toast.success('打卡记录删除成功');
      loadData();
    } catch (error) {
      console.error('删除打卡记录失败:', error);
      toast.error('删除打卡记录失败');
    }
  }

  function getTaskById(taskId: string | null) {
    if (!taskId) return null;
    return tasks.find(t => t.id === taskId);
  }

  // 按日期分组打卡记录
  const groupedCheckIns = checkIns.reduce((acc, checkIn) => {
    const date = checkIn.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(checkIn);
    return acc;
  }, {} as Record<string, CheckIn[]>);

  const sortedDates = Object.keys(groupedCheckIns).sort((a, b) => b.localeCompare(a));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 @container xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-3xl font-bold">打卡记录</h1>
            <p className="text-muted-foreground mt-2">记录每日学习进度</p>
          </div>
          <Button onClick={handleAddCheckIn}>
            <Plus className="mr-2 h-4 w-4" />
            添加打卡
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid gap-4 @container xl:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">总打卡次数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{checkIns.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">累计学习时长</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor(checkIns.reduce((sum, ci) => sum + (ci.duration || 0), 0) / 60)}h
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {checkIns.reduce((sum, ci) => sum + (ci.duration || 0), 0)} 分钟
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">平均每日时长</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sortedDates.length > 0
                  ? Math.floor(checkIns.reduce((sum, ci) => sum + (ci.duration || 0), 0) / sortedDates.length)
                  : 0}
                分钟
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 打卡记录列表 */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 bg-muted" />
            ))}
          </div>
        ) : sortedDates.length === 0 ? (
          <Card>
            <CardContent className="flex h-40 items-center justify-center">
              <p className="text-muted-foreground">暂无打卡记录</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(date => {
              const dateCheckIns = groupedCheckIns[date];
              const totalDuration = dateCheckIns.reduce((sum, ci) => sum + (ci.duration || 0), 0);

              return (
                <Card key={date}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg">
                            {format(new Date(date), 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            共 {dateCheckIns.length} 次打卡，累计 {totalDuration} 分钟
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-sm">
                        {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dateCheckIns.map(checkIn => {
                        const task = getTaskById(checkIn.task_id);
                        return (
                          <div
                            key={checkIn.id}
                            className="flex items-start justify-between rounded-lg border p-4"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{checkIn.duration} 分钟</span>
                                {task && (
                                  <Badge variant="secondary" className="text-xs">
                                    {task.title}
                                  </Badge>
                                )}
                              </div>
                              {checkIn.notes && (
                                <p className="text-sm text-muted-foreground">{checkIn.notes}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(checkIn.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* 添加打卡对话框 */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加打卡记录</DialogTitle>
              <DialogDescription>记录你的学习进度</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="task_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>关联任务（可选）</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择任务" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">无关联任务</SelectItem>
                          {tasks.map(task => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  rules={{ required: '请选择日期' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>日期</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration"
                  rules={{ required: '请输入学习时长' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>学习时长（分钟）</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="30"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>备注</FormLabel>
                      <FormControl>
                        <Textarea placeholder="记录学习内容..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    取消
                  </Button>
                  <Button type="submit">添加</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
