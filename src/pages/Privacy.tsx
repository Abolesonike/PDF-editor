import { LegalPage } from './LegalPage';

export function Privacy() {
  return (
    <LegalPage title="隐私政策 (Privacy Policy)">
      <p className="legal-updated">最后更新日期：2026年5月11日</p>

      <section>
        <h2>1. 我们是谁</h2>
        <p>
          本网站（PDF Editor）是一个免费的在线 PDF 编辑工具。我们致力于为用户提供简单、安全的 PDF 文本编辑体验。
        </p>
      </section>

      <section>
        <h2>2. 我们收集哪些信息</h2>
        <p>
          <strong>我们尽可能少地收集数据。</strong> 具体来说：
        </p>
        <ul>
          <li>
            <strong>您上传的 PDF 文件</strong>：文件完全在您的浏览器本地处理，不会上传到我们的服务器。
          </li>
          <li>
            <strong>访问统计数据</strong>：我们使用第三方统计服务（不侵入）来了解网站访问量，不包含个人身份信息。
          </li>
          <li>
            <strong>本地存储</strong>：Cookie 同意偏好会保存在您的浏览器本地（localStorage），用于记住您是否已同意 Cookie 使用。
          </li>
        </ul>
      </section>

      <section>
        <h2>3. 我们不收集哪些信息</h2>
        <p>以下信息我们<strong>绝不</strong>收集：</p>
        <ul>
          <li>您的姓名、邮箱、电话等个人身份信息</li>
          <li>您上传 PDF 文件的具体内容</li>
          <li>您的 IP 地址（除统计服务外）</li>
          <li>需要注册账号或登录的任何信息</li>
        </ul>
      </section>

      <section>
        <h2>4. 文件处理</h2>
        <p>
          所有的 PDF 处理（包括解析、渲染和导出）都在您的浏览器中完成。文件内容不会离开您的设备，也不会被传输到任何服务器。您可以随时通过刷新页面清除所有数据。
        </p>
      </section>

      <section>
        <h2>5. Cookie 使用</h2>
        <p>
          我们使用 Cookie 和类似的浏览器存储技术（如 localStorage）来：
        </p>
        <ul>
          <li>记住您的 Cookie 同意偏好</li>
          <li>分析网站流量和使用情况（通过第三方统计工具）</li>
        </ul>
        <p>
          您可以在首次访问时选择是否接受非必要的 Cookie，并随时通过清除浏览器数据来撤回同意。
        </p>
      </section>

      <section>
        <h2>6. 第三方服务</h2>
        <p>本网站可能使用以下第三方服务：</p>
        <ul>
          <li>
            <strong>统计服务</strong>：用于了解网站访问情况，数据为匿名聚合形式。
          </li>
        </ul>
      </section>

      <section>
        <h2>7. 您的权利</h2>
        <p>根据 GDPR 等数据保护法规，您拥有以下权利：</p>
        <ul>
          <li>知情权 — 了解我们如何收集和使用您的数据</li>
          <li>访问权 — 查看我们持有的关于您的任何数据</li>
          <li>删除权 — 要求我们删除您的数据（由于我们不存储个人数据，清除浏览器数据即可）</li>
          <li>撤回同意权 — 随时撤回对 Cookie 的同意</li>
        </ul>
      </section>

      <section>
        <h2>8. 联系我们</h2>
        <p>
          如果您对本隐私政策有任何疑问，请通过
          <a href="/contact">联系我们</a> 页面与我们取得联系。
        </p>
      </section>
    </LegalPage>
  );
}
