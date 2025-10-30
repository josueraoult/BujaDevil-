'use client'

import { useState, useEffect } from 'react'
import { MainLayout, ArticleCard, LoadingSpinner, EmptyState } from '../components/layouts/layouts'
import blogDB from '../../data/content'
import { sortByTrending, filterByCategory } from '../lib/utils'

export default function HomePage() {
  const [articles, setArticles] = useState([])
  const [trendingArticles, setTrendingArticles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState('')

  useEffect(() => {
    loadArticles()
  }, [])

  const loadArticles = () => {
    setIsLoading(true)
    // Simuler un léger délai pour le chargement
    setTimeout(() => {
      const allArticles = blogDB.getArticles({ limit: 12 })
      setArticles(allArticles)
      
      // Calculer les articles trending
      const trending = sortByTrending(allArticles).slice(0, 6)
      setTrendingArticles(trending)
      
      setIsLoading(false)
    }, 500)
  }

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    if (!newsletterEmail) return

    setIsSubmitting(true)
    setSubscriptionStatus('loading')

    // Simuler l'envoi à un service de newsletter
    setTimeout(() => {
      setSubscriptionStatus('success')
      setNewsletterEmail('')
      setIsSubmitting(false)
      
      // Reset du message après 5 secondes
      setTimeout(() => setSubscriptionStatus(''), 5000)
    }, 1500)
  }

  const getArticlesByCategory = (category) => {
    return filterByCategory(articles, category).slice(0, 4)
  }

  const categories = [
    { id: 'news', name: 'News', icon: '📰', color: 'accent-news' },
    { id: 'gaming', name: 'Gaming', icon: '🎮', color: 'accent-gaming' },
    { id: 'apps', name: 'Apps', icon: '📱', color: 'accent-apps' },
    { id: 'tutorials', name: 'Tutoriels', icon: '📚', color: 'accent-tutorials' }
  ]

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative hero-gradient text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
              <span className="text-sm">🚀 Blog Moderne 2025</span>
            </div>
            
            <h1 className="text-dynamic-lg font-bold mb-6 leading-tight">
              Bienvenue sur{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                BujaDevil
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              Découvrez un univers de contenu passionnant : Actualités tech, gaming, 
              applications innovantes et tutoriels approfondis.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="/blog" 
                className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                Explorer les articles
              </a>
              <a 
                href="/about" 
                className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg font-semibold transition-all duration-300"
              >
                Qui suis-je ?
              </a>
            </div>
          </div>
        </div>
        
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none" 
            className="w-full h-12 text-white fill-current"
          >
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="shape-fill"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="shape-fill"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="shape-fill"></path>
          </svg>
        </div>
      </section>

      {/* Trending Articles */}
      {trendingArticles.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-dark-200">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Articles Tendances 🔥
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                Les contenus les plus populaires et engageants de la communauté
              </p>
            </div>

            <div className="article-grid">
              {trendingArticles.map(article => (
                <ArticleCard 
                  key={article.id} 
                  article={article}
                  onLike={loadArticles}
                  onBookmark={loadArticles}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles by Category */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Découvrez par Catégorie
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Explorez du contenu organisé selon vos centres d'intérêt
            </p>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-16">
              {categories.map(category => {
                const categoryArticles = getArticlesByCategory(category.id)
                
                if (categoryArticles.length === 0) return null
                
                return (
                  <div key={category.id} className="space-y-8">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl bg-${category.color}/10 flex items-center justify-center text-2xl`}>
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{category.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Les derniers articles dans {category.name.toLowerCase()}
                        </p>
                      </div>
                    </div>

                    <div className="article-grid">
                      {categoryArticles.map(article => (
                        <ArticleCard 
                          key={article.id} 
                          article={article}
                          onLike={loadArticles}
                          onBookmark={loadArticles}
                        />
                      ))}
                    </div>

                    {categoryArticles.length >= 4 && (
                      <div className="text-center">
                        <a 
                          href={`/blog?category=${category.id}`}
                          className="btn-secondary inline-flex items-center space-x-2"
                        >
                          <span>Voir plus d'articles {category.name.toLowerCase()}</span>
                          <span>→</span>
                        </a>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {!isLoading && articles.length === 0 && (
            <EmptyState 
              message="Aucun article publié pour le moment. Revenez bientôt !"
              action={
                <a href="/admin" className="btn-primary">
                  Publier mon premier article
                </a>
              }
            />
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
              <span className="text-sm">📧 Restez informé</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ne manquez aucun article
            </h2>
            
            <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
              Abonnez-vous à notre newsletter pour recevoir les derniers articles, 
              actualités et mises à jour directement dans votre boîte mail.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="newsletter-form max-w-md mx-auto">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Votre email..."
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
                required
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn bg-white text-primary-600 hover:bg-gray-100 px-6 py-3 font-semibold whitespace-nowrap transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? 'Inscription...' : "S'abonner"}
              </button>
            </form>

            {subscriptionStatus === 'loading' && (
              <p className="mt-4 text-primary-200">
                Inscription en cours...
              </p>
            )}

            {subscriptionStatus === 'success' && (
              <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <p className="text-white font-semibold">
                  ✅ Merci ! Vous êtes maintenant inscrit à la newsletter.
                </p>
              </div>
            )}

            <p className="text-primary-200 text-sm mt-4">
              Pas de spam, désinscription à tout moment.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-dark-100 border-t border-gray-200 dark:border-dark-300">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="stat-value">{articles.length}</div>
              <div className="stat-label">Articles publiés</div>
            </div>
            <div>
              <div className="stat-value">
                {articles.reduce((total, article) => total + (article.views || 0), 0)}
              </div>
              <div className="stat-label">Vues totales</div>
            </div>
            <div>
              <div className="stat-value">
                {articles.reduce((total, article) => total + (article.likes || 0), 0)}
              </div>
              <div className="stat-label">Likes reçus</div>
            </div>
            <div>
              <div className="stat-value">{categories.length}</div>
              <div className="stat-label">Catégories</div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  )
    }
