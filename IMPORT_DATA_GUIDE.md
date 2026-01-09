# HDB 数据导入指南

## 问题：为什么只有2017年的数据？

GitHub Actions 的 `update-hdb-data.js` 脚本是设计为**增量更新**的，每天只获取新数据。第一次运行时，由于数据库是空的，它只导入了少量数据（100条）。

## 解决方案：完整历史数据导入

有两种方式导入所有历史数据（2017-2025）：

### 方案 1：使用 GitHub Actions 手动触发（推荐）

1. 进入 GitHub 仓库 → **Actions** 标签页
2. 选择 **"Initial Full Import HDB Data"** workflow
3. 点击 **"Run workflow"** → **"Run workflow"**
4. 等待完成（可能需要10-20分钟，取决于数据量）

这个 workflow 会：
- 导入所有历史数据（2017-2025）
- 自动运行聚合
- 更新 `agg_monthly` 表

### 方案 2：修改现有 workflow 让它导入更多数据

我已经更新了 `update-hdb-data.js`，现在：
- **首次运行**（数据库为空）：会导入最多 500 个批次（50,000 条记录）
- **后续运行**：只导入新数据（增量更新）

你可以再次手动触发 **"Update HDB Resale Data"** workflow，它会继续导入更多数据。

### 方案 3：本地运行完整导入脚本

如果你想在本地运行：

```bash
# 设置环境变量
export SUPABASE_URL=https://iecxbqkmazkxzrsobxyn.supabase.co
export SUPABASE_SERVICE_KEY=你的service_role_key

# 运行完整导入
node scripts/initial-import-hdb-data.js

# 然后运行聚合
node scripts/run-aggregation.js
```

## 推荐操作

**立即操作**：
1. 进入 GitHub → Actions
2. 运行 **"Initial Full Import HDB Data"** workflow（手动触发）
3. 等待完成（约10-20分钟）

**之后**：
- 每天自动运行 `update-hdb-data` 获取新数据
- 不需要再手动操作

## 数据量说明

根据 data.gov.sg，完整数据集包含：
- **时间范围**：2017年1月 - 2025年12月
- **预计记录数**：约 200,000+ 条交易记录
- **导入时间**：约 10-20 分钟（取决于网络速度）

导入完成后，你的网站就能显示完整的历史数据了！





