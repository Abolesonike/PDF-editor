# PDF 编辑器

纯前端 PDF 编辑器：上传 PDF → 点击原文字替换 / 在空白处添加新文字 → 导出新的 PDF。

## 特性

- **上传 PDF**：本地文件，全程不离开浏览器
- **替换原文字**：直接点击 PDF 中已有的文字，输入替换内容
- **新增文字**：开启"添加文字"模式后，点击任意位置插入新文本框
- **拖拽移动**：新增的文本框可拖拽改变位置
- **属性面板**：选中编辑后，可调整字号、颜色、删除该编辑
- **中文支持**：嵌入 Noto Sans SC 字体，导出 PDF 中文字符正常显示
- **导出 PDF**：将所有编辑应用于原 PDF 并下载

## 安装与运行

```bash
npm install
npm run dev
```

浏览器打开终端输出的 `http://localhost:5173/`。

## 中文字体（重要）

为了让导出的 PDF 包含中文，需要把一份中文字体放到 `public/fonts/` 目录：

1. 访问 [Google Fonts - Noto Sans SC](https://fonts.google.com/noto/specimen/Noto+Sans+SC)
2. 点击右上角"Download family"下载字体包
3. 解压后选择 `NotoSansSC-Regular.otf` 或 `NotoSansSC-Regular.ttf`
4. 放到本项目的 `public/fonts/` 目录

也可以使用任意支持中文的 OTF/TTF 字体，重命名为 `NotoSansSC-Regular.otf` 即可。

> 提示：完整的 Noto Sans SC 文件约 10MB。如果想缩小体积，可以使用工具（如 [pyftsubset](https://fonttools.readthedocs.io/)）做字符子集；导出时 pdf-lib 会自动只嵌入实际用到的字形，所以最终 PDF 体积是可控的。

## 使用流程

1. 点击工具栏的 **上传 PDF**，选择本地 PDF 文件
2. PDF 各页会纵向排列展示
3. **替换原文字**：直接点击 PDF 中的某段文字，会出现可编辑的输入框，修改后点击其他地方或按 Enter 提交
4. **添加新文字**：点击工具栏的 **添加文字** 按钮进入添加模式，然后在 PDF 任意位置点击，会出现新文本框；输入文字后点击别处提交
5. 点击任何已添加的文本框 → 右侧出现属性面板，可调整字号、颜色，或删除
6. 拖拽新文本框可移动位置（双击进入再次编辑）
7. 点击 **导出 PDF**，下载编辑后的文件

## 技术栈

- **Vite** + **React 18** + **TypeScript**
- **pdfjs-dist**：PDF 渲染、文字位置提取
- **pdf-lib** + **@pdf-lib/fontkit**：PDF 编辑、嵌入自定义字体、导出

## 已知限制

- 替换原文字时使用 Noto Sans SC 重写，字形与原 PDF 字体可能不完全一致
- 复杂排版（如表格、栏式布局）的命中区可能不精确
- 扫描版 PDF（无文字层）无法替换原文字，但仍可使用"添加文字"功能
- 当前未实现撤销/重做、缩放控制等
