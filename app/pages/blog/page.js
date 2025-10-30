'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MainLayout, ArticleCard, LoadingSpinner, EmptyState } from '../../components/layouts/layouts'
import blogDB from '../../../data/content'
import { debounce, filterByCategory, searchArticles, getCategoryBadgeClass } from '../../lib/utils'

export default function BlogPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [articles, setArticles] = useState([])
  const [filteredArticles, setFilteredArticles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  
  // États des filtres
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const articlesPerPage = 9

  // Categories
  const categories = [
    { id: 'all', name: 'Tous', count: articles.length },
    { id: 'news', name: 'News', count: articles.filter(a => a.category === 'news').length },
    { id: 'gaming', name: 'Gaming', count: articles.filter(a => a.category === 'gaming').length },
    { id: 'apps', name: 'Apps', count: articles.filter(a => a.category === 'apps').length },
    { id: 'tutorials', name: 'Tutoriels', count: articles.filter(a => a.category === 'tutorials').length }
  ]

  // Charger les articles initiaux
  useEffect(() => {
    loadInitialArticles()
  }, [])

  // Mettre à jour les URL params quand les filtres changent
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (selectedCategory !== 'all') params.set('category', selectedCategory)
    if (searchQuery) params.set('search', searchQuery)
    if (sortBy !== 'newest') params.set('sort', sortBy)
    
    const newUrl = params.toString() ? `/blog?${params.toString()}` : '/blog'
    window.history.replaceState(null, '', newUrl)
  }, [selectedCategory, searchQuery, sortBy])

  // Lire les paramètres d'URL au chargement
  useEffect(() => {
    const category = searchParams.get('category') || 'all'
    const search = searchParams.get('search') || ''
    const sort = searchParams.get('sort') || 'newest'
    
    setSelectedCategory(category)
    setSearchQuery(search)
    setSortBy(sort)
  }, [searchParams])

  // Filtrer et trier les articles
  useEffect(() => {
    if (articles.length === 0) return
    
    let filtered = [...articles]
    
    // Filtrer par catégorie
    if (selectedCategory !== 'all') {
      filtered = filterByCategory(filtered, selectedCategory)
    }
    
    // Filtrer par recherche
    if (searchQuery) {
      filtered = searchArticles(filtered, searchQuery)
    }
    
    // Trier
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.publishedAt) - new Date(a.publishedAt)
        case 'oldest':
          return new Date(a.publishedAt) - new Date(b.publishedAt)
        case 'popular':
          return (b.views + b.likes * 10) - (a.views + a.likes * 10)
        case 'trending':
          const scoreA = calculateTrendingScore(a)
          const scoreB = calculateTrendingScore(b)
          return scoreB - scoreA
        default:
          return new Date(b.publishedAt) - new Date(a.publishedAt)
      }
    })
    
    setFilteredArticles(filtered)
    setCurrentPage(1)
    setHasMore(filtered.length > articlesPerPage)
  }, [articles, selectedCategory, searchQuery, sortBy])

  const loadInitialArticles = () => {
    setIsLoading(true)
    setTimeout(() => {
      const allArticles = blogDB.getArticles()
      setArticles(allArticles)
      setIsLoading(false)
    }, 800)
  }

  const loadMoreArticles = () => {
    if (isLoadingMore || !hasMore) return
    
    setIsLoadingMore(true)
    setTimeout(() => {
      setCurrentPage(prev => prev + 1)
      setIsLoadingMore(false)
      
      // Vérifier s'il reste des articles à charger
      const startIndex = currentPage * articlesPerPage
      setHasMore(startIndex < filteredArticles.length)
    }, 600)
  }

  // Recherche avec debounce
  const handleSearch = useCallback(
    debounce((query) => {
      setSearchQuery(query)
    }, 500),
    []
  )

  const calculateTrendingScore = (article) => {
    const ageInHours = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60)
    const viewsScore = article.views || 0
    const likesScore = (article.likes || 0) * 10
    const freshnessScore = Math.max(0, 100 - ageInHours)
    return viewsScore + likesScore + freshnessScore
  }

  // Articles à afficher (pagination)
  const displayedArticles = filteredArticles.slice(0, currentPage * articlesPerPage)

  // Observer pour l'infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreArticles()
        }
      },
      { threshold: 0.1 }
    )

    const sentinel = document.getElementById('scroll-sentinel')
    if (sentinel) {
      observer.observe(sentinel)
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel)
      }
    }
  }, [hasMore, isLoadingMore])

  return (
    <MainLayout>
      {/* Header avec recherche et filtres */}
      <section className="py-12 bg-gradient-to-br from-primary-50 to-cyan-50 dark:from-dark-200 dark:to-dark-300">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog BujaDevil</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Découvrez tous mes articles, tutoriels et analyses
            </p>
          </div>

          {/* Barre de recherche */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher des articles..."
                defaultValue={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
          </div>

          {/* Filtres et tris */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between max-w-6xl mx-auto">
            {/* Catégories */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-300 border border-gray-300 dark:border-dark-400'
                  }`}
                >
                  {category.name}
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                    selectedCategory === category.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 dark:bg-dark-400 text-gray-600 dark:text-gray-400'
                  }`}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Tri */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Trier par:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-200 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              >
                <option value="newest">Plus récent</option>
                <option value="oldest">Plus ancien</option>
                <option value="popular">Plus populaire</option>
                <option value="trending">Tendances</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Résultats */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Stats des résultats */}
          {!isLoading && (
            <div className="mb-8 flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-400">
                {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} trouvé{filteredArticles.length !== 1 ? 's' : ''}
                {selectedCategory !== 'all' && ` dans ${categories.find(c => c.id === selectedCategory)?.name}`}
                {searchQuery && ` pour "${searchQuery}"`}
              </p>
              
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                  className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          )}

          {/* Grille d'articles */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner />
            </div>
          ) : displayedArticles.length > 0 ? (
            <>
              <div className="article-grid mb-12">
                {displayedArticles.map(article => (
                  <ArticleCard 
                    key={article.id} 
                    article={article}
                    onLike={loadInitialArticles}
                    onBookmark={loadInitialArticles}
                  />
                ))}
              </div>

              {/* Infinite scroll sentinel */}
              <div id="scroll-sentinel" className="h-10 flex justify-center items-center">
                {isLoadingMore && <LoadingSpinner />}
                {!hasMore && displayedArticles.length > 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    🎉 Vous avez vu tous les articles !
                  </p>
                )}
              </div>
            </>
          ) : (
            <EmptyState 
              message={
                searchQuery 
                  ? `Aucun article trouvé pour "${searchQuery}"`
                  : selectedCategory !== 'all'
                  ? `Aucun article dans la catégorie ${categories.find(c => c.id === selectedCategory)?.name}`
                  : "Aucun article publié pour le moment"
              }
              action={
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('all')
                    }}
                    className="btn-primary"
                  >
                    Voir tous les articles
                  </button>
                  {blogDB.getCurrentUser()?.role === 'admin' && (
                    <a href="/admin" className="btn-secondary">
                      Créer un article
                    </a>
                  )}
                </div>
              }
            />
          )}

          {/* Bouton de chargement manuel (fallback) */}
          {hasMore && !isLoadingMore && (
            <div className="text-center mt-8 lg:hidden">
              <button
                onClick={loadMoreArticles}
                className="btn-primary"
                disabled={isLoadingMore}
              >
                Charger plus d'articles
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Section de recherche avancée */}
      {!isLoading && displayedArticles.length > 0 && (
        <section className="py-12 bg-gray-50 dark:bg-dark-200 border-t border-gray-200 dark:border-dark-300">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-4">Vous ne trouvez pas ce que vous cherchez ?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Essayez d'autres mots-clés ou parcourez les catégories
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {['Next.js', 'React', 'JavaScript', 'Gaming', 'Mobile', 'Web'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag)
                      setSelectedCategory('all')
                    }}
                    className="badge bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 hover:bg-primary-200 dark:hover:bg-primary-800/30 transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </MainLayout>
  )
}
