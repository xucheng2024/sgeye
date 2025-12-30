# 数据准确性说明

## 当前示例数据状态

### ✅ 真实的部分
- **学校名称**：所有学校名称都是真实的新加坡小学名称
- **部分地址**：部分地址是真实的，但很多是估算的

### ⚠️ 不准确的部分
- **地址**：很多地址是估算的，可能不准确
- **邮编**：部分邮编可能不准确
- **坐标**：大部分坐标是估算值（如 1.3000, 103.8500），不是真实位置

## 如何获取真实数据

### 方法 1：使用 OneMap API 自动获取坐标（推荐）

我已经创建了一个脚本，可以从 OneMap API 自动获取真实坐标：

```bash
# 读取现有 CSV，自动获取真实坐标
node scripts/geocode-schools.js data/schools-sample.csv > data/schools-geocoded.csv

# 然后导入真实坐标的数据
node scripts/import-school-data.js --file data/schools-geocoded.csv
```

**注意**：
- OneMap API 有速率限制，处理 101 所学校可能需要几分钟
- 如果地址不准确，可能无法找到坐标
- 脚本会显示进度和结果

### 方法 2：从 MOE School Finder 手动收集

1. 访问 [MOE School Finder](https://www.moe.gov.sg/schoolfinder)
2. 筛选 Primary Schools
3. 逐个查看学校详情，收集：
   - 准确的学校名称
   - 完整地址
   - 邮编
   - 区域信息
4. 整理成 CSV 格式

### 方法 3：使用导入脚本的自动地理编码功能

导入脚本本身也有自动地理编码功能：

```bash
# 导入时自动获取缺失的坐标
node scripts/import-school-data.js --file data/schools-sample.csv
```

脚本会自动：
- 检查哪些学校缺少坐标
- 使用 OneMap API 获取坐标
- 更新 planning_area 和 postal_code（如果找到）

## 数据质量建议

### 对于测试/开发
- 当前示例数据足够测试功能
- 学校名称真实，可以验证基本功能

### 对于生产环境
- **必须**使用真实坐标
- 建议从 MOE School Finder 或 OneMap API 获取准确数据
- 定期更新学校信息（新学校、地址变更等）

## 验证数据准确性

导入后，可以在 Supabase Dashboard 检查：
1. 查看 `primary_schools` 表
2. 检查坐标是否合理（新加坡范围：lat 1.2-1.5, lng 103.6-104.0）
3. 检查 planning_area 和 town 是否匹配

## 下一步

1. **快速测试**：直接使用当前示例数据导入
2. **获取真实坐标**：运行 `geocode-schools.js` 脚本
3. **生产使用**：从 MOE School Finder 收集完整准确数据

