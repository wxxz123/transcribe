# Transcribe (Next.js + Soniox)

## 本地运行

1) 安装依赖：
```bash
pnpm install   # 或 npm install / yarn
```

2) 设置环境变量 `SONIOX_API_KEY`：
- Windows PowerShell（当前会话）：
```powershell
$env:SONIOX_API_KEY="你的API密钥"; pnpm dev
```
- macOS/Linux（当前会话）：
```bash
SONIOX_API_KEY="你的API密钥" pnpm dev
```
- 或在根目录创建 `.env.local`：
```
SONIOX_API_KEY=你的API密钥
```

3) 启动开发服务器：
```bash
pnpm dev
```
访问：`http://localhost:3000/upload`

## ffmpeg 安装（macOS）

推荐使用 Homebrew：
```bash
brew install ffmpeg
```

若未安装 ffmpeg，后端会优雅降级：直接将原始音频提交给 Soniox（可能不是 16k 单声道 WAV，但 API 仍尝试处理）。

## 功能简述

- 页面 `/upload`：文件选择、上传按钮、进度显示、结果展示（转写文本、摘要、关键词、待办清单）。
- 组件：`UploadForm`、`ResultPanel`、`TodoList`（可勾选，导出 JSON/Markdown）。
- 样式：Tailwind，移动端（含 iPhone Safari）适配。
- API：`POST /api/transcribe` 接收 multipart/form-data；若非 wav 且系统安装了 ffmpeg，则转为 16k 单声道 wav；随后用 `SONIOX_API_KEY` 调用 Soniox 文件转写 REST；成功返回：
```json
{"transcript":"...","meta":{"durationSec":123,"language":"zh"}}
```
失败返回：
```json
{"error":"..."}
```

## 说明

- 浏览器端在拿到 `transcript` 后，调用 `src/lib/analyze.ts` 的规则引擎生成 `summary/keywords/todos` 并渲染；提供复制与导出按钮。
- 若 Soniox API 路径或字段有更新，请调整 `app/api/transcribe/route.ts` 中的实现。
