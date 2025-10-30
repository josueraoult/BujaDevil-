import { NextResponse } from 'next/server'
import blogDB from '../../../data/content'
import { validateAdminLogin, generateId } from '../../lib/utils'

// GET /api/admin - Récupérer les statistiques et données admin
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    // Vérifier l'authentification
    if (!token || !verifyAuthToken(token)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    switch (action) {
      case 'stats':
        const stats = blogDB.getStats()
        return NextResponse.json({ success: true, data: stats })

      case 'articles':
        const articles = blogDB.getArticles({ status: 'all' })
        return NextResponse.json({ success: true, data: articles })

      case 'users':
        const data = blogDB.loadData()
        const users = data.users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }))
        return NextResponse.json({ success: true, data: users })

      case 'comments':
        const commentsData = blogDB.loadData()
        const comments = commentsData.comments.map(comment => ({
          ...comment,
          article: commentsData.articles.find(a => a.id === comment.articleId)?.title
        }))
        return NextResponse.json({ success: true, data: comments })

      default:
        const allStats = blogDB.getStats()
        const recentArticles = blogDB.getArticles({ limit: 5 })
        const recentComments = blogDB.loadData().comments.slice(0, 5)
        
        return NextResponse.json({
          success: true,
          data: {
            stats: allStats,
            recentArticles,
            recentComments
          }
        })
    }
  } catch (error) {
    console.error('Admin API Error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST /api/admin - Actions d'administration
export async function POST(request) {
  try {
    const body = await request.json()
    const { action, data, token } = body

    // Vérifier l'authentification
    if (!token || !verifyAuthToken(token)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const currentUser = getCurrentUserFromToken(token)
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 401 }
      )
    }

    switch (action) {
      case 'login':
        const { username, password } = data
        const validation = validateAdminLogin(username, password)
        
        if (!validation.isValid) {
          return NextResponse.json(
            { success: false, errors: validation.errors },
            { status: 401 }
          )
        }

        // Créer un token d'authentification
        const authToken = generateAuthToken(username)
        return NextResponse.json({
          success: true,
          token: authToken,
          user: currentUser
        })

      case 'create-article':
        if (currentUser.role !== 'admin') {
          return NextResponse.json(
            { error: 'Permissions insuffisantes' },
            { status: 403 }
          )
        }

        const articleResult = await blogDB.createArticle(data, currentUser.id)
        if (!articleResult.success) {
          return NextResponse.json(
            { error: articleResult.error },
            { status: 400 }
          )
        }

        return NextResponse.json({
          success: true,
          article: articleResult.article
        })

      case 'update-article':
        if (currentUser.role !== 'admin') {
          return NextResponse.json(
            { error: 'Permissions insuffisantes' },
            { status: 403 }
          )
        }

        const updateResult = await blogDB.updateArticle(
          data.id,
          data.updates,
          currentUser.id
        )

        if (!updateResult.success) {
          return NextResponse.json(
            { error: updateResult.error },
            { status: 400 }
          )
        }

        return NextResponse.json({
          success: true,
          article: updateResult.article
        })

      case 'delete-article':
        if (currentUser.role !== 'admin') {
          return NextResponse.json(
            { error: 'Permissions insuffisantes' },
            { status: 403 }
          )
        }

        const deleteResult = await blogDB.deleteArticle(data.articleId, currentUser.id)
        if (!deleteResult.success) {
          return NextResponse.json(
            { error: deleteResult.error },
            { status: 400 }
          )
        }

        return NextResponse.json({ success: true })

      case 'update-profile':
        const profileResult = await blogDB.updateUserProfile(currentUser.id, data)
        if (!profileResult.success) {
          return NextResponse.json(
            { error: profileResult.error },
            { status: 400 }
          )
        }

        return NextResponse.json({
          success: true,
          user: profileResult.user
        })

      case 'moderate-comment':
        if (currentUser.role !== 'admin') {
          return NextResponse.json(
            { error: 'Permissions insuffisantes' },
            { status: 403 }
          )
        }

        const dbData = blogDB.loadData()
        const commentIndex = dbData.comments.findIndex(c => c.id === data.commentId)
        
        if (commentIndex === -1) {
          return NextResponse.json(
            { error: 'Commentaire non trouvé' },
            { status: 404 }
          )
        }

        dbData.comments[commentIndex].isApproved = data.approve
        dbData.comments[commentIndex].moderatedBy = currentUser.id
        dbData.comments[commentIndex].moderatedAt = new Date().toISOString()

        blogDB.saveData(dbData)
        return NextResponse.json({ success: true })

      case 'delete-comment':
        if (currentUser.role !== 'admin') {
          return NextResponse.json(
            { error: 'Permissions insuffisantes' },
            { status: 403 }
          )
        }

        const commentData = blogDB.loadData()
        commentData.comments = commentData.comments.filter(c => c.id !== data.commentId)
        blogDB.saveData(commentData)

        return NextResponse.json({ success: true })

      case 'export-data':
        if (currentUser.role !== 'admin') {
          return NextResponse.json(
            { error: 'Permissions insuffisantes' },
            { status: 403 }
          )
        }

        const exportData = blogDB.exportData()
        return NextResponse.json({
          success: true,
          data: exportData,
          exportedAt: new Date().toISOString()
        })

      case 'import-data':
        if (currentUser.role !== 'admin') {
          return NextResponse.json(
            { error: 'Permissions insuffisantes' },
            { status: 403 }
          )
        }

        const importResult = blogDB.importData(data)
        if (!importResult.success) {
          return NextResponse.json(
            { error: importResult.error },
            { status: 400 }
          )
        }

        return NextResponse.json({ success: true })

      default:
        return NextResponse.json(
          { error: 'Action non reconnue' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Admin API POST Error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT /api/admin - Mise à jour de données
export async function PUT(request) {
  try {
    const body = await request.json()
    const { action, data, token } = body

    if (!token || !verifyAuthToken(token)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const currentUser = getCurrentUserFromToken(token)
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    switch (action) {
      case 'update-settings':
        const dbData = blogDB.loadData()
        dbData.settings = { ...dbData.settings, ...data }
        blogDB.saveData(dbData)

        return NextResponse.json({ success: true, settings: dbData.settings })

      case 'bulk-actions':
        // Actions en masse sur les articles
        if (data.articles && data.action === 'publish') {
          const articlesData = blogDB.loadData()
          data.articles.forEach(articleId => {
            const article = articlesData.articles.find(a => a.id === articleId)
            if (article) {
              article.status = 'published'
              article.updatedAt = new Date().toISOString()
            }
          })
          blogDB.saveData(articlesData)
        }

        if (data.articles && data.action === 'unpublish') {
          const articlesData = blogDB.loadData()
          data.articles.forEach(articleId => {
            const article = articlesData.articles.find(a => a.id === articleId)
            if (article) {
              article.status = 'draft'
              article.updatedAt = new Date().toISOString()
            }
          })
          blogDB.saveData(articlesData)
        }

        if (data.articles && data.action === 'delete') {
          const articlesData = blogDB.loadData()
          articlesData.articles = articlesData.articles.filter(a => !data.articles.includes(a.id))
          // Supprimer aussi les commentaires associés
          articlesData.comments = articlesData.comments.filter(c => !data.articles.includes(c.articleId))
          blogDB.saveData(articlesData)
        }

        return NextResponse.json({ success: true })

      default:
        return NextResponse.json(
          { error: 'Action non reconnue' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Admin API PUT Error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin - Suppressions
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const resource = searchParams.get('resource')
    const id = searchParams.get('id')
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token || !verifyAuthToken(token)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const currentUser = getCurrentUserFromToken(token)
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    switch (resource) {
      case 'user':
        const usersData = blogDB.loadData()
        const userIndex = usersData.users.findIndex(u => u.id === id)
        
        if (userIndex === -1) {
          return NextResponse.json(
            { error: 'Utilisateur non trouvé' },
            { status: 404 }
          )
        }

        // Ne pas permettre la suppression de l'admin principal
        if (usersData.users[userIndex].username === 'root') {
          return NextResponse.json(
            { error: 'Impossible de supprimer le compte admin principal' },
            { status: 403 }
          )
        }

        usersData.users.splice(userIndex, 1)
        blogDB.saveData(usersData)
        return NextResponse.json({ success: true })

      case 'article':
        const deleteResult = await blogDB.deleteArticle(id, currentUser.id)
        if (!deleteResult.success) {
          return NextResponse.json(
            { error: deleteResult.error },
            { status: 400 }
          )
        }
        return NextResponse.json({ success: true })

      case 'comment':
        const commentsData = blogDB.loadData()
        commentsData.comments = commentsData.comments.filter(c => c.id !== id)
        blogDB.saveData(commentsData)
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json(
          { error: 'Ressource non reconnue' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Admin API DELETE Error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// Fonctions utilitaires d'authentification
function generateAuthToken(username) {
  const tokenData = {
    username,
    timestamp: Date.now(),
    expires: Date.now() + (24 * 60 * 60 * 1000) // 24 heures
  }
  return Buffer.from(JSON.stringify(tokenData)).toString('base64')
}

function verifyAuthToken(token) {
  try {
    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString())
    
    // Vérifier l'expiration
    if (Date.now() > tokenData.expires) {
      return false
    }

    // Vérifier que l'utilisateur existe et est admin
    const dbData = blogDB.loadData()
    const user = dbData.users.find(u => u.username === tokenData.username)
    
    return user && user.role === 'admin'
  } catch (error) {
    return false
  }
}

function getCurrentUserFromToken(token) {
  try {
    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString())
    const dbData = blogDB.loadData()
    const user = dbData.users.find(u => u.username === tokenData.username)
    
    if (!user) return null

    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    return null
  }
}

// OPTIONS pour CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
          }
