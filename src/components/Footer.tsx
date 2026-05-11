import { useEffect } from 'react';

const BUSUANZI_SRC = 'https://cdn.busuanzi.cc/busuanzi/3.6.9/busuanzi.min.js';

export function Footer() {
  useEffect(() => {
    if (document.querySelector(`script[src="${BUSUANZI_SRC}"]`)) return;
    const s = document.createElement('script');
    s.src = BUSUANZI_SRC;
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return (
    <footer className="site-footer">
      <span>今日访问量 <span id="busuanzi_today_pv">加载中...</span> 次</span>
      <span>今日访客数 <span id="busuanzi_today_uv">加载中...</span> 人</span>
      <span>总访问量 <span id="busuanzi_site_pv">加载中...</span> 次</span>
      <span>总访客数 <span id="busuanzi_site_uv">加载中...</span> 人</span>
      <span>本页阅读量 <span id="busuanzi_page_pv">加载中...</span> 次</span>
      <span>本页访客数 <span id="busuanzi_page_uv">加载中...</span> 人</span>
    </footer>
  );
}
