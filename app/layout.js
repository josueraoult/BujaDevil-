import './styles/globals.css'
import { Inter, JetBrains_Mono } from 'next/font/google'
import blogDB, { SITE_CONFIG } from '../data/content'

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

// Métadonnées dynamiques
export async function generateMetadata() {
  const currentUser = typeof window !== 'undefined' ? blogDB.getCurrentUser() : null
  const adminInfo = currentUser?.role === 'admin' ? SITE_CONFIG.admin : null

  return {
    title: {
      default: 'BujaDevil - Blog Moderne 2025',
      template: '%s | BujaDevil'
    },
    description: 'Blog moderne par Josué Raoult - News, Gaming, Apps, Tutorials. Découvrez des contenus frais et innovants.',
    keywords: ['blog', 'gaming', 'tutoriels', 'applications', 'news', 'technologie'],
    authors: [{ 
      name: adminInfo?.name || SITE_CONFIG.admin.name, 
      email: adminInfo?.email || SITE_CONFIG.admin.email 
    }],
    creator: adminInfo?.name || SITE_CONFIG.admin.name,
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
                  // Gestion du thème
                  var theme = localStorage.getItem('theme') || 'system';
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var appliedTheme = theme === 'system' ? systemTheme : theme;
                  
                  if (appliedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }

                  // Gestion de la langue
                  var savedLanguage = localStorage.getItem('bujadevil_language');
                  if (!savedLanguage || savedLanguage === 'auto') {
                    var browserLang = navigator.language || navigator.userLanguage;
                    var primaryLang = browserLang.split('-')[0];
                    var supportedLangs = ['fr', 'en', 'es'];
                    var detectedLang = supportedLangs.includes(primaryLang) ? primaryLang : 'fr';
                    localStorage.setItem('bujadevil_language', detectedLang);
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
          <script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        try {
          // Gestion du thème
          var theme = localStorage.getItem('theme') || 'system';
          var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          var appliedTheme = theme === 'system' ? systemTheme : theme;
          
          if (appliedTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }

          // Gestion de la langue
          var savedLanguage = localStorage.getItem('bujadevil_language');
          if (!savedLanguage || savedLanguage === 'auto') {
            var browserLang = navigator.language || navigator.userLanguage;
            var primaryLang = browserLang.split('-')[0];
            var supportedLangs = ['fr', 'en', 'es'];
            var detectedLang = supportedLangs.includes(primaryLang) ? primaryLang : 'fr';
            localStorage.setItem('bujadevil_language', detectedLang);
          }
        } catch (e) {}
      })();
    `,
  }}
/>
      <body className="font-sans antialiased bg-white dark:bg-dark-100 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <div className="min-h-screen flex flex-col">
          {/* Header sera intégré ici avec auth */}
          <main className="flex-1">
            {children}
          </main>
          {/* Footer sera intégré ici */}
        </div>
        
        {/* Script pour la gestion avancée du thème et auth */}
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

                function initAuth() {
                  try {
                    var sessionToken = localStorage.getItem('bujadevil_session');
                    if (sessionToken) {
                      // Vérifier si la session est toujours valide
                      var data = JSON.parse(localStorage.getItem('bujadevil_data') || '{}');
                      var session = data.sessions?.find(s => s.token === sessionToken);
                      
                      if (!session || new Date(session.expiresAt) < new Date()) {
                        localStorage.removeItem('bujadevil_session');
                      }
                    }
                  } catch (e) {}
                }
                
                // Écouter les changements de préférence système
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);
                
                // Initialiser
                updateTheme();
                initAuth();

                // Exposer les fonctions globales
                window.updateTheme = updateTheme;
                window.getCurrentLanguage = function() {
                  return localStorage.getItem('bujadevil_language') || 'fr';
                };
                window.setLanguage = function(lang) {
                  localStorage.setItem('bujadevil_language', lang);
                  window.dispatchEvent(new Event('languageChanged'));
                };
              })();
            `,
          }}
        />
      </body>
    </html>
  )
      }
