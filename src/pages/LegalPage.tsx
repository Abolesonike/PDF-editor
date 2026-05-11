import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="legal-page">
      <div className="legal-nav">
        <Link to="/" className="legal-back">← 返回首页</Link>
        <nav className="legal-tabs">
          <Link to="/privacy" className={isActive('/privacy') ? 'active' : ''}>
            隐私政策
          </Link>
          <Link to="/terms" className={isActive('/terms') ? 'active' : ''}>
            服务条款
          </Link>
          <Link to="/about" className={isActive('/about') ? 'active' : ''}>
            关于我们
          </Link>
          <Link to="/contact" className={isActive('/contact') ? 'active' : ''}>
            联系我们
          </Link>
        </nav>
      </div>
      <article className="legal-content">
        <h1>{title}</h1>
        {children}
      </article>
    </div>
  );
}
