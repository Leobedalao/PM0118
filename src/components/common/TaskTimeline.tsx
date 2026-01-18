import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle2, Circle } from 'lucide-react';
import type { DailyTask } from '@/types';
import { format, parseISO, isToday, isFuture, isPast } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface TaskTimelineProps {
  tasks: DailyTask[];
}

export function TaskTimeline({ tasks }: TaskTimelineProps) {
  // 按日期分组任务
  const groupedTasks = tasks.reduce((acc, task) => {
    const date = task.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {} as Record<string, DailyTask[]>);

  // 按日期排序
  const sortedDates = Object.keys(groupedTasks).sort();

  function getDateLabel(dateStr: string) {
    const date = parseISO(dateStr);
    if (isToday(date)) {
      return '今天';
    } else if (isFuture(date)) {
      return '未来';
    } else if (isPast(date)) {
      return '过去';
    }
    return '';
  }

  function getDateColor(dateStr: string) {
    const date = parseISO(dateStr);
    if (isToday(date)) {
      return 'text-primary';
    } else if (isFuture(date)) {
      return 'text-muted-foreground';
    } else if (isPast(date)) {
      return 'text-muted-foreground/60';
    }
    return '';
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'urgent':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-primary text-primary-foreground';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  }

  function getPriorityLabel(priority: string) {
    switch (priority) {
      case 'urgent':
        return '紧急';
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return priority;
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'todo':
        return '待办';
      case 'in_progress':
        return '进行中';
      case 'completed':
        return '已完成';
      case 'archived':
        return '已归档';
      default:
        return status;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          任务时间轴
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedDates.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            暂无每日任务
          </div>
        ) : (
          <div className="relative">
            {/* 时间轴线 */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

            {/* 任务列表 */}
            <div className="space-y-6">
              {sortedDates.map((date) => {
                const dateTasks = groupedTasks[date];
                const dateObj = parseISO(date);
                const dateLabel = getDateLabel(date);
                const dateColor = getDateColor(date);

                return (
                  <div key={date} className="relative pl-10">
                    {/* 日期节点 */}
                    <div className={`absolute left-0 top-0 flex items-center justify-center w-8 h-8 rounded-full border-2 border-border bg-background ${dateColor}`}>
                      <Clock className="h-4 w-4" />
                    </div>

                    {/* 日期标题 */}
                    <div className="mb-3">
                      <div className={`text-sm font-semibold ${dateColor}`}>
                        {format(dateObj, 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
                      </div>
                      {dateLabel && (
                        <Badge variant="outline" className="mt-1">
                          {dateLabel}
                        </Badge>
                      )}
                    </div>

                    {/* 该日期的任务 */}
                    <div className="space-y-2">
                      {dateTasks.map((task) => (
                        <div
                          key={task.id}
                          className="rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
                        >
                          <div className="flex items-start gap-2">
                            {task.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {task.title}
                              </div>
                              {task.description && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {task.description}
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                  母任务: {task.task.title}
                                </Badge>
                                {task.task.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {task.task.category.name}
                                  </Badge>
                                )}
                                <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                                  {getPriorityLabel(task.priority)}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {getStatusLabel(task.status)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
