# 肾友日记 PWA 安装说明

## 什么是PWA？

PWA（渐进式Web应用）是一种可以直接在手机上安装的Web应用，具有以下优势：
- 📱 像原生App一样安装到主屏幕
- 🚀 支持离线使用
- 💾 数据本地存储，隐私安全
- 🔄 无需应用商店，直接更新

## 安装方式

### 方式一：通过本地服务器（推荐）

由于PWA需要通过HTTP协议访问，您需要先启动一个本地服务器。

#### 使用Python启动服务器

1. 确保已安装Python（[下载地址](https://www.python.org/downloads/)）

2. 在demo目录下运行：
```bash
# Python 3
python -m http.server 8080

# 或者使用提供的启动脚本
python server.py
```

3. 在手机浏览器中访问：
   - 本机访问：`http://localhost:8080`
   - 手机访问：`http://[电脑IP]:8080`（如 `http://192.168.1.100:8080`）

4. 在安卓手机上安装：
   - 用Chrome浏览器打开网址
   - 点击浏览器菜单（三个点）
   - 选择"添加到主屏幕"或"安装应用"
   - 确认安装

#### 使用Node.js启动服务器

如果您安装了Node.js：
```bash
# 安装serve
npm install -g serve

# 启动服务
serve -p 8080
```

#### 使用VS Code Live Server

1. 安装VS Code的"Live Server"扩展
2. 右键点击`index.html`
3. 选择"Open with Live Server"

### 方式二：部署到网络服务器

将demo文件夹上传到任意Web服务器（如GitHub Pages、Vercel、Netlify等），然后通过网址访问安装。

#### GitHub Pages部署

1. 将demo目录推送到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 访问 `https://[用户名].github.io/[仓库名]`

## 查看电脑IP地址

### Windows
```bash
ipconfig
```
查看"IPv4 地址"（如 192.168.1.100）

### macOS/Linux
```bash
ifconfig
# 或
ip addr show
```

## 确保手机和电脑在同一WiFi网络

手机需要和电脑连接同一个WiFi才能访问本地服务器。

## 图标生成（可选）

如果需要生成PNG格式的图标：

```bash
# 安装Pillow库
pip install Pillow

# 运行图标生成脚本
cd demo/icons
python generate-icons.py
```

## 常见问题

### Q: 为什么无法访问本地服务器？
A: 
1. 确认手机和电脑在同一WiFi网络
2. 检查防火墙是否允许8080端口
3. 尝试关闭防火墙测试

### Q: 为什么没有弹出安装提示？
A: 
1. 确保使用Chrome浏览器
2. 确保通过HTTP/HTTPS协议访问（不是file://）
3. 可以手动从浏览器菜单选择"添加到主屏幕"

### Q: 数据会丢失吗？
A: 数据存储在手机浏览器的LocalStorage中，除非清除浏览器数据，否则不会丢失。建议定期使用"导出数据"功能备份。

### Q: 如何更新应用？
A: 刷新网页即可自动更新，Service Worker会在后台更新缓存。

## 技术支持

如有问题，请查看浏览器控制台的错误信息（Chrome菜单 > 更多工具 > 开发者工具）。