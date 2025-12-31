# SQL Migration Execution Order

## ✅ 可以现在就执行的 SQL

### 1. `create_import_helper_functions.sql`
**可以立即执行** - 只创建函数，不依赖数据

```sql
-- 在 Supabase SQL Editor 中执行
\i supabase/migrations/create_import_helper_functions.sql
```

这个文件创建了导入 GeoJSON 的辅助函数，导入边界数据时会用到。

## ⏳ 需要先有数据才能执行的 SQL

### 2. `create_sealed_neighbourhoods_from_subzones.sql`
**需要先导入 subzones 数据** - 这个 SQL 会从 subzones 表读取数据

执行顺序：
1. ✅ 先导入 planning areas 边界数据
2. ✅ 再导入 subzones 边界数据  
3. ✅ 然后执行这个 SQL 创建 sealed neighbourhoods

```sql
-- 等 subzones 有数据后再执行
\i supabase/migrations/create_sealed_neighbourhoods_from_subzones.sql
```

## 📋 完整执行顺序

### Step 1: 执行辅助函数（现在就可以做）
```sql
-- 执行这个
\i supabase/migrations/create_import_helper_functions.sql
```

### Step 2: 导入边界数据（需要先获取数据文件）
```bash
# 需要先下载 planning-areas.geojson 和 subzones.geojson
# 然后运行导入脚本
node scripts/import-planning-areas-subzones.js --file data/planning-areas.geojson
node scripts/import-planning-areas-subzones.js --file data/subzones.geojson
```

### Step 3: 创建 sealed neighbourhoods（等 Step 2 完成）
```sql
-- 等 subzones 有数据后执行
\i supabase/migrations/create_sealed_neighbourhoods_from_subzones.sql
```

## 🔍 验证步骤

执行后检查：

```sql
-- 检查函数是否创建成功
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE 'import_%';

-- 检查表是否有数据（等导入后）
SELECT COUNT(*) FROM planning_areas WHERE geom IS NOT NULL;
SELECT COUNT(*) FROM subzones WHERE geom IS NOT NULL;
SELECT COUNT(*) FROM neighbourhoods WHERE type = 'sealed';
```

