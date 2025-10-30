import { NextResponse } from 'next/server'
import blogDB from '../../../data/content'
import { generateId } from '../../lib/utils'

// GET /api/comments - Récupérer les commentaires d'un article
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')
    const limit = parseInt(searchParams.get('limit')) || 50

    if (!articleId) {
      return NextResponse.json(
        { error: 'ID d\'article requis' },
        { status: 400 }
      )
    }

    const comments = blogDB.getArticleComments(articleId).slice(0, limit)
    
    return NextResponse.json({
      success: true,
      data: comments,
      total: comments.length
    })
  } catch (error) {
    console.error('Comments API Error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST /api/comments - Créer un nouveau commentaire
export async function POST(request) {
  try {
    const body = await request.json()
    const { articleId, content, parentId = null } = body

    // Validation basique
    if (!articleId || !content) {
      return NextResponse.json(
        { error: 'ID d\'article et contenu requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'article existe
    const article = blogDB.loadData().articles.find(a => a.id === articleId)
    if (!article) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si l'utilisateur est connecté
    const currentUser = blogDB.getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Connectez-vous pour commenter' },
        { status: 401 }
      )
    }

    // Créer le commentaire
    const commentResult = await blogDB.createComment({
      articleId,
      content,
      parentId
    }, currentUser.id)

    if (!commentResult.success) {
      return NextResponse.json(
        { error: commentResult.error },
        { status: 400 }
      )
    }

    // Créer une notification pour l'admin
    createAdminNotification({
      type: 'new_comment',
      title: 'Nouveau commentaire',
      message: `${currentUser.name} a commenté sur "${article.title}"`,
      link: `/blog/${article.slug}#comments`,
      relatedId: commentResult.comment.id
    })

    // Si c'est une réponse à un commentaire, notifier l'auteur du commentaire parent
    if (parentId) {
      const parentComment = blogDB.loadData().comments.find(c => c.id === parentId)
      if (parentComment && parentComment.authorId !== currentUser.id) {
        createUserNotification(parentComment.authorId, {
          type: 'comment_reply',
          title: 'Réponse à votre commentaire',
          message: `${currentUser.name} a répondu à votre commentaire`,
          link: `/blog/${article.slug}#comment-${commentResult.comment.id}`,
          relatedId: commentResult.comment.id
        })
      }
    }

    return NextResponse.json({
      success: true,
      comment: commentResult.comment
    })
  } catch (error) {
    console.error('Comments API POST Error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT /api/comments - Mettre à jour un commentaire (like, etc.)
export async function PUT(request) {
  try {
    const body = await request.json()
    const { commentId, action, content } = body

    if (!commentId || !action) {
      return NextResponse.json(
        { error: 'ID de commentaire et action requis' },
        { status: 400 }
      )
    }

    const currentUser = blogDB.getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const data = blogDB.loadData()
    const comment = data.comments.find(c => c.id === commentId)
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Commentaire non trouvé' },
        { status: 404 }
      )
    }

    switch (action) {
      case 'like':
        // Vérifier si l'utilisateur a déjà liké
        const existingLike = data.commentLikes?.find(
          cl => cl.commentId === commentId && cl.userId === currentUser.id
        )

        if (existingLike) {
          // Retirer le like
          data.commentLikes = data.commentLikes.filter(
            cl => !(cl.commentId === commentId && cl.userId === currentUser.id)
          )
          comment.likes = Math.max(0, (comment.likes || 0) - 1)
        } else {
          // Ajouter le like
          if (!data.commentLikes) data.commentLikes = []
          data.commentLikes.push({
            id: generateId(),
            commentId,
            userId: currentUser.id,
            createdAt: new Date().toISOString()
          })
          comment.likes = (comment.likes || 0) + 1

          // Notifier l'auteur du commentaire (sauf si c'est l'utilisateur actuel)
          if (comment.authorId !== currentUser.id) {
            createUserNotification(comment.authorId, {
              type: 'comment_like',
              title: 'Votre commentaire a été aimé',
              message: `${currentUser.name} a aimé votre commentaire`,
              link: `/blog/${data.articles.find(a => a.id === comment.articleId)?.slug}#comment-${commentId}`,
              relatedId: commentId
            })
          }
        }
        break

      case 'update':
        // Vérifier que l'utilisateur est l'auteur du commentaire
        if (comment.authorId !== currentUser.id && currentUser.role !== 'admin') {
          return NextResponse.json(
            { error: 'Non autorisé' },
            { status: 403 }
          )
        }

        if (!content) {
          return NextResponse.json(
            { error: 'Contenu requis' },
            { status: 400 }
          )
        }

        comment.content = content
        comment.updatedAt = new Date().toISOString()
        comment.edited = true
        break

      default:
        return NextResponse.json(
          { error: 'Action non reconnue' },
          { status: 400 }
        )
    }

    blogDB.saveData(data)

    return NextResponse.json({
      success: true,
      comment
    })
  } catch (error) {
    console.error('Comments API PUT Error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE /api/comments - Supprimer un commentaire
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('id')

    if (!commentId) {
      return NextResponse.json(
        { error: 'ID de commentaire requis' },
        { status: 400 }
      )
    }

    const currentUser = blogDB.getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const data = blogDB.loadData()
    const commentIndex = data.comments.findIndex(c => c.id === commentId)
    
    if (commentIndex === -1) {
      return NextResponse.json(
        { error: 'Commentaire non trouvé' },
        { status: 404 }
      )
    }

    const comment = data.comments[commentIndex]

    // Vérifier les permissions
    if (comment.authorId !== currentUser.id && currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Supprimer le commentaire
    data.comments.splice(commentIndex, 1)

    // Supprimer les likes associés
    if (data.commentLikes) {
      data.commentLikes = data.commentLikes.filter(cl => cl.commentId !== commentId)
    }

    blogDB.saveData(data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Comments API DELETE Error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// Fonctions de notification
function createAdminNotification(notificationData) {
  const data = blogDB.loadData()
  const adminUser = data.users.find(u => u.role === 'admin')
  
  if (adminUser) {
    createUserNotification(adminUser.id, notificationData)
  }
}

function createUserNotification(userId, notificationData) {
  const data = blogDB.loadData()
  
  if (!data.notifications) {
    data.notifications = []
  }

  const notification = {
    id: generateId(),
    userId,
    ...notificationData,
    read: false,
    createdAt: new Date().toISOString()
  }

  data.notifications.unshift(notification)
  blogDB.saveData(data)
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
