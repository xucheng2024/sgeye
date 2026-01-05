# GitHub Actions 自动更新设置指南

## 快速设置步骤

### 1. 添加 GitHub Secrets

1. 进入你的 GitHub 仓库
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**，添加以下两个 secrets：

   **Secret 1:**
   - Name: `SUPABASE_URL`
   - Value: `https://iecxbqkmazkxzrsobxyn.supabase.co` (你的 Supabase URL)

   **Secret 2:**
   - Name: `SUPABASE_SERVICE_KEY`
   - Value: 你的 Supabase **service_role** key (不是 anon key!)
     - 获取方式：Supabase Dashboard → Settings → API → service_role key

### 2. 推送代码到 GitHub

```bash
git add .
git commit -m "Add GitHub Actions for auto-updating HDB data"
git push
```

### 3. 验证 Workflow

1. 进入 GitHub 仓库的 **Actions** 标签页
2. 你应该能看到 "Update HDB Resale Data" workflow
3. 可以手动触发测试：点击 workflow → **Run workflow** → **Run workflow**

## 运行时间

- **默认时间**: 每天 UTC 2:00 AM (新加坡时间 10:00 AM)
- **修改时间**: 编辑 `.github/workflows/update-hdb-data.yml` 中的 cron 表达式

## 工作流程

1. **每天自动运行** (或手动触发)
2. **从 data.gov.sg 获取最新数据**
3. **增量更新** Supabase `raw_resale_2017` 表
4. **跳过已存在的数据** (基于唯一约束)

## 聚合数据更新

目前聚合 SQL 需要手动运行：

1. 进入 Supabase Dashboard → SQL Editor
2. 打开 `scripts/aggregate-hdb-data.sql`
3. 复制 SQL 并运行

**未来改进**: 可以创建 Supabase Edge Function 或 Database Function 来自动化这一步。

## 监控和调试

### 查看运行日志
- GitHub → Actions → 选择 workflow run → 查看日志

### 检查数据
- Supabase Dashboard → Table Editor → `raw_resale_2017`
- 查看最新的 `month` 字段确认数据已更新

### 常见问题

**Q: Workflow 失败，提示 "SUPABASE_URL not set"**
- A: 检查 GitHub Secrets 是否正确添加，名称必须完全匹配

**Q: 认证错误**
- A: 确保使用的是 `service_role` key，不是 `anon` key

**Q: 没有新数据插入**
- A: 检查 data.gov.sg API 是否正常，查看 workflow 日志

**Q: 如何修改运行时间？**
- A: 编辑 `.github/workflows/update-hdb-data.yml`，修改 cron 表达式

## Cron 表达式参考

```
0 2 * * *     # 每天 UTC 2:00 AM
0 10 * * *    # 每天 UTC 10:00 AM
0 0 * * 1     # 每周一 UTC 0:00
0 0 1 * *     # 每月1号 UTC 0:00
```

格式：`分钟 小时 日 月 星期`

## 手动触发

如果需要立即更新数据：
1. GitHub → Actions
2. 选择 "Update HDB Resale Data"
3. 点击 "Run workflow"
4. 选择分支（通常是 main）
5. 点击 "Run workflow"



