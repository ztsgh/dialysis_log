#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
肾友日记 PWA 本地服务器
用于在安卓手机上安装和使用PWA
"""

import http.server
import socketserver
import socket
import os
import sys

PORT = 8080

def get_local_ip():
    """获取本机IP地址"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def main():
    # 切换到脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # 获取本机IP
    local_ip = get_local_ip()
    
    # 创建服务器
    handler = http.server.SimpleHTTPRequestHandler
    
    # 设置MIME类型
    handler.extensions_map.update({
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.svg': 'image/svg+xml',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
    })
    
    print("=" * 50)
    print("肾友日记 PWA 本地服务器")
    print("=" * 50)
    print()
    print(f"服务已启动，端口: {PORT}")
    print()
    print("访问地址:")
    print(f"  本机访问: http://localhost:{PORT}")
    print(f"  手机访问: http://{local_ip}:{PORT}")
    print()
    print("安装步骤:")
    print("1. 确保手机和电脑连接同一WiFi")
    print("2. 在安卓手机Chrome浏览器中访问上述地址")
    print("3. 点击浏览器菜单 → '添加到主屏幕'")
    print()
    print("按 Ctrl+C 停止服务器")
    print("=" * 50)
    
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止")
    except OSError as e:
        if e.errno == 10048:  # 端口被占用
            print(f"错误: 端口 {PORT} 已被占用")
            print("请关闭占用端口的程序或修改脚本中的PORT变量")
        else:
            raise

if __name__ == "__main__":
    main()