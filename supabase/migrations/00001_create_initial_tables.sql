-- 创建任务分类表
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建任务表
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'archived')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建打卡记录表
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration INTEGER, -- 学习时长（分钟）
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_tasks_category ON tasks(category_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_check_ins_task ON check_ins(task_id);
CREATE INDEX idx_check_ins_date ON check_ins(date);

-- 插入初始分类数据
INSERT INTO categories (name, description, color, icon) VALUES
  ('Linux编程', 'Linux环境下的编程学习计划', 'hsl(217, 91%, 60%)', '💻'),
  ('医学影像项目', '基于PyTorch的医学影像分析项目实战（Kaggle、Grand Challenge）', 'hsl(142, 71%, 45%)', '🏥'),
  ('论文阅读', '医学影像相关基础论文阅读（每天一篇）', 'hsl(38, 92%, 50%)', '📚'),
  ('CS336课程', 'CS336大模型课程学习进度', 'hsl(280, 65%, 60%)', '🎓'),
  ('代码练习', '每日代码练习打卡（每天30分钟）', 'hsl(340, 75%, 55%)', '⚡'),
  ('技术学习', 'Docker、Git、计算机网络学习', 'hsl(199, 89%, 48%)', '🔧'),
  ('项目开发', '项目管理系统开发进度', 'hsl(0, 72%, 51%)', '🚀');

-- 启用RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- 创建公开访问策略（无需登录）
CREATE POLICY "允许所有人查看分类" ON categories FOR SELECT USING (true);
CREATE POLICY "允许所有人管理分类" ON categories FOR ALL USING (true);

CREATE POLICY "允许所有人查看任务" ON tasks FOR SELECT USING (true);
CREATE POLICY "允许所有人管理任务" ON tasks FOR ALL USING (true);

CREATE POLICY "允许所有人查看打卡记录" ON check_ins FOR SELECT USING (true);
CREATE POLICY "允许所有人管理打卡记录" ON check_ins FOR ALL USING (true);