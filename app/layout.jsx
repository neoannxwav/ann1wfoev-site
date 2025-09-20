import "./globals.css";

export const metadata = {
  title: "Ann1wfoev / NEoANNx – One Way Forever",
  description: "Custom Beats, Vocal Production, Artist Branding – Jerk / Y2K / Emo / Alt-Pop",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className="bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}
