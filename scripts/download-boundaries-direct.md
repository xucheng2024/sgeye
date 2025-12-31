# 手动下载指引

由于 data.gov.sg 的下载链接需要认证，请手动下载：

## 下载链接

1. **Planning Areas**:
   - 访问: https://data.gov.sg/dataset/master-plan-2019-planning-area-boundary-no-sea
   - 点击 "Download GEOJSON" 按钮
   - 保存为 `data/planning-areas.geojson`

2. **Subzones**:
   - 访问: https://data.gov.sg/dataset/master-plan-2019-subzone-boundary-no-sea
   - 点击 "Download GEOJSON" 按钮
   - 保存为 `data/subzones.geojson`

## 下载后运行导入

```bash
# 导入 Planning Areas
node scripts/import-planning-areas-subzones.js --file data/planning-areas.geojson

# 导入 Subzones
node scripts/import-planning-areas-subzones.js --file data/subzones.geojson

# 创建 Sealed Neighbourhoods
node scripts/import-planning-areas-subzones.js --create-neighbourhoods
```

