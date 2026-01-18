import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Plus, Trash2, Edit2 } from 'lucide-react';
import type { DailyTask, DailyTaskInput, Task } from '@/types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface DailyTaskListProps {
  tasks: DailyTask[];
  allTasks: Task[];
  onToggle: (id: string, completed: boolean) => void;
  onAdd: (task: DailyTaskInput) => void;
  onUpdate: (id: string, task: Partial<DailyTaskInput>) => void;
  onDelete: (id: string) => void;
}

export function DailyTaskList({ tasks, allTasks, onToggle, onAdd, onUpdate, onDelete }: DailyTaskListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);

  const form = useForm<DailyTaskInput>({
    defaultValues: {
      task_id: '',
    },
  });

  function handleOpenDialog(task?: DailyTask) {
    if (task) {
      setEditingTask(task);
      form.reset({
        task_id: task.task_id,
      });
    } else {
      setEditingTask(null);
      form.reset({
        task_id: '',
      });
    }
    setIsDialogOpen(true);
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
                  <div className="flex-1">
                    <div className={task.completed ? 'text-muted-foreground line-through' : ''}>
                      {task.task.title}
                    </div>
                    {task.task.category && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {task.task.category.name}
                      </Badge>
                    )}
                  </div>
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
                rules={{ required: '请选择任务' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>选择任务</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="从任务管理中选择一个任务" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {allTasks.map(task => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title}
                            {task.category && ` (${task.category.name})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
