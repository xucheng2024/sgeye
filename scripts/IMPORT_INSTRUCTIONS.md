# 学校数据导入说明

## 数据文件已就绪

✅ **数据文件**: `data/schools-complete.csv`
- 182 所小学（全部来自 MOE School Finder）
- 所有坐标都是真实的（从 OneMap API 获取）
- 100% 成功率

## 导入步骤

### 1. 获取 Supabase Service Key

1. 打开 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **Settings** > **API**
4. 找到 **service_role key**（不是 anon key！）
5. 复制这个 key

### 2. 设置环境变量

**方式 A：添加到 .env.local（推荐）**

```bash
# 在 .env.local 文件中添加：
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

**方式 B：临时设置（一次性）**

```bash
export SUPABASE_SERVICE_KEY=your_service_role_key_here
node scripts/import-school-data.js --file data/schools-complete.csv
```

### 3. 运行导入

```bash
node scripts/import-school-data.js --file data/schools-complete.csv
```

## 导入结果

导入脚本会显示：
- Imported: 新导入的学校数量
- Updated: 更新的学校数量（如果已存在）
- Errors: 错误数量

## 验证导入

导入后，可以在 Supabase Dashboard 检查：
1. 进入 **Table Editor**
2. 查看 `primary_schools` 表
3. 应该看到 182 条记录

## 注意事项

- Service Role Key 有完整权限，不要提交到 Git
- 如果学校已存在（基于 school_name + postal_code），会被更新而不是重复插入
- 导入过程可能需要几分钟（182 所学校）

