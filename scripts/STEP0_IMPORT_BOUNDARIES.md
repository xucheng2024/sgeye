# Step 0: Import URA Master Plan 2019 Boundaries

## 📍 数据源（唯一官方来源）

**data.gov.sg - URA Master Plan 2019**

### 需要下载的两个文件：

1. **Planning Area Boundary (No Sea)**
   - 搜索：`Master Plan 2019 Planning Area Boundary`
   - 格式：GeoJSON（推荐）或 Shapefile
   - ⚠️ **必须选 No Sea 版本**

2. **Subzone Boundary (No Sea)**
   - 搜索：`Master Plan 2019 Subzone Boundary`
   - 格式：GeoJSON（推荐）或 Shapefile
   - ⚠️ **必须选 No Sea 版本**

## 📋 字段映射

### Planning Areas
| GeoJSON 字段 | 表字段 | 说明 |
|------------|--------|------|
| `PLN_AREA_N` | `name` | Planning Area 名字 |
| `geometry` | `geom` | Polygon (PostGIS GEOGRAPHY) |
| - | `id` | 自动生成（name 转小写+连字符） |
| - | `bbox` | 自动计算边界框 |

### Subzones
| GeoJSON 字段 | 表字段 | 说明 |
|------------|--------|------|
| `SUBZONE_N` | `name` | Subzone 名字 |
| `PLN_AREA_N` | `planning_area_id` | 所属 Planning Area（转 ID） |
| `geometry` | `geom` | Polygon (PostGIS GEOGRAPHY) |
| - | `id` | 自动生成（name 转小写+连字符） |
| - | `bbox` | 自动计算边界框 |

## 🚀 执行步骤

### Step 0.1: 下载数据

1. 访问 https://data.gov.sg/datasets
2. 搜索并下载：
   - `Master Plan 2019 Planning Area Boundary (No Sea)` → 保存为 `data/planning-areas.geojson`
   - `Master Plan 2019 Subzone Boundary (No Sea)` → 保存为 `data/subzones.geojson`

### Step 0.2: 导入 Planning Areas

```bash
node scripts/import-planning-areas-subzones.js --file data/planning-areas.geojson
```

预期输出：
- 导入 ~55 个 planning areas
- 每个都有 `geom` (polygon)

### Step 0.3: 导入 Subzones

```bash
node scripts/import-planning-areas-subzones.js --file data/subzones.geojson
```

预期输出：
- 导入 ~300+ subzones
- 每个都有 `geom` (polygon) 和 `planning_area_id`

### Step 0.4: 创建 Sealed Neighbourhoods

```bash
node scripts/import-planning-areas-subzones.js --create-neighbourhoods
```

或者在 Supabase SQL Editor 中执行：

```sql
\i supabase/migrations/create_sealed_neighbourhoods_from_subzones.sql
```

这一步会：
- 从每个 subzone 创建一个 sealed neighbourhood
- `neighbourhood.geom = subzone.geom`
- `neighbourhood.type = 'sealed'`

### Step 0.5: 验证

```bash
node scripts/check-boundaries-status.js
```

预期结果：
- Planning Areas: ~55
- Subzones: ~300+
- Sealed Neighbourhoods: ~300+ (应该等于 subzones 数量)

## ✅ 完成标志

当看到：
```
✅ All boundaries ready!
Next step: Run geocoding script
```

就可以进行下一步：运行 geocoding 脚本获取坐标。

## ⚠️ 重要提醒

1. **必须用 No Sea 版本** - 否则 polygon 包含海域，`ST_Contains` 会出错
2. **只认 URA Master Plan 2019** - 不要用其他数据源
3. **不要用 HDB Town boundary** - 不稳定，已废弃
4. **sealed = subzone** - 这是地理底板，split 逻辑后续再做

## 🔗 快速链接

- data.gov.sg: https://data.gov.sg/datasets
- 搜索关键词: `Master Plan 2019 Planning Area Boundary`
- 搜索关键词: `Master Plan 2019 Subzone Boundary`

