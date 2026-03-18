# dialysis_log

# 肾友日记 - 透析健康管理 PWA 应用

## 项目简介

肾友日记是一款专为透析患者设计的渐进式Web应用（PWA），聚焦于透析患者的健康数据管理，支持血液透析和腹膜透析两类核心场景的数据记录。通过轻量化、本地化的方式，帮助患者便捷记录、管理、分析透析相关健康数据，提升透析健康管理效率和体验。应用采用本地数据存储模式，保障用户隐私安全，同时提供类原生App的使用体验，支持离线访问、跨平台使用。

## 功能特性

### 📊 核心功能

#### 透析记录管理
- **血液透析记录**
  - 基础字段：日期、班次（早/中/晚/自定义）、床位、透前/透后体重、目标/实际脱水量、透前/透后血压
  - 扩展字段：烤电项目、烤电时长、不良反应、备注信息
  - 班次联动：选择预设班次自动填充对应时间（早班06:30-10:30、中班11:30-15:30、晚班16:30-20:30），自定义班次支持手动输入时间
  - 操作支持：新增、编辑（记录更新时间）、删除（二次确认）

- **腹膜透析记录**
  - 核心字段：日期、透析液浓度、灌入量、排出量、留腹时间、透析液性状、体重、血压
  - 扩展字段：不良反应、备注信息
  - 操作支持：新增、编辑（记录更新时间）、删除（二次确认）

#### 数据统计与分析
- 透析次数统计：本周/本月血液透析、腹膜透析次数分别统计，展示总数及占比
- 体重趋势分析：折线图展示近30天透前/透后体重（血液透析）、日常体重（腹膜透析）变化趋势
- 脱水量分析：计算近30天平均脱水量，展示实际脱水量与目标脱水量的差值趋势
- 透析频率分析：展示近30天每日透析记录次数，标注高频/低频透析日期

#### 历史记录管理
- 多维度筛选：按透析类型（血液/腹膜）、年份、月份筛选记录
- 记录展示：列表形式展示筛选结果，点击查看完整字段信息
- 排序功能：默认按日期倒序排列，支持切换正序排列

#### 数据导入导出
- 数据导出：支持CSV/JSON格式导出，文件命名包含"肾友日记_导出时间"
- 数据导入：支持CSV/JSON格式导入，自动校验格式、按ID去重
- 错误提示：导入失败时明确提示错误位置及原因

#### 基础设置
- 深色模式：自动跟随系统设置，支持手动切换浅色/深色/自动三种模式
- 数据清理：一键清空所有记录（二次确认）
- 个性化配置：支持自定义常用备注模板（最多10个）、默认班次

#### 透析提醒功能
- 日程提醒：设置每周透析日期（周一至周日多选）
- 自定义时间：设置提醒时间，支持提前30分钟/1小时/2小时提醒
- 系统通知：通过浏览器 Notification API 发送本地通知
- 测试功能：提供测试通知按钮，验证提醒功能是否正常

### 📱 PWA 特性
- 添加到主屏幕：支持Chrome/Edge/Firefox/Safari等主流浏览器，显示自定义图标
- 离线访问：已缓存页面和历史记录无网络可查看，离线可新增/编辑记录（联网后同步）
- 缓存管理：核心资源本地缓存，版本更新自动清理旧缓存
- 后台同步：支持 Background Sync API，离线操作联网后自动同步
- 推送通知：支持配置透析提醒时间，到时自动推送通知

## 技术栈

| 技术 | 说明 |
|------|------|
| HTML5 | 页面结构，适配320px-1920px全分辨率 |
| CSS3 | 样式设计，支持深色模式，适配触屏操作（最小点击区域44×44px） |
| JavaScript (ES6+) | 应用逻辑，保障核心操作响应≤500ms |
| LocalStorage | 本地数据存储，无服务端传输 |
| Service Worker | 离线缓存、后台同步 |
| Web App Manifest | PWA 配置，实现类原生体验 |

## 项目结构

```
demo/
├── index.html          # 主页面（首页）
├── manifest.json       # PWA 配置文件
├── sw.js              # Service Worker 离线缓存
├── server.py          # Python 本地服务器
├── start-server.bat   # Windows 启动脚本
├── PWA-INSTALL.md     # PWA 安装说明
├── README.md          # 开发文档
├── AGENTS.md          # AI 开发指南
├── css/
│   └── style.css      # 样式文件（含CSS变量、深色模式）
├── js/
│   ├── app.js         # 应用主逻辑（页面导航、初始化）
│   ├── constants.js   # 常量配置（班次、透析方式等）
│   ├── data.js        # 数据层（CRUD操作）
│   ├── chart.min.js   # Chart.js 图表库（本地化）
│   ├── components/
│   │   ├── theme.js         # 主题管理
│   │   ├── note-templates.js # 备注模板
│   │   └── forms.js         # 表单处理、验证
│   ├── utils/
│   │   ├── helpers.js       # 工具函数（日期解析、数值验证等）
│   │   ├── validate.js      # 数据验证
│   │   └── import-export.js # 导入导出
│   └── pages/
│       ├── home.js          # 首页（日历/列表视图）
│       ├── history.js       # 历史记录
│       ├── stats.js         # 统计页（Chart.js图表）
│       └── settings.js      # 设置页
└── icons/
    ├── icon.svg       # SVG 图标源文件
    ├── generate-icons.py  # 图标生成脚本
    └── README.md      # 图标生成说明
```

## 快速开始

### 环境要求
- Python 3.x 或 Node.js（用于启动本地服务器）
- 现代浏览器（推荐 Chrome 60+、Edge 79+、Firefox 55+、Safari 11.1+）

### 启动方式
#### 方式一：Python 服务器（推荐）
```bash
# 进入 demo 目录
cd demo

# 运行服务器脚本
python server.py

# 或使用简单命令
python -m http.server 8080
```

#### 方式二：Node.js 服务器
```bash
# 安装 serve
npm install -g serve

# 启动服务
serve -p 8080
```

#### 方式三：Windows 批处理脚本
双击运行 `start-server.bat` 文件

### 访问应用
- 本机访问：`http://localhost:8080`
- 手机访问：`http://[电脑IP]:8080`（需连接同一WiFi）

## 核心模块说明

### 1. 数据管理模块 ([`js/data.js`](js/data.js))
```javascript
// 数据存储键名
const DATA_KEY = 'dialysis_records';
const SETTINGS_KEY = 'dialysis_settings';

// 主要数据操作函数（通过 Data 命名空间访问）
Data.getRecords()           // 获取所有记录（带缓存）
Data.addRecord(record)      // 添加新记录（自动生成ID、创建时间）
Data.updateRecord(id, data) // 更新记录（更新updatedAt字段）
Data.deleteRecord(id)       // 删除记录
Data.getSettings()          // 获取设置（含深色模式、自定义配置）
Data.saveSettings(settings) // 保存设置
Data.clearAllRecords()      // 清空所有记录
```

### 2. 页面导航模块 ([`js/app.js`](js/app.js))
```javascript
function showPage(pageId)       // 切换页面（首页/记录页/历史页/统计页/设置页）
function loadHomePage()         // 加载首页（概览、快速新增入口）
function loadHistoryPage()      // 加载历史记录页（筛选、列表展示）
function loadStatsPage()        // 加载统计页（图表、数据指标）
function loadSettingsPage()     // 加载设置页（深色模式、数据清理）
```

### 3. 表单处理模块 ([`js/components/forms.js`](js/components/forms.js))
```javascript
// 班次配置（在 constants.js 中定义）
const SHIFT_TIMES = {
    morning: { start: '06:30', end: '10:30', label: '早班' },
    midday: { start: '11:30', end: '15:30', label: '中班' },
    evening: { start: '16:30', end: '20:30', label: '晚班' }
};

Forms.submitHD()               // 提交血液透析表单（含验证）
Forms.submitPD()               // 提交腹膜透析表单（含验证）
function onShiftChange()       // 班次选择联动时间展示
function initForms()           // 初始化血液/腹膜透析表单
function editRecord(id)        // 编辑记录（回显表单数据）
```

### 4. 工具函数模块 ([`js/utils/helpers.js`](js/utils/helpers.js))
```javascript
// 日期处理
Helpers.parseDate(dateStr)     // 安全解析日期（避免时区问题）
Helpers.getTodayStr()          // 获取今天日期字符串
Helpers.formatDate(dateStr)    // 格式化日期显示

// 数值处理
Helpers.safeParseFloat(value, defaultValue)  // 安全解析浮点数
Helpers.safeParseInt(value, defaultValue)    // 安全解析整数
Helpers.isValidNumber(value)                 // 检查是否为有效数值

// 其他工具
Helpers.escapeHtml(text)       // HTML转义（防XSS）
Helpers.getShiftLabel(shift)   // 获取班次标签
Helpers.createRecordItem(record, options)  // 创建记录项HTML
```

### 5. 数据导入导出模块 ([`js/app.js`](js/app.js))
```javascript
function exportData()           // 导出数据（CSV格式），自动命名文件
function importData(input)      // 导入数据，自动识别格式
function importFromJSON(content) // 解析JSON，校验字段完整性
function importFromCSV(content)  // 解析CSV，映射字段关系
```

### 6. Service Worker 模块 ([`sw.js`](sw.js))
```javascript
// 缓存策略
const CACHE_NAME = 'dialysis-diary-v4';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './js/chart.min.js',
    './manifest.json',
    './icons/icon.svg'
];

// 主要事件处理
self.addEventListener('install')   // 安装事件 - 缓存核心资源
self.addEventListener('activate')  // 激活事件 - 清理旧缓存
self.addEventListener('fetch')     // 请求拦截 - 缓存优先策略
self.addEventListener('sync')      // 后台同步（离线操作同步）
```

### 7. 统计图表模块 ([`js/pages/stats.js`](js/pages/stats.js))
```javascript
StatsPage.load()               // 加载统计页
StatsPage.renderWeightChart()  // 体重趋势图
StatsPage.renderUFChart()      // 脱水量趋势图
StatsPage.renderBPChart()      // 血压趋势图
StatsPage.renderUFRChart()     // 超滤率分析图
StatsPage.destroyAllCharts()   // 销毁所有图表实例
```

## 数据结构

### 血液透析记录
```javascript
{
    id: Number,              // 记录ID（时间戳）
    type: 'hd',              // 记录类型标识
    date: '2024-01-15',      // 透析日期（YYYY-MM-DD）
    shift: 'morning',        // 班次类型（morning/midday/evening/custom）
    shiftLabel: '早班',       // 班次展示标签
    startTime: '06:30',      // 透析开始时间（HH:MM）
    endTime: '10:30',        // 透析结束时间（HH:MM）
    bed: '3楼A区12床',        // 床位信息
    weightBefore: '65.5',    // 透前体重(kg)
    weightAfter: '63.0',     // 透后体重(kg)
    targetUF: '2500',        // 目标脱水量(ml)
    actualUF: '2400',        // 实际脱水量(ml)
    bpBefore: '140/90',      // 透前血压（收缩压/舒张压）
    bpAfter: '130/80',       // 透后血压（收缩压/舒张压）
    heating: ['红外线照射'],  // 烤电项目列表
    heatingDuration: '30',   // 烤电时长(分钟)
    reactions: ['低血压'],    // 不良反应列表
    notes: '备注内容',        // 备注内容
    createdAt: '2024-01-15T10:00:00.000Z',    // 创建时间（ISO格式）
    updatedAt: '2024-01-15T10:00:00.000Z'     // 更新时间（ISO格式）
}
```

### 腹膜透析记录
```javascript
{
    id: Number,              // 记录ID（时间戳）
    type: 'pd',              // 记录类型标识
    date: '2024-01-15',      // 透析日期（YYYY-MM-DD）
    concentration: '2.5%',   // 透析液浓度
    inflow: '2000',          // 灌入量(ml)
    outflow: '2100',         // 排出量(ml)
    dwellTime: '4小时',      // 留腹时间
    fluidAppearance: '清亮', // 透析液性状
    weight: '65.5',          // 体重(kg)
    bp: '130/80',            // 血压（收缩压/舒张压）
    reactions: ['腹痛'],      // 不良反应列表
    notes: '备注内容',        // 备注内容
    createdAt: '2024-01-15T10:00:00.000Z',    // 创建时间（ISO格式）
    updatedAt: '2024-01-15T10:00:00.000Z'     // 更新时间（ISO格式）
}
```

## PWA 配置说明

### Manifest 配置 ([`manifest.json`](manifest.json))
```json
{
    "name": "肾友日记 - 透析健康管理",
    "short_name": "肾友日记",
    "display": "standalone",
    "theme_color": "#4A90D9",
    "background_color": "#f5f7fa",
    "orientation": "portrait-primary",
    "icons": [
        {
            "src": "icons/icon-72x72.png",
            "sizes": "72x72",
            "type": "image/png"
        },
        {
            "src": "icons/icon-96x96.png",
            "sizes": "96x96",
            "type": "image/png"
        },
        {
            "src": "icons/icon-128x128.png",
            "sizes": "128x128",
            "type": "image/png"
        },
        {
            "src": "icons/icon-144x144.png",
            "sizes": "144x144",
            "type": "image/png"
        },
        {
            "src": "icons/icon-152x152.png",
            "sizes": "152x152",
            "type": "image/png"
        },
        {
            "src": "icons/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "icons/icon-384x384.png",
            "sizes": "384x384",
            "type": "image/png"
        },
        {
            "src": "icons/icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
}
```

### 图标要求
PWA 需要以下尺寸的图标（生成方法参考 [`icons/README.md`](icons/README.md)）：

| 尺寸 | 用途 |
|------|------|
| 72x72 | Android Chrome |
| 96x96 | Android Chrome |
| 128x128 | Android Chrome |
| 144x144 | Android Chrome |
| 152x152 | iOS Safari |
| 192x192 | Android Chrome |
| 384x384 | Android Chrome |
| 512x512 | Android Chrome |

## 样式设计

### CSS 变量
```css
:root {
    --primary-color: #4A90D9;      /* 主题色 */
    --primary-dark: #357ABD;       /* 深色主题 */
    --secondary-color: #6c757d;    /* 次要颜色 */
    --success-color: #28a745;      /* 成功色 */
    --danger-color: #dc3545;       /* 危险色 */
    --background-color: #f5f7fa;   /* 背景色 */
    --card-background: #ffffff;    /* 卡片背景 */
    --text-primary: #333333;       /* 主文本色 */
    --text-secondary: #666666;     /* 次要文本色 */
    --border-color: #e0e0e0;       /* 边框色 */
    --touch-size: 44px;            /* 触屏最小点击尺寸 */
}
```

### 深色模式
应用自动适配系统深色模式设置，也支持手动切换：
```css
@media (prefers-color-scheme: dark) {
    :root {
        --background-color: #1a1a2e;
        --card-background: #16213e;
        --text-primary: #eaeaea;
        --text-secondary: #bbbbbb;
        --border-color: #2d3748;
    }
}

/* 手动深色模式切换 */
.dark-mode {
    --background-color: #1a1a2e;
    --card-background: #16213e;
    --text-primary: #eaeaea;
    --text-secondary: #bbbbbb;
    --border-color: #2d3748;
}
```

## 浏览器兼容性

| 设备/浏览器 | 版本要求 | 核心适配点 |
|--------|----------|------------|
| 桌面浏览器 | Chrome 60+、Firefox 55+、Safari 11.1+、Edge 79+ | 页面布局、PWA特性、数据操作 |
| 移动端浏览器 | Chrome 60+、Safari 11.1+、微信/支付宝内置浏览器 | 触屏操作、响应式布局、离线访问 |
| 设备分辨率 | 320px（手机）至1920px（桌面） | 流式布局、弹性组件、适配断点 |

## 开发指南

### 性能优化要求
- 页面加载时间：核心页面（首页、记录页）加载时间≤2秒
- 数据操作响应：新增/编辑/删除记录操作响应时间≤500ms
- 离线操作：离线状态下所有本地数据操作无卡顿、无异常

### 添加新的透析字段
1. 在 [`index.html`](index.html) 中添加表单字段（保证触屏点击尺寸≥44×44px）
2. 在 [`js/app.js`](js/app.js) 中更新数据结构和表单校验逻辑
3. 更新 [`createRecordItem()`](js/app.js:144) 函数以显示新字段
4. 更新 [`exportData()`](js/app.js:731) 和 [`importFromCSV()`](js/app.js:851) 函数，保证导入导出兼容性
5. 验证新增字段在离线状态下可正常录入和存储

### 修改班次配置
在 [`js/app.js`](js/app.js:518) 中修改 `SHIFT_TIMES` 对象：
```javascript
const SHIFT_TIMES = {
    morning: { start: '06:30', end: '10:30', label: '早班' },
    midday: { start: '11:30', end: '15:30', label: '中班' },
    evening: { start: '16:30', end: '20:30', label: '晚班' },
    custom: { start: '', end: '', label: '自定义' } // 新增自定义班次
};
```

### 更新缓存版本
修改 [`sw.js`](sw.js:6) 中的缓存名称，确保缓存更新策略：
```javascript
const CACHE_NAME = 'dialysis-diary-v4'; // 当前版本 v4
```
版本更新时修改版本号，Service Worker 会在激活时自动清理旧缓存。

### 核心流程验证
开发完成后需验证核心流程完整性：
1. 新增记录（血液/腹膜）→ 查看历史记录 → 编辑/删除记录
2. 查看统计数据 → 导出数据 → 清空记录 → 导入数据
3. 离线状态下新增记录 → 联网后验证数据同步
4. 切换深色模式 → 验证样式适配

## 部署说明

### GitHub Pages
1. 将 demo 目录推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 访问 `https://[用户名].github.io/[仓库名]`
4. 验证PWA特性：添加到主屏幕、离线访问功能

### 其他静态托管
支持部署到任何静态文件托管服务：
- Vercel
- Netlify
- 阿里云 OSS
- 腾讯云 COS

部署后需验证：
- 所有页面加载时间≤2秒
- PWA配置正常（manifest.json、sw.js 可访问）
- 离线访问功能可用

## 安全与隐私
- 数据存储：所有用户数据仅存储在浏览器 LocalStorage 中，无服务器端传输
- 数据备份：导出数据为通用CSV/JSON格式，无加密，保障备份数据可读取
- 操作安全：删除、清空数据等高危操作需二次确认，防止误操作
- 隐私保护：无用户信息采集，所有操作均在本地完成

## 验收标准
### 功能验收
- 高优先级需求100%实现，中优先级需求≥90%实现，低优先级需求≥70%实现
- 核心流程（新增→统计→导出→导入）全链路无异常
- PWA特性验证：添加到主屏幕、离线访问、缓存更新功能正常

### 体验验收
- 无UI布局错乱，适配主流设备分辨率
- 操作无卡顿，无重复点击触发多次操作的问题
- 错误提示清晰，用户可根据提示解决80%以上操作问题

### 性能验收
- 页面加载、数据操作响应时间符合性能需求
- 连续100次新增/编辑/删除记录无崩溃
- 离线状态下使用30分钟无异常

## 常见问题

### Q: 数据会丢失吗？
数据存储在浏览器 LocalStorage 中，除非清除浏览器数据，否则不会丢失。建议定期使用"导出数据"功能备份，避免因浏览器清理数据导致丢失。

### Q: 如何在不同设备间同步数据？
目前不支持自动同步，可使用"导出数据"将记录导出为CSV/JSON文件，在另一设备通过"导入数据"功能手动迁移。

### Q: 为什么无法安装 PWA？
1. 确保使用支持的浏览器版本（Chrome 60+、Edge 79+、Firefox 55+、Safari 11.1+）
2. 确保通过 HTTP/HTTPS 协议访问（不是 file:// 本地文件）
3. 检查manifest.json配置是否完整，图标资源是否可访问
4. 可手动从浏览器菜单选择"添加到主屏幕"
详细安装说明请参考 [`PWA-INSTALL.md`](PWA-INSTALL.md)

### Q: 离线状态下新增的记录会同步吗？
离线状态下新增/编辑的记录会暂存于LocalStorage，联网后Service Worker会自动同步（需浏览器支持后台同步功能），无需手动操作。

### Q: 导入数据时提示格式错误怎么办？
1. 检查导出文件是否为未修改的CSV/JSON格式
2. 验证字段完整性（如血液透析记录需包含date、type等核心字段）
3. 确认日期格式为YYYY-MM-DD，时间格式为HH:MM
4. 检查数值字段（体重、脱水量等）是否为合法格式

## 更新日志

### v2.2.0
- **代码重构优化**：
  - 修复重复保存逻辑，统一使用 `Forms.submitHD/PD()`
  - 提取公共函数 `createRecordItem()` 和 `getShiftLabel()` 到 `helpers.js`
  - 同步 `constants.js` 中 `HEATING_OPTIONS` 与 HTML 实际选项
- **日期处理优化**：统一 `parseDate()` 函数，避免时区问题
- **数值安全化**：添加 `safeParseFloat()`、`safeParseInt()`、`isValidNumber()` 函数
- **图表管理优化**：添加 `destroyAllCharts()` 函数，页面切换时销毁图表实例

### v2.1.0
- **日历布局修复**：解决小屏手机日历溢出问题，从 CSS Grid 改为 Flexbox 布局
- **Service Worker 优化**：修复 `fetchAndCache` 网络错误处理，跳过非同源请求
- **缓存版本升级**：从 v3 升级到 v4，确保缓存正确更新

### v2.0.0
- **深色模式增强**：新增手动切换按钮，支持自动/浅色/深色三种模式
- **历史排序功能**：支持按日期正序/倒序切换，默认最新优先
- **图表连线功能**：体重趋势图和脱水量趋势图添加 SVG 连线，数据变化更直观
- **透析频率分析**：新增最近4周透析频率柱状图，区分血液透析和腹膜透析
- **备注模板功能**：支持自定义常用备注模板（最多10个），表单中一键插入
- **后台同步优化**：完善网络状态检测，离线/在线状态提示，支持 Background Sync API
- **透析提醒功能**：支持设置每周透析日提醒，自定义提醒时间和提前量
- **缓存版本更新**：Service Worker 缓存版本升级为 v2

### v1.0.0
- 实现血液透析/腹膜透析记录的新增、编辑、删除功能
- 完成数据统计（次数、体重趋势、脱水量、透析频率）
- 支持数据导入导出（CSV/JSON），含格式校验和错误提示
- 实现PWA核心特性：添加到主屏幕、离线访问、缓存管理
- 支持深色模式自动/手动切换
- 实现数据清理功能（二次确认）

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue 或 Pull Request。


Hemodialysis log
 b866fff6f265b1fd367c8912c4896119132def4f
