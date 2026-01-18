import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { TaskCard } from '@/components/common/TaskCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search } from 'lucide-react';
import { getTasks, getCategories, createTask, updateTask, deleteTask, completeTask, createCheckIn } from '@/db/api';
import type { Task, Category, TaskInput } from '@/types';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function TasksPage() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [checkInTask, setCheckInTask] = useState<Task | null>(null);

  const form = useForm<TaskInput>({
    defaultValues: {
      title: '',
      description: '',
      category_id: '',
      status: 'todo',
      priority: 'medium',
      due_date: '',
    },
  });

  const checkInForm = useForm({
    defaultValues: {
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
      const [tasksData, categoriesData] = await Promise.all([
        getTasks(),
        getCategories()
      ]);
      setTasks(tasksData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  }

  function handleAddTask() {
    setEditingTask(null);
    form.reset({
      title: '',
      description: '',
      category_id: '',
      status: 'todo',
      priority: 'medium',
      due_date: '',
    });
    setIsDialogOpen(true);
  }

  function handleEditTask(task: Task) {
    setEditingTask(task);
    form.reset({
      title: task.title,
      description: task.description || '',
      category_id: task.category_id || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date || '',
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(data: TaskInput) {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, data);
        toast.success('任务更新成功');
      } else {
        await createTask(data);
        toast.success('任务创建成功');
      }
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('保存任务失败:', error);
      toast.error('保存任务失败');
    }
  }

  async function handleDeleteTask(task: Task) {
    if (!confirm('确定要删除这个任务吗？')) return;
    try {
      await deleteTask(task.id);
      toast.success('任务删除成功');
      loadData();
    } catch (error) {
      console.error('删除任务失败:', error);
      toast.error('删除任务失败');
    }
  }

  async function handleCompleteTask(task: Task) {
    try {
      await completeTask(task.id);
      toast.success('任务已标记为完成');
      loadData();
    } catch (error) {
      console.error('更新任务失败:', error);
      toast.error('更新任务失败');
    }
  }

  function handleCheckInClick(task: Task) {
    setCheckInTask(task);
    checkInForm.reset({
      duration: 30,
      notes: '',
    });
    setIsCheckInDialogOpen(true);
  }

  async function handleCheckInSubmit(data: any) {
    if (!checkInTask) return;
    try {
      await createCheckIn({
        task_id: data.task_id === 'none' ? null : data.task_id,
        duration: data.duration,
        notes: data.notes || null,
        date: new Date().toISOString().split('T')[0],
      });
      toast.success('打卡记录添加成功');
      setIsCheckInDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('添加打卡记录失败:', error);
      toast.error('添加打卡记录失败');
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 @container xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-3xl font-bold">任务管理</h1>
            <p className="text-muted-foreground mt-2">管理你的学习任务</p>
          </div>
          <Button onClick={handleAddTask}>
            <Plus className="mr-2 h-4 w-4" />
            添加任务
          </Button>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex flex-col gap-4 @container xl:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索任务..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* 任务列表 */}
        <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="todo">待办</TabsTrigger>
            <TabsTrigger value="in_progress">进行中</TabsTrigger>
            <TabsTrigger value="completed">已完成</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStatus} className="mt-6">
            {loading ? (
              <div className="grid gap-4 @container xl:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-40 bg-muted" />
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                <p className="text-muted-foreground">暂无任务</p>
              </div>
            ) : (
              <div className="grid gap-4 @container xl:grid-cols-2">
                {filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onComplete={handleCompleteTask}
                    onCheckIn={handleCheckInClick}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* 添加/编辑任务对话框 */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTask ? '编辑任务' : '添加任务'}</DialogTitle>
              <DialogDescription>
                {editingTask ? '修改任务信息' : '创建一个新的学习任务'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  rules={{ required: '请输入任务标题' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>任务标题</FormLabel>
                      <FormControl>
                        <Input placeholder="输入任务标题" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>任务描述</FormLabel>
                      <FormControl>
                        <Textarea placeholder="输入任务描述" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>分类</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择分类" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.icon} {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>状态</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="todo">待办</SelectItem>
                            <SelectItem value="in_progress">进行中</SelectItem>
                            <SelectItem value="completed">已完成</SelectItem>
                            <SelectItem value="archived">已归档</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>优先级</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">低</SelectItem>
                            <SelectItem value="medium">中</SelectItem>
                            <SelectItem value="high">高</SelectItem>
                            <SelectItem value="urgent">紧急</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>截止日期</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    取消
                  </Button>
                  <Button type="submit">
                    {editingTask ? '保存' : '创建'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* 打卡对话框 */}
        <Dialog open={isCheckInDialogOpen} onOpenChange={setIsCheckInDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加打卡记录</DialogTitle>
              <DialogDescription>
                为任务"{checkInTask?.title}"添加今日打卡记录
              </DialogDescription>
            </DialogHeader>
            <Form {...checkInForm}>
              <form onSubmit={checkInForm.handleSubmit(handleCheckInSubmit)} className="space-y-4">
                <FormField
                  control={checkInForm.control}
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
                  control={checkInForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>备注</FormLabel>
                      <FormControl>
                        <Textarea placeholder="记录今天的学习内容..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCheckInDialogOpen(false)}>
                    取消
                  </Button>
                  <Button type="submit">添加打卡</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
