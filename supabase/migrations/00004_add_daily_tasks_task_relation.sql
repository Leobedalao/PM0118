-- 为daily_tasks表添加task_id字段，关联到tasks表
ALTER TABLE daily_tasks
ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES tasks(id) ON DELETE SET NULL;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_daily_tasks_task ON daily_tasks(task_id);