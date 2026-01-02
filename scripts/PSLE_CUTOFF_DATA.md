# PSLE Cut-off 数据说明

## 当前状态

**问题**：`psle_cutoff` 表目前是空的，所以 School Landscape 显示的 cut-off 分布都是 0。

## 数据来源

MOE **不提供**官方的 PSLE cut-off 数据。需要从社区来源收集：

### 推荐来源

1. **KiasuParents Forum**
   - 家长分享的历年 cut-off 数据
   - 需要手动整理

2. **Schoolbell.sg**
   - 可能有部分学校的历史数据

3. **家长社区汇总**
   - 各种家长群组和论坛
   - 数据准确性需要验证

## 数据格式

### CSV 格式示例

```csv
school_name,year,cutoff_range,cutoff_min,cutoff_max,source_note
"Ang Mo Kio Primary School",2023,"231-250",231,250,"Community aggregated"
"Catholic High School (Primary Section)",2023,"≥251",251,260,"Community aggregated"
"Bedok Green Primary School",2022,"≤230",220,230,"Community aggregated"
```

### JSON 格式示例

```json
[
  {
    "school_name": "Ang Mo Kio Primary School",
    "year": 2023,
    "cutoff_range": "231-250",
    "cutoff_min": 231,
    "cutoff_max": 250,
    "source_note": "Community aggregated"
  }
]
```

## 导入方法

### 1. 准备数据文件

创建 CSV 或 JSON 文件，包含：
- `school_name`: 学校全名（必须匹配 `primary_schools` 表中的名称）
- `year`: 年份（如 2023, 2022）
- `cutoff_range`: 区间字符串（如 "231-250", "≤230", "≥251"）
- `cutoff_min`: 最小 cut-off（可选，数字）
- `cutoff_max`: 最大 cut-off（可选，数字）
- `source_note`: 数据来源说明（可选）

### 2. 运行导入脚本

```bash
node scripts/import-psle-cutoff.js --file data/psle-cutoff-data.csv
```

## 数据收集建议

### MVP 阶段（最小可用）

可以先收集一些热门学校的 cut-off 数据：
- 每个 town 选择 2-3 所代表性学校
- 收集最近 2-3 年的数据
- 这样至少可以展示部分数据

### 完整版本

- 收集所有 182 所学校的 cut-off 数据
- 覆盖最近 3-5 年
- 定期更新

## 注意事项

1. **数据准确性**：社区数据可能不准确，建议标注来源
2. **数据缺失**：不是所有学校都有公开的 cut-off 数据
3. **数据更新**：cut-off 每年都会变化，需要定期更新
4. **隐私考虑**：MOE 不公开这些数据是有原因的，使用时要注意说明

## 临时方案

在收集到真实数据之前，可以：

1. **使用示例数据**：创建一些示例 cut-off 数据用于测试功能
2. **显示说明**：在页面上明确说明 cut-off 数据来自社区来源，不是官方数据
3. **渐进增强**：先导入部分学校的数据，逐步完善

## 下一步

1. 收集 cut-off 数据（从社区来源）
2. 整理成 CSV/JSON 格式
3. 运行导入脚本
4. 验证数据在页面上的显示


