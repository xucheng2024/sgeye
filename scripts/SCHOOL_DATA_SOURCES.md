# 学校数据来源指南

## 数据来源选项

### 选项 1: 使用示例数据（快速测试）✅

我已经创建了一个示例 CSV 文件，包含 27 所小学的数据：

```bash
# 直接导入示例数据
node scripts/import-school-data.js --file data/schools-sample.csv
```

这个文件包含：
- Ang Mo Kio, Bedok, Bishan, Bukit Batok, Clementi, Tampines, Woodlands, Queenstown, Toa Payoh 等区域的小学
- 基本的学校名称、地址、邮编、区域信息

### 选项 2: 从 MOE School Finder 手动收集

1. 访问 [MOE School Finder](https://www.moe.gov.sg/schoolfinder)
2. 筛选条件：
   - School Type: Primary
   - 逐个查看学校详情
3. 收集信息：
   - School Name
   - Address
   - Postal Code
   - Planning Area / Town
4. 整理成 CSV 格式（参考 `data/schools-sample.csv`）

### 选项 3: 使用脚本生成（部分自动化）

运行脚本生成更多学校数据（会调用 OneMap API 获取坐标）：

```bash
node scripts/fetch-schools-from-moe.js > data/schools-generated.csv
node scripts/import-school-data.js --file data/schools-generated.csv
```

**注意**：这个脚本包含了一些已知的小学，你可以扩展列表。

### 选项 4: 从 data.gov.sg 查找

1. 访问 [data.gov.sg](https://data.gov.sg)
2. 搜索关键词：
   - "school directory"
   - "primary schools"
   - "education institutions"
3. 如果找到数据集，获取 `resource_id`
4. 使用导入脚本：

```bash
node scripts/import-school-data.js --source datagovsg --resource-id <resource_id>
```

### 选项 5: 社区整理的数据

一些 GitHub 项目可能有整理好的新加坡学校数据：
- 搜索 "singapore schools dataset"
- 检查是否有 CSV/JSON 格式的数据

## 推荐流程

### 第一步：测试导入（使用示例数据）

```bash
# 1. 导入示例数据
node scripts/import-school-data.js --file data/schools-sample.csv

# 2. 检查数据
# 在 Supabase Dashboard 查看 primary_schools 表
```

### 第二步：扩展数据

1. 从 MOE School Finder 收集更多学校
2. 添加到 CSV 文件
3. 重新导入（脚本会自动更新已存在的学校）

### 第三步：添加 PSLE Cut-off 数据

PSLE cut-off 数据需要单独收集（MOE 不公开官方数据）：

1. 从社区来源收集（KiasuParents, Schoolbell 等）
2. 整理成以下格式：

```sql
INSERT INTO psle_cutoff (school_id, year, cutoff_range, cutoff_min, cutoff_max, source_note)
VALUES 
  (1, 2023, '231-250', 231, 250, 'Community aggregated'),
  (1, 2022, '231-250', 231, 250, 'Community aggregated');
```

## 数据字段说明

- `school_name`: 学校全名（必填）
- `address`: 完整地址
- `postal_code`: 6位邮编
- `planning_area`: 规划区（如 ANG MO KIO）
- `town`: 镇/区域（通常与 planning_area 相同）
- `latitude`: 纬度（可选，脚本会自动获取）
- `longitude`: 经度（可选，脚本会自动获取）

## 注意事项

1. **坐标自动获取**：如果 CSV 中没有坐标，导入脚本会尝试使用 OneMap API 自动获取（较慢）
2. **数据更新**：脚本使用 `school_name + postal_code` 作为唯一标识，重复导入会更新现有记录
3. **PSLE Cut-off**：这部分数据需要单独收集，MOE 不提供官方数据

## 快速开始

最简单的开始方式：

```bash
# 导入示例数据（27 所小学）
node scripts/import-school-data.js --file data/schools-sample.csv
```

然后访问 PSLE 页面测试功能！

