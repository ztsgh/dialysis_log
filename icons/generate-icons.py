#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PWA图标生成脚本
需要安装: pip install Pillow
"""

import os
from PIL import Image, ImageDraw

# 图标尺寸列表
SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

def create_icon(size, output_path):
    """创建指定尺寸的图标"""
    # 创建带圆角的图标
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 主色调 - 蓝色
    primary_color = (74, 144, 217, 255)  # #4A90D9
    white = (255, 255, 255, 255)
    
    # 绘制圆角矩形背景
    corner_radius = int(size * 0.2)
    draw.rounded_rectangle([0, 0, size-1, size-1], radius=corner_radius, fill=primary_color)
    
    # 绘制心形（简化版本）
    center_x = size // 2
    center_y = int(size * 0.4)
    heart_size = int(size * 0.35)
    
    # 左半圆
    left_circle_x = center_x - heart_size // 4
    draw.ellipse([
        left_circle_x - heart_size // 2,
        center_y - heart_size // 2,
        left_circle_x + heart_size // 2,
        center_y + heart_size // 2
    ], fill=white)
    
    # 右半圆
    right_circle_x = center_x + heart_size // 4
    draw.ellipse([
        right_circle_x - heart_size // 2,
        center_y - heart_size // 2,
        right_circle_x + heart_size // 2,
        center_y + heart_size // 2
    ], fill=white)
    
    # 底部三角形（用多边形近似）
    triangle_top = center_y
    triangle_bottom = center_y + int(heart_size * 0.8)
    points = [
        (center_x - heart_size, triangle_top),
        (center_x + heart_size, triangle_top),
        (center_x, triangle_bottom)
    ]
    draw.polygon(points, fill=white)
    
    # 绘制文字 "肾友"
    try:
        # 尝试使用系统字体
        font_size = int(size * 0.15)
        from PIL import ImageFont
        try:
            # Windows
            font = ImageFont.truetype("msyh.ttc", font_size)  # 微软雅黑
        except:
            try:
                # macOS
                font = ImageFont.truetype("PingFang.ttc", font_size)
            except:
                try:
                    # Linux
                    font = ImageFont.truetype("NotoSansCJK.ttc", font_size)
                except:
                    # 使用默认字体
                    font = ImageFont.load_default()
        
        text = "肾友"
        # 计算文字位置（居中）
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        text_x = (size - text_width) // 2
        text_y = int(size * 0.75)
        
        draw.text((text_x, text_y), text, fill=white, font=font)
    except Exception as e:
        print(f"警告: 无法绘制文字 - {e}")
    
    # 保存图标
    img.save(output_path, 'PNG')
    print(f"已生成: {output_path}")

def main():
    # 获取脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("开始生成PWA图标...")
    
    for size in SIZES:
        output_path = os.path.join(script_dir, f"icon-{size}.png")
        create_icon(size, output_path)
    
    print(f"\n完成! 共生成 {len(SIZES)} 个图标文件")

if __name__ == "__main__":
    main()