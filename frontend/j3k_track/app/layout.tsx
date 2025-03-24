// app/layout.tsx
import '../../styles/globals.css';  // การนำเข้าควรใช้เส้นทางที่ถูกต้อง

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
