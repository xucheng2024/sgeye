# Next Steps After Helper Functions

## ✅ 已完成
- Helper functions created (`import_planning_area`, `import_subzone`, etc.)

## 📋 下一步：导入边界数据

### Step 1: 获取边界数据文件

你需要获取以下数据：

1. **Planning Areas GeoJSON/Shapefile**
   - 来源：data.gov.sg 或 URA
   - 预期：~55 个 planning areas
   - 格式：GeoJSON 或 Shapefile

2. **Subzones GeoJSON/Shapefile**
   - 来源：data.gov.sg 或 URA  
   - 预期：~300+ subzones
   - 格式：GeoJSON 或 Shapefile

### Step 2: 导入数据

#### 选项 A: 使用 Node.js 脚本（如果有 GeoJSON）

```bash
# 导入 Planning Areas
node scripts/import-planning-areas-subzones.js --file data/planning-areas.geojson

# 导入 Subzones
node scripts/import-planning-areas-subzones.js --file data/subzones.geojson
```

#### 选项 B: 使用 shp2pgsql（如果有 Shapefile）

```bash
# 导入 Planning Areas
shp2pgsql -I -s 4326 -g geom planning-areas.shp planning_areas_temp | \
  psql "your_supabase_connection_string"

# 导入 Subzones
shp2pgsql -I -s 4326 -g geom subzones.shp subzones_temp | \
  psql "your_supabase_connection_string"

# 然后转换到最终表（使用 helper functions）
```

#### 选项 C: 使用 Supabase SQL Editor（手动导入）

如果数据量不大，可以手动在 Supabase SQL Editor 中调用 helper functions：

```sql
-- 示例：导入一个 planning area
SELECT import_planning_area(
  'ANG_MO_KIO',
  'Ang Mo Kio',
  '{"type":"Polygon","coordinates":[[[103.8,1.36],[103.9,1.36],[103.9,1.38],[103.8,1.38],[103.8,1.36]]]}'::jsonb,
  '{"minLng":103.8,"maxLng":103.9,"minLat":1.36,"maxLat":1.38}'::jsonb
);
```

### Step 3: 验证数据导入

```sql
-- 检查 planning areas
SELECT COUNT(*) as planning_areas FROM planning_areas WHERE geom IS NOT NULL;

-- 检查 subzones  
SELECT COUNT(*) as subzones FROM subzones WHERE geom IS NOT NULL;
```

预期结果：
- Planning Areas: ~55
- Subzones: ~300+

### Step 4: 创建 Sealed Neighbourhoods

等 subzones 有数据后，执行：

```sql
-- 在 Supabase SQL Editor 中执行
\i supabase/migrations/create_sealed_neighbourhoods_from_subzones.sql
```

或者直接复制文件内容到 Supabase SQL Editor 执行。

### Step 5: 最终验证

```sql
SELECT 
  (SELECT COUNT(*) FROM planning_areas WHERE geom IS NOT NULL) as planning_areas,
  (SELECT COUNT(*) FROM subzones WHERE geom IS NOT NULL) as subzones,
  (SELECT COUNT(*) FROM neighbourhoods WHERE type = 'sealed' AND geom IS NOT NULL) as sealed_neighbourhoods;
```

## 🔍 数据源查找

如果还没有数据文件，可以：

1. **访问 data.gov.sg**
   - https://data.gov.sg/datasets
   - 搜索 "Planning Area" 或 "Master Plan"

2. **联系 URA**
   - https://www.ura.gov.sg/Corporate/Planning/Master-Plan
   - 可能需要申请获取官方数据

3. **使用 OneMap API**（如果提供边界数据）
   - https://www.onemap.gov.sg/docs/

## ⚠️ 重要提醒

**在导入边界数据之前，不要运行 geocoding 脚本！**

因为：
- Geocoding 的坐标需要归属到 neighbourhoods
- Neighbourhoods 需要从 subzones 创建
- Subzones 需要先有边界数据

正确的顺序：
1. ✅ Helper functions (已完成)
2. ⏳ 导入边界数据 (当前步骤)
3. ⏳ 创建 sealed neighbourhoods
4. ⏳ 运行 geocoding
5. ⏳ 分配 neighbourhood_id

