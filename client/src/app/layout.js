import "./globals.css";

export const metadata = {
  title: "Trámites en Línea | Demo",
  description: "Portal académico de solicitud y seguimiento de trámites.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
