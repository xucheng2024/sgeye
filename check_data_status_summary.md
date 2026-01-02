# 数据表填充状态检查

## 需要检查的表

根据你的查询结果，以下表可能缺少数据：

### 1. `neighbourhood_summary` 表
**用途**: 存储每个 neighbourhood 的汇总数据（价格、交易量、租期等）

**填充脚本**: `scripts/update-neighbourhood-summary.js`

**检查查询**:
```sql
-- 查看有多少 neighbourhoods 缺少 summary 数据
SELECT 
  COUNT(*) as missing_summary
FROM neighbourhoods n
LEFT JOIN neighbourhood_summary ns ON ns.neighbourhood_id = n.id
WHERE ns.neighbourhood_id IS NULL;
```

### 2. `neighbourhood_access` 表  
**用途**: 存储每个 neighbourhood 的交通访问数据（MRT 站点数、访问类型等）

**填充脚本**: 
- `scripts/update-neighbourhood-access.js`
- `scripts/update-neighbourhood-access-batch.js`

**检查查询**:
```sql
-- 查看有多少 neighbourhoods 缺少 access 数据
SELECT 
  COUNT(*) as missing_access
FROM neighbourhoods n
LEFT JOIN neighbourhood_access na ON na.neighbourhood_id = n.id
WHERE na.neighbourhood_id IS NULL;
```

## 快速诊断

运行 `check_missing_data.sql` 中的查询 9，会给你一个总览：

```sql
SELECT 
  (SELECT COUNT(*) FROM neighbourhoods) as total_neighbourhoods,
  (SELECT COUNT(DISTINCT neighbourhood_id) FROM neighbourhood_summary) as with_summary,
  (SELECT COUNT(DISTINCT neighbourhood_id) FROM neighbourhood_access) as with_access,
  (SELECT COUNT(DISTINCT n.id) 
   FROM neighbourhoods n
   INNER JOIN neighbourhood_summary ns ON ns.neighbourhood_id = n.id
   INNER JOIN neighbourhood_access na ON na.neighbourhood_id = n.id) as with_both,
  (SELECT COUNT(*) 
   FROM neighbourhoods n
   LEFT JOIN neighbourhood_summary ns ON ns.neighbourhood_id = n.id
   LEFT JOIN neighbourhood_access na ON na.neighbourhood_id = n.id
   WHERE ns.neighbourhood_id IS NULL AND na.neighbourhood_id IS NULL) as missing_both;
```

## 如果数据缺失，运行这些脚本

1. **填充 summary 数据**:
   ```bash
   node scripts/update-neighbourhood-summary.js
   ```

2. **填充 access 数据**:
   ```bash
   node scripts/update-neighbourhood-access-batch.js
   ```

## 数据来源

- `neighbourhood_summary`: 从 `agg_neighbourhood_monthly` 表聚合而来
- `neighbourhood_access`: 从 `mrt_stations` 和 `bus_stops` 表计算而来

如果这些源表也没有数据，需要先运行：
- `run-aggregation.js` 或 `run-aggregation-monthly.js` (生成 agg_neighbourhood_monthly)
- `populate-mrt-bus-stations.js` (填充 MRT 和公交站点数据)

