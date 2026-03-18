# PWA 图标生成说明

## 方法一：使用在线工具生成

1. 访问 [PWA Asset Generator](https://progressier.com/pwa-icons-and-splash-screen-generator) 或 [RealFaviconGenerator](https://realfavicongenerator.net/)
2. 上传 `icon.svg` 文件或自定义图片
3. 生成各尺寸图标并下载
4. 将生成的图标文件放入此目录

## 方法二：使用 ImageMagick 命令行工具

如果已安装 ImageMagick，可以使用以下命令：

```bash
# 从SVG生成各尺寸PNG
convert icon.svg -resize 72x72 icon-72.png
convert icon.svg -resize 96x96 icon-96.png
convert icon.svg -resize 128x128 icon-128.png
convert icon.svg -resize 144x144 icon-144.png
convert icon.svg -resize 152x152 icon-152.png
convert icon.svg -resize 192x192 icon-192.png
convert icon.svg -resize 384x384 icon-384.png
convert icon.svg -resize 512x512 icon-512.png
```

## 方法三：使用 Python 脚本

运行 `generate-icons.py` 脚本（需要安装 Pillow 库）：

```bash
pip install Pillow
python generate-icons.py
```

## 所需图标尺寸

PWA 需要以下尺寸的图标：

- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

## 临时解决方案

在正式图标生成之前，应用会使用 SVG 图标作为后备方案。