# AGENTS.md - 肾友日记 PWA 开发指南

## 项目概述

肾友日记是一款专为透析患者设计的渐进式Web应用（PWA），用于管理血液透析和腹膜透析记录。纯前端技术栈，数据存储在 LocalStorage，支持离线访问。

## 项目结构

```
demo/
├── index.html          # 主页面
├── manifest.json       # PWA 配置
├── sw.js              # Service Worker
├── server.py          # Python 本地服务器
├── start-server.bat   # Windows 启动脚本
├── css/style.css      # 样式文件
└── js/
    ├── constants.js           # 常量配置
    ├── data.js                # 数据层（CRUD）
    ├── app.js                # 主逻辑（页面导航、初始化）
    ├── components/
    │   ├── theme.js         # 主题管理
    │   ├── note-templates.js # 备注模板
    │   └── forms.js         # 表单处理
    ├── utils/
    │   ├── helpers.js        # 工具函数
    │   ├── validate.js      # 数据验证
    │   └── import-export.js # 导入导出
    └── pages/
        ├── home.js           # 首页
        ├── history.js       # 历史记录
        ├── stats.js         # 统计页
        └── settings.js      # 设置页
```

## 启动命令

```bash
# Python 服务器（推荐）
python server.py

# 简单 HTTP 服务器
python -m http.server 8080

# 本机: http://localhost:8080
# 手机: http://[电脑IP]:8080（需同一WiFi）
```

## 构建与测试

纯前端项目，无构建工具。

### 代码检查（手动）
1. **JavaScript 语法**：浏览器 DevTools Console 检查错误
2. **PWA 验证**：Chrome DevTools → Application → Service Workers
3. **响应式测试**：DevTools 设备模式

### 运行单个功能测试
```javascript
// Console 中测试数据存储
const testRecord = { id: Date.now(), type: 'hd', date: '2024-01-15', shift: 'morning' };
localStorage.setItem('dialysis_records', JSON.stringify([testRecord]));
location.reload();
```

## 代码风格指南

### JavaScript 规范

#### 命名约定
- 函数：camelCase，如 `getRecords()`, `addRecord()`, `showPage()`
- 常量：UPPER_SNAKE_CASE，如 `DATA_KEY`, `SETTINGS_KEY`
- 变量：camelCase，如 `recordsCache`, `editingRecordId`

#### 代码结构
1. 文件头部注释
2. 常量定义
3. 全局变量
4. 核心函数
5. 页面加载函数
6. 事件处理函数

#### 函数设计
- 每个函数只做一件事，控制在 50 行以内

#### 错误处理
- try-catch 包裹可能出错的代码
- 对用户输入进行校验

```javascript
function saveRecords(records) {
    try {
        localStorage.setItem(DATA_KEY, JSON.stringify(records));
        recordsCache = records;
    } catch (e) {
        console.error('保存失败:', e);
        alert('保存失败，请重试');
    }
}
```

### CSS 规范

#### 选择器命名
- 语义化命名，小写字母，连字符分隔
- 示例：`.record-item`, `.nav-item`

#### CSS 变量
```css
:root {
    --primary-color: #4A90D9;
    --primary-dark: #357ABD;
    --success-color: #28a745;
    --danger-color: #dc3545;
    --background-color: #f5f7fa;
    --text-primary: #333333;
}
```

#### 深色模式
```css
@media (prefers-color-scheme: dark) {
    :root {
        --background-color: #1a1a1a;
        --text-primary: #ffffff;
    }
}
```

### HTML 规范
- 语义化标签：`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
- 表单：`<form>`, `<label>`, `<input>`, `<select>`
- 用户可见文本用中文，内部变量用英文

## 数据结构

### 血液透析记录
```javascript
{
    id: Number,              // 记录ID（时间戳）
    type: 'hd',              // 记录类型标识
    date: '2024-01-15',      // 透析日期
    shift: 'morning',        // 班次类型
    shiftLabel: '早班',       // 班次展示标签
    startTime: '06:30',      // 开始时间
    endTime: '10:30',        // 结束时间
    bed: '3楼A区12床',        // 床位
    weightBefore: '65.5',    // 透前体重
    weightAfter: '63.0',     // 透后体重
    targetUF: '2500',       // 目标脱水量
    actualUF: '2400',       // 实际脱水量
    bpBefore: '140/90',     // 透前血压
    bpAfter: '130/80',      // 透后血压
    heating: [],            // 烤电项目
    heatingDuration: '30',  // 烤电时长
    reactions: [],          // 不良反应
    notes: '',              // 备注
    createdAt: '...',       // 创建时间
    updatedAt: '...'        // 更新时间
}
```

### 腹膜透析记录
```javascript
{
    id: Number,
    type: 'pd',
    date: '2024-01-15',
    concentration: '2.5%',
    inflow: '2000',
    outflow: '2100',
    dwellTime: '4小时',
    fluidAppearance: '清亮',
    weight: '65.5',
    bp: '130/80',
    reactions: [],
    notes: '',
    createdAt: '...',
    updatedAt: '...'
}
```

### 本地存储键名

| 键名 | 用途 |
|------|------|
| `dialysis_records` | 透析记录数据 |
| `dialysis_settings` | 应用设置 |

### Service Worker

- 缓存策略：Cache First
- 缓存版本：`dialysis-diary-v12`
- 缓存资源：`index.html`, `css/style.css`, `js/app.js`, `js/chart.min.js`, `manifest.json`, `icons/icon.svg`

## 代码审查清单

- [x] Console 无错误
- [x] 页面功能正常（新增/编辑/删除记录）
- [x] 数据持久化正常
- [x] 响应式布局正常
- [x] 深色模式正常（如有修改）
- [ ] PWA 离线功能正常

## 开发日记

### 2026年

#### Phase 7: 代码重构与优化

##### 重复保存逻辑修复
- 问题：`app.js` 中的 `saveHDRecord()` 和 `savePDRecord()` 与 `forms.js` 存在重复逻辑
- 解决方案：
  - `app.js` 中的保存函数改为委托给 `Forms.submitHD()` 和 `Forms.submitPD()`
  - 统一使用 `forms.js` 中带验证的保存逻辑

##### 公共函数提取
- 问题：`createRecordItem()` 和 `getShiftLabel()` 在 `home.js` 和 `history.js` 中重复定义
- 解决方案：
  - 将 `createRecordItem()` 提取到 `helpers.js`
  - 将 `getShiftLabel()` 提取到 `helpers.js`
  - 两个页面模块统一调用 `Helpers.createRecordItem()` 和 `Helpers.getShiftLabel()`

##### 常量配置同步
- 问题：`constants.js` 中的 `HEATING_OPTIONS` 与 HTML 表单实际选项不一致
- 解决方案：
  - 更新 `HEATING_OPTIONS` 为 `['红外线照射', '中频理疗', '低频理疗', '超短波治疗', '其他']`
  - 同步更新 `HD_REACTIONS` 和 `PD_REACTIONS`

##### 统一日期处理函数
- 问题：日期解析使用 `new Date(dateStr)` 可能导致时区问题
- 解决方案：
  - 在 `helpers.js` 添加 `parseDate()` 函数，使用本地时区解析
  - 更新 `home.js`、`history.js`、`stats.js` 使用 `Helpers.parseDate()`

##### 数值解析安全化
- 问题：`parseFloat()` 和 `parseInt()` 可能返回 NaN 导致计算错误
- 解决方案：
  - 添加 `safeParseFloat(value, defaultValue)` 函数
  - 添加 `safeParseInt(value, defaultValue)` 函数
  - 添加 `isValidNumber(value)` 函数
  - 更新 `stats.js` 中所有数值解析使用安全函数

##### 图表实例管理优化
- 问题：页面切换时图表实例未销毁，可能导致内存泄漏
- 解决方案：
  - 在 `stats.js` 添加 `destroyAllCharts()` 函数
  - 在 `app.js` 的 `showPage()` 中，离开统计页时调用销毁函数

#### Phase 6: Bug 修复与稳定性优化

##### 时区问题修复
- 修复日期解析使用 UTC 导致的时间偏差问题
- `forms.js`、`helpers.js` 中日期处理改用本地时区

##### 底部导航问题修复
- 增加底部导航 `z-index` 从 100 → 1000
- 增加内容区 `padding-bottom` 从 70px → 80px → 60px
- 添加防抖逻辑：页面切换时暂时禁用按钮 300ms

##### 顶部/底部栏高度优化
- 顶部内边距：12px → 8px
- 顶部标题：20px → 18px
- 底部导航按钮：56px → 44px

##### 记录页面显示优化
- 日期位置从居中改为右侧显示
- 记录信息改为两行布局
- 脱水显示：优先显示实际脱水量，为空时显示目标脱水量

##### 导入去重功能
- 根据"日期+类型"自动去重
- 导入时跳过重复记录并提示用户

##### 设置存储修复
- 修复 localStorage 存储 "undefined" 字符串导致解析错误
- `getSettings()` 增加严格检查和自动修复

##### 表单提交问题修复
- 移除隐藏的时间字段的 `required` 属性
- 创建独立的保存函数 `saveHDRecord()` 和 `savePDRecord()`
- 不依赖表单 submit 事件，避免验证问题

##### 数据缓存优化
- `getRecords()` 和 `getSettings()` 使用更健壮的缓存检查
- 修复潜在的 undefined 问题

##### 记录显示优化
- 班次标签为空时根据班次值自动转换显示
- 日历视图使用可靠的日期解析方法

##### 日历布局溢出修复
- 问题：小屏手机日历内容宽度超出容器，导致横向溢出
- 根本原因：CSS Grid 的 `gap` 属性不受 `box-sizing: border-box` 控制
- 解决方案：将日历布局从 CSS Grid 改为 Flexbox
  - `.calendar-weekdays` 和 `.calendar-days` 使用 `display: flex; flex-wrap: wrap;`
  - 每个单元格宽度精确为 `calc(100% / 7)` (14.2857%)
  - 移除 `gap` 属性，避免溢出问题

##### Service Worker 错误修复
- 问题：`fetchAndCache` 函数在网络请求失败时抛出 `TypeError: Failed to fetch`
- 解决方案：
  - 添加 `.catch()` 错误处理，记录警告而非抛出错误
  - 跳过非同源请求（如 CDN 资源）
  - 缓存操作失败时只记录警告，不中断流程
  - 缓存版本从 `v3` 升级到 `v4`

### 2024年

#### Phase 1: 代码模块化拆分
- 将单一 `app.js` (2045行) 拆分为 13 个模块文件
- 创建目录结构：`components/`, `utils/`, `pages/`
- 拆分模块：
  - `constants.js` - 常量配置
  - `data.js` - 数据层（CRUD）
  - `components/theme.js` - 主题管理
  - `components/note-templates.js` - 备注模板
  - `components/forms.js` - 表单处理
  - `utils/helpers.js` - 工具函数
  - `utils/validate.js` - 数据验证
  - `utils/import-export.js` - 导入导出
  - `pages/home.js` - 首页
  - `pages/history.js` - 历史记录
  - `pages/stats.js` - 统计页
  - `pages/settings.js` - 设置页
- 减少 `app.js` 至 600 行（减少 70%）

#### Phase 2: 移除提醒功能
- 删除提醒相关 JavaScript 代码
- 删除设置页提醒 UI
- 删除提醒相关 CSS 样式

#### Phase 3: 图表增强（Chart.js）
- 引入 Chart.js 4.4.1 图表库
- 新增图表：
  - 血压趋势图 - 收缩压/舒张压变化
  - 超滤率分析 - 脱水效率分析
- 优化现有图表样式
- 添加本月月报功能

#### Phase 4: 首页日历模式
- 新增日历视图/列表视图切换
- 月份导航（← → 切换）
- 日期点击交互：
  - 无记录 → 添加页面
  - 1条记录 → 编辑页面
  - 多条记录 → 列表页筛选当天
- 颜色标记：
  - 蓝色背景 = 血液透析
  - 绿色背景 = 腹膜透析
  - 渐变背景 = 两者都有

#### Phase 5: 老人友好界面优化
- 字体加大：16px → 18px（基础），20px → 24px（标题）
- 按钮加大：高度 44px → 56px，内边距加大
- 触摸区域加大：底部导航、输入框、日历格子
- 颜色对比度增强：文字颜色加深，边框加粗

### 待完成
- [x] 日历在小屏手机排版优化（已完成）
- [ ] Chart.js 本地化（CDN 访问不稳定时）

### 2026年3月

#### Bug 修复
- 修复 `clearAllData()` 误删用户模板配置问题
- 修复血压数据为空时图表崩溃问题
- 修复 Chart.js CDN 加载失败导致页面卡住问题
- 统一 Service Worker 缓存版本为 v12
- 延长 Chart.js 加载超时时间（1秒 → 5秒）
- 优化后台同步代码，添加 TODO 注释说明预留功能

##### 一行添加页面点击问题修复 (v1.6)
- 问题：进入"一行添加"页面后整个页面无法点击
- 根本原因：
  - `.oneline-date-wrapper` 等CSS样式被错误地放在 `@media (max-width: 375px)` 媒体查询内部
  - 在屏幕宽度大于375px时，`position: relative` 不生效
  - 日期输入框的 `position: absolute` 相对于高层级元素定位，覆盖整个视口
- 解决方案：
  - 将日期选择器相关样式移到媒体查询外部作为全局样式
  - 添加 `min-height: 40px` 确保日期输入框点击区域
  - 添加点击事件处理支持桌面浏览器兼容
