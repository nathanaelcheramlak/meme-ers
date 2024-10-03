import "./globals.css";

export const metadata = {
  title: "Meme-ers",
  description: "Customized Memes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
