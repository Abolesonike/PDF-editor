import { useState, useEffect } from 'react';

const STORAGE_KEY = 'cookie-consent';

type ConsentStatus = 'accepted' | 'declined' | null;

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setVisible(true);
      }
    } catch {
      // localStorage 不可用时不显示
    }
  }, []);

  const saveConsent = (status: ConsentStatus) => {
    try {
      localStorage.setItem(STORAGE_KEY, status ?? '');
    } catch {
      // 忽略写入错误
    }
    setVisible(false);
  };

  const accept = () => saveConsent('accepted');
  const decline = () => saveConsent('declined');

  if (!visible) return null;

  return (
    <div className="cookie-consent-bar">
      <div className="cookie-content">
        <p>
          我们使用 Cookie 来改善您的浏览体验并分析网站流量。
          点击"接受"即表示您同意我们使用 Cookie。
          <button
            className="cookie-details-btn"
            onClick={() => setShowDetails((s) => !s)}
          >
            {showDetails ? '隐藏详情' : '了解更多'}
          </button>
        </p>

        {showDetails && (
          <div className="cookie-details">
            <h4>我们使用的 Cookie 类型：</h4>
            <ul>
              <li>
                <strong>必要 Cookie</strong>：用于记住您的 Cookie 同意偏好，无法禁用。
              </li>
              <li>
                <strong>分析 Cookie</strong>：帮助我们了解网站的使用情况，以便改进服务。
              </li>
            </ul>
            <p>
              您可以随时通过清除浏览器数据来撤回同意。更多详情请参阅我们的
              <a href="/privacy">隐私政策</a>。
            </p>
          </div>
        )}

        <div className="cookie-actions">
          <button className="cookie-btn accept" onClick={accept}>
            接受全部
          </button>
          <button className="cookie-btn decline" onClick={decline}>
            仅必要 Cookie
          </button>
        </div>
      </div>
    </div>
  );
}
