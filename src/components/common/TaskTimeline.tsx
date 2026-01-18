import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle2, Circle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DailyTask } from '@/types';
import { format, parseISO, isToday, isFuture, isPast } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useRef } from 'react';

interface TaskTimelineProps {
  tasks: DailyTask[];
}

export function TaskTimeline({ tasks }: TaskTimelineProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
      return 'border-primary bg-primary/10';
    } else if (isFuture(date)) {
      return 'border-muted-foreground/30 bg-muted/30';
    } else if (isPast(date)) {
      return 'border-muted-foreground/20 bg-muted/20';
    }
    return '';
  }

  function getDateTextColor(dateStr: string) {
    const date = parseISO(dateStr);
    if (isToday(date)) {
      return 'text-primary';
    }
    return 'text-foreground';
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

  function scrollLeft() {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  }

  function scrollRight() {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            任务时间轴
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollLeft}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollRight}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedDates.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            暂无每日任务
          </div>
        ) : (
          <div className="relative">
            {/* 横向滚动容器 */}
            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto pb-4 scroll-smooth"
              style={{ scrollbarWidth: 'thin' }}
            >
              {sortedDates.map((date, index) => {
                const dateTasks = groupedTasks[date];
                const dateObj = parseISO(date);
                const dateLabel = getDateLabel(date);
                const dateColor = getDateColor(date);
                const dateTextColor = getDateTextColor(date);

                return (
                  <div key={date} className="flex items-start gap-4 shrink-0">
                    {/* 日期卡片 */}
                    <div className={`flex flex-col items-center min-w-[280px] max-w-[280px]`}>
                      {/* 日期头部 */}
                      <div className={`w-full rounded-lg border-2 p-3 mb-3 ${dateColor}`}>
                        <div className={`text-center font-semibold ${dateTextColor}`}>
                          {format(dateObj, 'MM月dd日', { locale: zhCN })}
                        </div>
                        <div className="text-center text-sm text-muted-foreground">
                          {format(dateObj, 'EEEE', { locale: zhCN })}
                        </div>
                        {dateLabel && (
                          <div className="flex justify-center mt-2">
                            <Badge variant={isToday(dateObj) ? 'default' : 'outline'} className="text-xs">
                              {dateLabel}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* 该日期的任务 */}
                      <div className="w-full space-y-2">
                        {dateTasks.map((task) => (
                          <div
                            key={task.id}
                            className="rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
                          >
                            <div className="flex items-start gap-2">
                              {task.completed ? (
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {task.title}
                                </div>
                                {task.description && (
                                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {task.description}
                                  </div>
                                )}
                                <div className="flex flex-wrap gap-1 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {task.task.title}
                                  </Badge>
                                  <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                                    {getPriorityLabel(task.priority)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 连接线 */}
                    {index < sortedDates.length - 1 && (
                      <div className="flex items-center pt-12 shrink-0">
                        <div className="w-8 h-0.5 bg-border" />
                      </div>
                    )}
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
