# 如何使用修复脚本

## 步骤 1: 准备 JSON 数据

您需要提供一个包含所有 neighbourhood living notes 的 JSON 数组文件。

JSON 格式应该包含以下字段：
- `neighbourhood_name` (必需)
- `noise_density_rating`, `noise_density_note`
- `daily_convenience_rating`, `daily_convenience_note`
- `green_outdoor_rating`, `green_outdoor_note`
- `crowd_vibe_rating`, `crowd_vibe_note`
- `long_term_comfort_rating`, `long_term_comfort_note`
- `zone_type` (必需)
- `rating_mode` (必需)
- `drivers` (数组)
- `variance_level`
- `short_note`
- `display_name`

## 步骤 2: 运行脚本

将 JSON 数据保存为文件（例如 `neighbourhoods.json`），然后运行：

```bash
npx ts-node scripts/fix-living-notes-data.ts neighbourhoods.json ./scripts/output
```

或者直接告诉我 JSON 数据，我会帮您运行。

## 步骤 3: 查看结果

脚本会生成：
- `neighbourhoods.fixed.json` - 修复后的数据
- `errors.json` - 验证错误（如果有）
- `review_list.json` - 需要人工审核的项
- `display_name_duplicates.json` - 重复的显示名称

## 步骤 4: 生成 SQL

```bash
npx ts-node scripts/generate-upsert-sql.ts ./scripts/output/neighbourhoods.fixed.json ./scripts/output/upsert.sql
```

## 步骤 5: 应用到数据库

运行生成的 `upsert.sql` 文件到 Supabase。

