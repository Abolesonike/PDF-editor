import { LegalPage } from './LegalPage';

export function Terms() {
  return (
    <LegalPage title="服务条款 (Terms of Service)">
      <p className="legal-updated">最后更新日期：2026年5月11日</p>

      <section>
        <h2>1. 接受条款</h2>
        <p>
          欢迎使用 PDF Editor（以下简称"本网站"）。通过访问和使用本网站，您表示同意受以下服务条款的约束。如果您不同意这些条款，请停止使用本网站。
        </p>
      </section>

      <section>
        <h2>2. 服务说明</h2>
        <p>
          本网站是一个免费的在线 PDF 文本编辑工具。所有文件处理均在您的浏览器本地完成，无需上传到服务器。
        </p>
      </section>

      <section>
        <h2>3. 用户使用规范</h2>
        <p>您同意在使用本网站时：</p>
        <ul>
          <li>不上传或处理任何违法、侵权、淫秽、诽谤或侵犯他人权利的内容</li>
          <li>不上传包含恶意软件、病毒或其他有害代码的文件</li>
          <li>不试图干扰或破坏本网站的正常运行</li>
          <li>不使用本网站进行任何非法活动</li>
        </ul>
      </section>

      <section>
        <h2>4. 免责声明</h2>
        <p>
          本网站按"原样"提供，不作任何形式的明示或暗示担保。我们不对以下情况负责：
        </p>
        <ul>
          <li>
            <strong>文件内容</strong>：您对自己上传和处理的文件内容负全部责任。
          </li>
          <li>
            <strong>处理结果</strong>：PDF 编辑结果可能因原始文件格式复杂性而存在差异，请在重要使用前验证输出文件。
          </li>
          <li>
            <strong>服务可用性</strong>：我们不保证服务随时可用或无错误。
          </li>
          <li>
            <strong>数据丢失</strong>：由于所有处理在浏览器中进行，刷新页面会导致数据丢失，请务必备份原始文件。
          </li>
        </ul>
      </section>

      <section>
        <h2>5. 知识产权</h2>
        <p>
          本网站的代码和界面设计受版权法保护。您上传的 PDF 文件及其内容的知识产权归您所有，我们不会以任何方式主张对这些文件的权利。
        </p>
      </section>

      <section>
        <h2>6. 服务变更</h2>
        <p>
          我们保留随时修改、暂停或终止本网站服务的权利，恕不另行通知。服务条款的更新将发布在本页面，继续使用即表示接受更新后的条款。
        </p>
      </section>

      <section>
        <h2>7. 适用法律</h2>
        <p>
          本服务条款受适用法律管辖。如有争议，双方应首先通过友好协商解决。
        </p>
      </section>

      <section>
        <h2>8. 联系我们</h2>
        <p>
          如有任何问题或疑虑，请通过
          <a href="/contact">联系我们</a> 页面与我们取得联系。
        </p>
      </section>
    </LegalPage>
  );
}
