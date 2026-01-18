import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Calendar, Flag } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Task } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onComplete?: (task: Task) => void;
  onCheckIn?: (task: Task) => void;
}

const statusConfig = {
  todo: { label: '待办', color: 'bg-muted text-muted-foreground' },
  in_progress: { label: '进行中', color: 'bg-primary text-primary-foreground' },
  completed: { label: '已完成', color: 'bg-success text-white' },
  archived: { label: '已归档', color: 'bg-secondary text-secondary-foreground' },
};

const priorityConfig = {
  low: { label: '低', color: 'text-muted-foreground' },
  medium: { label: '中', color: 'text-primary' },
  high: { label: '高', color: 'text-warning' },
  urgent: { label: '紧急', color: 'text-destructive' },
};

export function TaskCard({ task, onEdit, onDelete, onComplete, onCheckIn }: TaskCardProps) {
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={cn('text-xs', status.color)}>
                {status.label}
              </Badge>
              <div className={cn('flex items-center gap-1 text-xs', priority.color)}>
                <Flag className="h-3 w-3" />
                {priority.label}
              </div>
            </div>
            <CardTitle className="text-lg">{task.title}</CardTitle>
            {task.description && (
              <CardDescription className="mt-2 line-clamp-2">
                {task.description}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  编辑
                </DropdownMenuItem>
              )}
              {onComplete && task.status !== 'completed' && (
                <DropdownMenuItem onClick={() => onComplete(task)}>
                  标记完成
                </DropdownMenuItem>
              )}
              {onCheckIn && (
                <DropdownMenuItem onClick={() => onCheckIn(task)}>
                  添加打卡
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(task)}
                  className="text-destructive"
                >
                  删除
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      {task.due_date && (
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>截止日期：{format(new Date(task.due_date), 'yyyy年MM月dd日', { locale: zhCN })}</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
