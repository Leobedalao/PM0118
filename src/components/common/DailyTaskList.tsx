import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import type { DailyTask } from '@/types';
import { useState } from 'react';

interface DailyTaskListProps {
  tasks: DailyTask[];
  onToggle: (id: string, completed: boolean) => void;
  onAdd: (title: string) => void;
  onUpdate: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function DailyTaskList({ tasks, onToggle, onAdd, onUpdate, onDelete }: DailyTaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  function handleAdd() {
    if (newTaskTitle.trim()) {
      onAdd(newTaskTitle.trim());
      setNewTaskTitle('');
    }
  }

  function handleStartEdit(task: DailyTask) {
    setEditingId(task.id);
    setEditingTitle(task.title);
  }

  function handleSaveEdit() {
    if (editingId && editingTitle.trim()) {
      onUpdate(editingId, editingTitle.trim());
      setEditingId(null);
      setEditingTitle('');
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditingTitle('');
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>今日任务</CardTitle>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{totalCount} 已完成
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 添加新任务 */}
        <div className="flex gap-2">
          <Input
            placeholder="添加今日任务..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button onClick={handleAdd} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* 任务列表 */}
        {tasks.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            暂无今日任务，添加一个开始吧！
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
                {editingId === task.id ? (
                  <>
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleSaveEdit}
                      className="h-8 w-8"
                    >
                      <Check className="h-4 w-4 text-success" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleCancelEdit}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span
                      className={`flex-1 ${task.completed ? 'text-muted-foreground line-through' : ''}`}
                    >
                      {task.title}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleStartEdit(task)}
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
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
