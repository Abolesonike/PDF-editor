import { LegalPage } from './LegalPage';

export function About() {
  return (
    <LegalPage title="关于我们 (About Us)">
      <section>
        <h2>我们的目标</h2>
        <p>
          PDF Editor 是一个<strong>免费、开源、易用</strong>的在线 PDF 文本编辑工具。我们的目标是让任何人都能轻松编辑 PDF 文档中的文字，无需安装复杂的桌面软件，无需注册账号，一切都在浏览器中完成。
        </p>
      </section>

      <section>
        <h2>关于开发</h2>
        <p>
          本项目<strong>完全由 Claude Code 与 Kimi Code 协作开发完成</strong>。从最初的产品构思、架构设计，到每一行代码的编写、调试与优化，均依托 AI 编程助手实现。我们相信 AI 辅助开发能够让高质量的软件工具更快地触达用户，同时也展示了现代 AI 在复杂前端项目中的实际落地能力。
        </p>
      </section>

      <section>
        <h2>为什么选择我们</h2>
        <ul>
          <li>
            <strong>完全本地处理</strong>：您的 PDF 文件不会上传到任何服务器，所有编辑在您的设备上完成，保护您的隐私和数据安全。
          </li>
          <li>
            <strong>免费使用</strong>：核心功能完全免费，没有隐藏收费。
          </li>
          <li>
            <strong>中文友好</strong>：针对中文 PDF 文档进行了特别优化，支持中文字体嵌入和文本识别。
          </li>
          <li>
            <strong>开源透明</strong>：代码完全开源，任何人都可以审查我们的实现。
          </li>
        </ul>
      </section>

      <section>
        <h2>技术栈</h2>
        <p>本网站基于以下优秀开源技术构建：</p>
        <ul>
          <li>
            <strong>React</strong> — 用户界面框架
          </li>
          <li>
            <strong>pdfjs-dist</strong> — PDF 渲染和文本提取
          </li>
          <li>
            <strong>pdf-lib</strong> — PDF 生成和编辑
          </li>
          <li>
            <strong>Vite</strong> — 构建工具
          </li>
        </ul>
      </section>

      <section>
        <h2>开源贡献</h2>
        <p>
          本项目是开源的，欢迎通过 GitHub 提交 Issue 或 Pull Request 来帮助我们改进。无论是报告 bug、建议新功能，还是贡献代码，您的参与都将让这个项目变得更好。
        </p>
      </section>
    </LegalPage>
  );
}
