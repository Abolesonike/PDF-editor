import { useRef, useState } from 'react';

interface LandingContentProps {
  onFile: (file: File) => void;
}

export function LandingContent({ onFile }: LandingContentProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      alert('请选择 PDF 文件');
      return;
    }
    onFile(f);
  };

  return (
    <div className="landing">
      <section className="landing-hero">
        <h1>免费在线 PDF 编辑器 — 浏览器内直接修改 PDF 文字</h1>
        <p className="landing-sub">
          无需下载安装，无需注册账号。支持中文字体嵌入，可在浏览器中替换 PDF 原文、添加新文字、调整字体与颜色，所有操作在本地完成，文件不会上传服务器。
        </p>

        <div
          className={`upload-dropzone${dragOver ? ' drag-over' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
        >
          <div className="upload-plus" />
          <div className="upload-text">点击此处上传 PDF</div>
          <div className="upload-hint">或将 PDF 文件拖拽到此区域</div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
      </section>

      <section className="landing-section">
        <h2>功能特色</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>替换原文文字</h3>
            <p>点击 PDF 中的任意文字即可进入编辑模式，原文会被白色矩形覆盖，新文字自动对齐原始基线位置。</p>
          </div>
          <div className="feature-card">
            <h3>添加新文字</h3>
            <p>在工具栏切换到"添加文字"模式，可在 PDF 任意位置点击并输入新内容，支持自由拖拽调整位置。</p>
          </div>
          <div className="feature-card">
            <h3>中文字体支持</h3>
            <p>内置思源黑体（Noto Sans SC）等中文字体，导出时完整嵌入字体子集，保证中文显示正常无乱码。</p>
          </div>
          <div className="feature-card">
            <h3>属性自由调整</h3>
            <p>可针对每一处编辑独立设置字号、字体颜色、字体族，所见即所得，实时预览修改效果。</p>
          </div>
          <div className="feature-card">
            <h3>撤销与重做</h3>
            <p>支持完整的操作历史记录，可使用 Ctrl+Z 撤销、Ctrl+Y 重做，编辑过程更安全可控。</p>
          </div>
          <div className="feature-card">
            <h3>本地处理，保护隐私</h3>
            <p>所有 PDF 解析、编辑和导出均在浏览器中完成，文件全程不离开您的设备，无需担心数据泄露。</p>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <h2>使用方法（4 步搞定）</h2>
        <ol className="step-list">
          <li>
            <strong>上传 PDF 文件</strong>
            <span>点击页面顶部"上传 PDF"按钮，选择本地需要编辑的 PDF 文件，文件加载后会自动渲染所有页面。</span>
          </li>
          <li>
            <strong>修改文字内容</strong>
            <span>直接点击 PDF 中的原文进入替换编辑；或点击"添加文字"按钮在任意位置插入新文字。</span>
          </li>
          <li>
            <strong>调整字体与样式</strong>
            <span>选中编辑框后，在右侧属性面板中调整字号、字体族、颜色，并可拖动编辑框改变位置。</span>
          </li>
          <li>
            <strong>导出 PDF</strong>
            <span>点击工具栏"导出 PDF"按钮，浏览器会直接下载修改后的 PDF 文件，可立即使用。</span>
          </li>
        </ol>
      </section>

      <section className="landing-section">
        <h2>适用场景</h2>
        <ul className="scene-list">
          <li>修改合同、报告、简历等 PDF 文档中的错别字与小幅文本调整</li>
          <li>对扫描件或他人发来的 PDF 进行内容修订与批注</li>
          <li>在 PDF 表单空白处填写中文内容</li>
          <li>替换 PDF 模板中的姓名、日期、金额等字段</li>
          <li>无 Office 软件环境下临时编辑 PDF 文字</li>
        </ul>
      </section>

      <section className="landing-section">
        <h2>常见问题（FAQ）</h2>
        <div className="faq">
          <div className="faq-item">
            <h4>Q：这个 PDF 编辑器是免费的吗？</h4>
            <p>A：完全免费。无需注册账号，无水印，无使用次数限制，所有核心功能开放使用。</p>
          </div>
          <div className="faq-item">
            <h4>Q：我的 PDF 文件会上传到服务器吗？</h4>
            <p>A：不会。本工具基于纯前端技术构建，PDF 解析、编辑、导出全程在您的浏览器中完成，文件不会发送到任何服务器，隐私和数据安全有保障。</p>
          </div>
          <div className="faq-item">
            <h4>Q：支持中文 PDF 吗？导出后会乱码吗？</h4>
            <p>A：支持中文 PDF 编辑。我们内嵌了思源黑体字体，导出 PDF 时会完整嵌入字体数据，确保中文字符在任何 PDF 阅读器中都能正确显示。</p>
          </div>
          <div className="faq-item">
            <h4>Q：可以编辑扫描版 PDF 吗？</h4>
            <p>A：扫描版 PDF 本质上是图片，没有文本层，无法直接替换原文，但可以在图片上方"添加文字"覆盖原内容。</p>
          </div>
          <div className="faq-item">
            <h4>Q：支持哪些浏览器？</h4>
            <p>A：建议使用最新版本的 Chrome、Edge、Firefox 或 Safari 浏览器以获得最佳体验。</p>
          </div>
          <div className="faq-item">
            <h4>Q：编辑后的 PDF 文件有大小限制吗？</h4>
            <p>A：理论上没有大小限制，但建议处理 100MB 以内的 PDF 文件以保证流畅体验。</p>
          </div>
        </div>
      </section>
    </div>
  );
}
