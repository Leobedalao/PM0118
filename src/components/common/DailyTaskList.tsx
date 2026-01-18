import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Plus, Trash2, Edit2 } from 'lucide-react';
import type { DailyTask, DailyTaskInput, Category, Task } from '@/types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface DailyTaskListProps {
  tasks: DailyTask[];
  categories: Category[];
  allTasks: Task[];
  onToggle: (id: string, completed: boolean) => void;
  onAdd: (task: DailyTaskInput) => void;
  onUpdate: (id: string, task: Partial<DailyTaskInput>) => void;
  onDelete: (id: string) => void;
}

export function DailyTaskList({ tasks, categories, allTasks, onToggle, onAdd, onUpdate, onDelete }: DailyTaskListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);

  const form = useForm<DailyTaskInput>({
    defaultValues: {
      title: '',
      description: '',
      task_id: '',
      category_id: '',
      status: 'todo',
      priority: 'medium',
    },
  });

  function handleOpenDialog(task?: DailyTask) {
    if (task) {
      setEditingTask(task);
      form.reset({
        title: task.title,
        description: task.description || '',
        task_id: task.task_id || '',
        category_id: task.category_id || '',
        status: task.status,
        priority: task.priority,
      });
    } else {
      setEditingTask(null);
      form.reset({
        title: '',
        description: '',
        task_id: '',
        category_id: '',
        status: 'todo',
        priority: 'medium',
      });
    }
    setIsDialogOpen(true);
  }

  function handleTaskSelect(taskId: string) {
    if (taskId === 'none') {
      form.setValue('task_id', '');
      return;
    }
    
    const selectedTask = allTasks.find(t => t.id === taskId);
    if (selectedTask) {
      form.setValue('task_id', taskId);
      form.setValue('title', selectedTask.title);
      form.setValue('description', selectedTask.description || '');
      form.setValue('category_id', selectedTask.category_id || '');
      form.setValue('status', selectedTask.status);
      form.setValue('priority', selectedTask.priority);
    }
  }

  function handleSubmit(data: DailyTaskInput) {
    if (editingTask) {
      onUpdate(editingTask.id, data);
    } else {
      onAdd(data);
    }
    setIsDialogOpen(false);
    form.reset();
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>今日任务</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {completedCount}/{totalCount} 已完成
              </span>
              <Button size="sm" onClick={() => handleOpenDialog()}>
                <Plus className="mr-1 h-4 w-4" />
                添加
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* 任务列表 */}
          {tasks.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              暂无今日任务，点击"添加"按钮开始吧！
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-accent"
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) => onToggle(task.id, checked as boolean)}
                  />
                  <span
                    className={`flex-1 ${task.completed ? 'text-muted-foreground line-through' : ''}`}
                  >
                    {task.title}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleOpenDialog(task)}
                    className="h-8 w-8"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete(task.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 添加/编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? '编辑今日任务' : '添加今日任务'}</DialogTitle>
            <DialogDescription>
              {editingTask ? '修改任务内容' : '创建一个新的今日任务'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="task_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>关联任务（可选）</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleTaskSelect(value);
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择要关联的任务" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">不关联任务</SelectItem>
                        {allTasks.map(task => (
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
                name="title"
                rules={{ required: '请输入任务标题' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>任务标题</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="输入今日任务标题..." 
                        {...field}
                      />
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
                      <Textarea 
                        placeholder="输入任务描述（可选）..." 
                        {...field}
                        rows={3}
                      />
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
                        <SelectItem value="none">无分类</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
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
                            <SelectValue placeholder="选择状态" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="todo">待办</SelectItem>
                          <SelectItem value="in_progress">进行中</SelectItem>
                          <SelectItem value="completed">已完成</SelectItem>
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
                            <SelectValue placeholder="选择优先级" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">低</SelectItem>
                          <SelectItem value="medium">中</SelectItem>
                          <SelectItem value="high">高</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  取消
                </Button>
                <Button type="submit">
                  {editingTask ? '保存' : '添加'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
