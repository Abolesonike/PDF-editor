import { LegalPage } from './LegalPage';

export function Contact() {
  return (
    <LegalPage title="联系我们 (Contact Us)">
      <section>
        <h2>我们乐于听取您的反馈</h2>
        <p>
          如果您在使用过程中遇到任何问题，或者有功能建议，欢迎通过以下方式与我们取得联系。
        </p>
      </section>

      <section>
        <h2>联系方式</h2>
        <div className="contact-methods">
          <div className="contact-card">
            <h3>📧 电子邮箱</h3>
            <p>
              一般问题或反馈：
              <a href="mailto:1018093642@qq.com">1018093642@qq.com</a>
            </p>
          </div>

          <div className="contact-card">
            <h3>💻 GitHub</h3>
            <p>
              代码仓库和 Issue 跟踪：
              <a
                href="https://github.com/abolesonike/PDF-editor"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/abolesonike/PDF-editor
              </a>
            </p>
            <p className="contact-note">
              推荐通过 GitHub 提交 bug 报告和功能请求，这样其他用户也能看到进展。
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2>常见问题</h2>
        <div className="faq">
          <div className="faq-item">
            <h4>我的文件会被保存到服务器吗？</h4>
            <p>
              不会。所有 PDF 处理都在您的浏览器本地完成，文件内容不会离开您的设备。
            </p>
          </div>
          <div className="faq-item">
            <h4>我可以离线使用吗？</h4>
            <p>
              首次加载后，部分功能可以在离线状态下使用。完整支持计划在未来版本中实现。
            </p>
          </div>
          <div className="faq-item">
            <h4>导出的 PDF 有水印吗？</h4>
            <p>
              没有。导出的 PDF 文件完全干净，不包含任何水印或品牌标识。
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2>回复时间</h2>
        <p>
          我们会尽力在 3-5 个工作日内回复您的邮件。对于 GitHub 上的 Issue，通常会在一周内进行初步回应。
        </p>
      </section>
    </LegalPage>
  );
}
