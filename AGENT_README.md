# Agent README · 安装 DeepSeek Harness 主题背景

用户要求安装本插件时，按以下步骤操作。插件包名为 `@local/theme-background`，使用 DSH 的 Web 界面，兼容范围由 [package.json](package.json) 中的 `engines.dsh` 声明。

1. 确认要安装的 DSH 配置和运行时版本。桌面端通常使用 `desktop`，Web 端通常使用 `web`。用户指定了本仓库的版本标签或提交时，使用该版本。
2. 优先使用当前会话的 `plugin_manager`。用 `list_bundles` 检查插件状态。已安装且启用时直接验证，已安装但禁用时用 `set_bundle` 启用 `@local/theme-background`。新安装时调用：

   ```json
   {
     "action": "install_bundle",
     "target": "github:banka2101/dsh-md3-monet-background#v1.2.0",
     "enabled": true
   }
   ```

3. 如果工具不可用，使用 DSH CLI，按实际情况选择 `desktop` 或 `web` 配置。

   ```sh
   dsh plugin --profile desktop add "github:banka2101/dsh-md3-monet-background#v1.2.0"
   ```

   如果 Git 安装失败，可下载 [发行安装包](https://github.com/banka2101/dsh-md3-monet-background/releases/tag/v1.2.0)，用 `.tgz` 的绝对路径作为 `target` 或 `dsh plugin add` 的参数。已构建的 `client.js` 随仓库和安装包分发，安装无需执行构建脚本。
4. 按安装结果中的 `application`、`warnings` 和 `nextStep` 处理。核对插件已启用，并验证 **设置 → 背景** 能打开。让用户选一张图片即可看到实时预览和 Material You 色盘。

## 维护

兼容性问题按 DSH 的版本提示处理。已安装版本需要升级时，使用插件管理器针对该包的升级流程。开发时编辑 `client.template.js`，运行 `node build.mjs` 生成 `client.js`，再运行 `pnpm pack` 打包。

[DSH Bundle 安装文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/publish.zh.md)
