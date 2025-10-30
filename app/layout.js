
import './styles/globals.css'
import { Inter, JetBrains_Mono } from 'next/font/google'

// Configuration des polices modernes
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
})

// Métadonnées du site
export const metadata = {
  title: {
    default: 'BujaDevil - Blog Moderne 2025',
    template: '%s | BujaDevil'
  },
  description: 'Blog moderne par Josué Raoult - News, Gaming, Apps, Tutorials. Découvrez des contenus frais et innovants.',
  keywords: ['blog', 'gaming', 'tutoriels', 'applications', 'news', 'technologie'],
  authors: [{ name: 'Josué Raoult', email: 'raoultjosue2@gmail.com' }],
  creator: 'Josué Raoult',
  publisher: 'BujaDevil',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://bujadevil.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://bujadevil.vercel.app',
    siteName: 'BujaDevil',
    title: 'BujaDevil - Blog Moderne 2025',
    description: 'Blog moderne par Josué Raoult - News, Gaming, Apps, Tutorials',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'BujaDevil Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BujaDevil - Blog Moderne 2025',
    description: 'Blog moderne par Josué Raoult',
    images: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop'],
    creator: '@BujaDevil',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }) {
  return (
    <html 
      lang="fr" 
      className={`${inter.variable} ${jetbrainsMono.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'system';
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var appliedTheme = theme === 'system' ? systemTheme : theme;
                  
                  if (appliedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <meta name="theme-color" content="#0ea5e9" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1e293b" media="(prefers-color-scheme: dark)" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="font-sans antialiased bg-white dark:bg-dark-100 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <div className="min-h-screen flex flex-col">
          {/* Header sera intégré ici */}
          <main className="flex-1">
            {children}
          </main>
          {/* Footer sera intégré ici */}
        </div>
        
        {/* Script pour la gestion avancée du thème */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function updateTheme() {
                  try {
                    var theme = localStorage.getItem('theme') || 'system';
                    var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    var appliedTheme = theme === 'system' ? systemTheme : theme;
                    
                    if (appliedTheme === 'dark') {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                    
                    // Mettre à jour les meta tags theme-color
                    var metaTheme = document.querySelector('meta[name="theme-color"]');
                    if (metaTheme) {
                      metaTheme.content = appliedTheme === 'dark' ? '#1e293b' : '#0ea5e9';
                    }
                  } catch (e) {}
                }
                
                // Écouter les changements de préférence système
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);
                
                // Exposer la fonction pour les composants React
                window.updateTheme = updateTheme;
              })();
            `,
          }}
        />
      </body>
    </html>
  )
        }
