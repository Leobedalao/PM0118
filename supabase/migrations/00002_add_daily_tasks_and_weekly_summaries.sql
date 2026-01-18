-- 创建每日任务表
CREATE TABLE daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建周总结表
CREATE TABLE weekly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  current_goals TEXT,
  achievements TEXT,
  challenges TEXT,
  next_goals TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_daily_tasks_date ON daily_tasks(date);
CREATE INDEX idx_weekly_summaries_week_start ON weekly_summaries(week_start);

-- 启用RLS
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_summaries ENABLE ROW LEVEL SECURITY;

-- 创建公开访问策略
CREATE POLICY "允许所有人查看每日任务" ON daily_tasks FOR SELECT USING (true);
CREATE POLICY "允许所有人管理每日任务" ON daily_tasks FOR ALL USING (true);

CREATE POLICY "允许所有人查看周总结" ON weekly_summaries FOR SELECT USING (true);
CREATE POLICY "允许所有人管理周总结" ON weekly_summaries FOR ALL USING (true);