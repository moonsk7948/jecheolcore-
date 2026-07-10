import "./globals.css";

export const metadata = {
  title: "제철나우",
  description: "오늘, 무엇을 먹어야 할까? 제철나우가 알려드려요.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@500;700&family=Noto+Sans+KR:wght@400;500;700&family=IBM+Plex+Mono:wght@500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="app-shell">
          {children}
          <footer className="site-footer">
            <p>COPYRIGHT ⓒ제철나우 All rights reserved</p>
            <p>
              공동구매 문의 <a href="mailto:abc@abc.com">abc@abc.com</a>
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
