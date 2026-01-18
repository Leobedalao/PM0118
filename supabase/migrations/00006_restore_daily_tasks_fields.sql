-- 恢复每日任务的独立字段
-- 每日任务是母任务的细分，需要有自己的标题、描述、状态、优先级
ALTER TABLE daily_tasks
ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '未命名任务',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'todo',
ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'medium';

-- 添加约束检查
ALTER TABLE daily_tasks
DROP CONSTRAINT IF EXISTS daily_tasks_status_check,
ADD CONSTRAINT daily_tasks_status_check CHECK (status IN ('todo', 'in_progress', 'completed', 'archived'));

ALTER TABLE daily_tasks
DROP CONSTRAINT IF EXISTS daily_tasks_priority_check,
ADD CONSTRAINT daily_tasks_priority_check CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_daily_tasks_status ON daily_tasks(status);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_priority ON daily_tasks(priority);

-- 移除默认值约束（仅用于迁移）
ALTER TABLE daily_tasks
ALTER COLUMN title DROP DEFAULT;