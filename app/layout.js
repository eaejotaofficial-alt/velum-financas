import './globals.css';

export const metadata = {
  title: 'Velum Finanças',
  description: 'Finanças 360 adaptada ao seu modo de vida.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
