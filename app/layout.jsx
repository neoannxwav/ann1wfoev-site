import "./globals.css";

export const metadata = {
  title: "Ann1wfoev / NEoANNx – One Way Forever",
  description: "Ann1wfoev official site",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
