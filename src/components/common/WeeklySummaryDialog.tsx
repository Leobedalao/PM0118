import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { WeeklySummary, WeeklySummaryInput } from '@/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface WeeklySummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: WeeklySummary | null;
  weekRange: { weekStart: string; weekEnd: string };
  onSave: (data: WeeklySummaryInput) => void;
}

export function WeeklySummaryDialog({
  open,
  onOpenChange,
  summary,
  weekRange,
  onSave
}: WeeklySummaryDialogProps) {
  const [currentGoals, setCurrentGoals] = useState('');
  const [achievements, setAchievements] = useState('');
  const [challenges, setChallenges] = useState('');
  const [nextGoals, setNextGoals] = useState('');

  useEffect(() => {
    if (summary) {
      setCurrentGoals(summary.current_goals || '');
      setAchievements(summary.achievements || '');
      setChallenges(summary.challenges || '');
      setNextGoals(summary.next_goals || '');
    } else {
      setCurrentGoals('');
      setAchievements('');
      setChallenges('');
      setNextGoals('');
    }
  }, [summary, open]);

  function handleSave() {
    onSave({
      week_start: weekRange.weekStart,
      week_end: weekRange.weekEnd,
      current_goals: currentGoals || undefined,
      achievements: achievements || undefined,
      challenges: challenges || undefined,
      next_goals: nextGoals || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>周总结</DialogTitle>
          <DialogDescription>
            {weekRange.weekStart && weekRange.weekEnd ? (
              <>
                {format(new Date(weekRange.weekStart), 'yyyy年MM月dd日', { locale: zhCN })} -{' '}
                {format(new Date(weekRange.weekEnd), 'yyyy年MM月dd日', { locale: zhCN })}
              </>
            ) : (
              '加载中...'
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="current_goals" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="current_goals">本周目标</TabsTrigger>
            <TabsTrigger value="achievements">本周成就</TabsTrigger>
            <TabsTrigger value="challenges">本周挑战</TabsTrigger>
            <TabsTrigger value="next_goals">下周目标</TabsTrigger>
          </TabsList>

          <TabsContent value="current_goals" className="space-y-4">
            <div className="space-y-2">
              <Label>本周目标</Label>
              <Textarea
                placeholder="记录本周的学习目标和计划..."
                value={currentGoals}
                onChange={(e) => setCurrentGoals(e.target.value)}
                rows={10}
              />
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <div className="space-y-2">
              <Label>本周成就</Label>
              <Textarea
                placeholder="记录本周完成的任务和取得的成就..."
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                rows={10}
              />
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-4">
            <div className="space-y-2">
              <Label>本周挑战</Label>
              <Textarea
                placeholder="记录本周遇到的困难和挑战..."
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                rows={10}
              />
            </div>
          </TabsContent>

          <TabsContent value="next_goals" className="space-y-4">
            <div className="space-y-2">
              <Label>下周目标</Label>
              <Textarea
                placeholder="规划下周的学习目标和计划..."
                value={nextGoals}
                onChange={(e) => setNextGoals(e.target.value)}
                rows={10}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
