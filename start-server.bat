@echo off
chcp 65001 >nul
echo ================================================
echo 肾友日记 PWA 本地服务器
echo ================================================
echo.
echo 正在启动服务器...
echo.
echo 访问地址:
echo   本机访问: http://localhost:8080
echo   手机访问: http://[你的电脑IP]:8080
echo.
echo 安装步骤:
echo   1. 确保手机和电脑连接同一WiFi
echo   2. 在安卓手机Chrome浏览器中访问上述地址
echo   3. 点击浏览器菜单 - "添加到主屏幕"
echo.
echo 按 Ctrl+C 停止服务器
echo ================================================
echo.
cd /d "%~dp0"
npx serve -p 8080