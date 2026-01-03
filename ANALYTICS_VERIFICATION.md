# Analytics 验证清单

## 运行时验证步骤

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 打开浏览器并访问网站
访问 http://localhost:3000

### 3. 打开浏览器开发者工具
- Mac: `Cmd + Option + I`
- Windows/Linux: `F12`

### 4. 检查 Console（控制台）
- 应该 **没有** 与 analytics 相关的错误
- 如果看到错误，检查环境变量是否正确设置

### 5. 检查 Network（网络）标签
刷新页面后，在 Network 标签中查找：

**GA4 验证：**
- 应该看到对 `google-analytics.com` 或 `googletagmanager.com` 的请求
- 请求 URL 包含你的 GA4 Measurement ID

**Clarity 验证：**
- 应该看到对 `clarity.ms` 的请求
- 请求 URL 类似：`https://www.clarity.ms/tag/uvloa9ubwz`

### 6. 检查页面源代码
- 右键点击页面 → "查看页面源代码"
- 搜索 "gtag" 应该能找到 GA4 相关代码
- 搜索 "clarity" 应该能找到 Clarity 相关代码

### 7. 测试事件追踪
1. 点击首页的 "Start with my budget" 按钮
2. 在 Console 中运行：`window.dataLayer` 应该能看到事件数据
3. 访问 `/hdb/affordability` 页面，应该触发 `view_affordability` 事件
4. 访问 `/neighbourhoods` 页面，应该触发 `view_explore` 事件

### 8. 在 GA4 控制台验证
1. 访问 [Google Analytics](https://analytics.google.com/)
2. 进入你的媒体资源
3. 点击左侧 "实时"（Realtime）报告
4. 访问网站，应该能看到实时访客数据（可能需要等待 1-2 分钟）

### 9. 在 Clarity 控制台验证
1. 访问 [Microsoft Clarity](https://clarity.microsoft.com/)
2. 进入你的项目
3. 访问网站并进行一些交互（点击、滚动等）
4. 等待几分钟后，在 Clarity 控制台应该能看到录制和会话数据

## 常见问题排查

### 环境变量未生效
- 确保 `.env.local` 文件在项目根目录
- 确保变量名正确（`NEXT_PUBLIC_` 前缀必须存在）
- **重启开发服务器**（环境变量只在启动时加载）

### 看不到数据
- GA4 实时数据可能有 1-2 分钟延迟
- Clarity 数据可能需要 5-10 分钟才能显示
- 检查浏览器是否阻止了第三方脚本（广告拦截器可能会阻止）

### 构建错误
如果生产环境构建失败：
- 确保在 Vercel 或其他部署平台的 Environment Variables 中也添加了这些变量
- 变量名必须完全匹配（包括 `NEXT_PUBLIC_` 前缀）

