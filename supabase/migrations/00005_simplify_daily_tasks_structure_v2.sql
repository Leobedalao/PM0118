-- 简化daily_tasks表结构，移除冗余字段
-- 今日任务应该是任务的子集，只需要关联task_id
ALTER TABLE daily_tasks
DROP COLUMN IF EXISTS title,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS category_id,
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS priority;

-- task_id改为必填字段
ALTER TABLE daily_tasks
ALTER COLUMN task_id SET NOT NULL;

-- 删除不需要的索引
DROP INDEX IF EXISTS idx_daily_tasks_category;
DROP INDEX IF EXISTS idx_daily_tasks_status;
DROP INDEX IF EXISTS idx_daily_tasks_priority;