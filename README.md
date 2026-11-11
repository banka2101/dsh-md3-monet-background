# DeepSeek Harness · MD3 Monet 主题背景

为 **DeepSeek Harness** 设置自定义全窗壁纸。你可以**上传自己的图片**，照片、插画或收藏的壁纸都可以。在 **设置 → 背景** 点击「选择图片」，也可以把本地图片直接拖进预览区。选中的图片会铺在侧栏、会话区和 Windows 标题栏下方。

壁纸按原分辨率保存在当前客户端，支持 1080p 和 4K 等图片，单张最多 25 MB。移动原文件后，已选背景仍能显示。升级后，重新选择一次原图即可替换旧版保存的缩小副本。

## 莫奈取色与显示模式

插件使用 Google **Material Design 3（Material You / 莫奈）** 从壁纸的小尺寸样本提取种子色。沙丘图会带来暖棕色界面，蓝色抽象图则会带来偏蓝的配色。按钮、选中项、输入框和菜单会一起换色，浅色和深色模式各有对应的底色、文字和图标颜色。

在实时预览下，可以选择 **阅读优先** 让文字更清楚、**均衡** 兼顾图片和文字，或 **壁纸优先** 显示更多原图细节。图片取色和设置保存都在当前客户端完成。

## 安装

在 DSH 打开 **插件 → 添加插件**，输入 `github:banka2101/dsh-md3-monet-background#v1.2.0`，安装后启用。也可以在同一入口填入下载的 `.tgz` 完整路径。 [发行安装包](https://github.com/banka2101/dsh-md3-monet-background/releases/latest)

适用于 DSH `0.2.2` 系列，从 `0.2.2-rc.1` 起。已在 Windows 桌面版验证。

## 效果展示

### 主界面

![沙丘壁纸与暖色界面](docs/screenshots/home-dunes.png)

![草原壁纸与大地色界面](docs/screenshots/home-grassland.png)

![插画壁纸与青色界面](docs/screenshots/home-illustration.png)

![抽象壁纸与蓝色界面](docs/screenshots/home-abstract.png)

### 背景设置

![背景设置、显示模式与莫奈色盘](docs/screenshots/background-settings.png)

*这里可以上传或更换自己的图片，实时比较三种显示模式，并查看从当前壁纸提取的色盘。*

### 会话效果

![使用自定义背景的问答会话](docs/screenshots/conversation.png)

*进入会话后，壁纸继续铺在聊天区下方。输入框和消息气泡使用从同一张图生成的容器色。*

示例背景图片来自 Google、kieed 和 Microsoft Design。

## Agent README

把仓库链接发给 DeepSeek Harness Agent，请它按 [Agent 安装指南](AGENT_README.md) 安装。

[MIT](LICENSE) · [Material Color Utilities 许可](LICENSE-MATERIAL-COLOR-UTILITIES)
