import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart, MessageCircle, UserPlus, UserCheck } from 'lucide-react'
import Avatar from '../ui/Avatar'
import { relativeTime } from '../../utils/formatDate'

const TYPE_CONFIG = {
  FOLLOW_REQUEST: {
    icon: UserPlus,
    color: 'text-accent',
    bg: 'bg-accent/10',
    textKey: 'notifications.sentFollowRequest',
  },
  NEW_FOLLOWER: {
    icon: UserPlus,
    color: 'text-accent',
    bg: 'bg-accent/10',
    textKey: 'notifications.startedFollowingYou',
  },
  FOLLOW_ACCEPTED: {
    icon: UserCheck,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    textKey: 'notifications.acceptedFollowRequest',
  },
  REPLY: {
    icon: MessageCircle,
    color: 'text-accent',
    bg: 'bg-accent/10',
    textKey: 'notifications.repliedToThread',
  },
  LIKE_THREAD: {
    icon: Heart,
    color: 'text-like',
    bg: 'bg-like/10',
    textKey: 'notifications.likedYourThread',
  },
  LIKE_REPLY: {
    icon: Heart,
    color: 'text-like',
    bg: 'bg-like/10',
    textKey: 'notifications.likedYourReply',
  },
}

export default function NotificationItem({ notification, actor, onMarkRead }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.FOLLOW_REQUEST
  const Icon = config.icon
  const timeAgoStr = relativeTime(notification.createdAt)

  const handleClick = () => {
    // Mark as read
    if (!notification.isRead) {
      onMarkRead?.(notification.id)
    }

    // Navigate based on type
    switch (notification.type) {
      case 'FOLLOW_REQUEST':
        navigate('/follow-requests')
        break
      case 'NEW_FOLLOWER':
        navigate(`/user/${notification.actorId}`)
        break
      case 'FOLLOW_ACCEPTED':
        navigate(`/user/${notification.actorId}`)
        break
      case 'REPLY':
      case 'LIKE_THREAD':
        navigate(`/thread/${notification.entityId}`)
        break
      case 'LIKE_REPLY':
        // entityId is the reply — navigate to the thread containing it
        // For now, navigate to the actor's profile or just mark read
        navigate(`/thread/${notification.meta?.threadId || notification.entityId}`)
        break
      default:
        break
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-start gap-3 px-4 py-3 border-b border-border
                  text-left cursor-pointer transition-colors
                  ${notification.isRead ? 'hover:bg-bg-hover' : 'bg-accent/5 hover:bg-accent/10'}`}
    >
      {/* Type icon */}
      <div className={`mt-1 p-2 rounded-full ${config.bg}`}>
        <Icon size={16} className={config.color} />
      </div>

      {/* Avatar */}
      <Avatar
        src={actor?.avatarUrl}
        username={actor?.username}
        size="sm"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary">
          <span className="font-semibold">{actor?.username || t('notifications.someone')}</span>
          {' '}
          {t(config.textKey)}
        </p>
        <p className="text-xs text-text-muted mt-0.5">{timeAgoStr}</p>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <div className="mt-2 w-2 h-2 rounded-full bg-gradient-brand shrink-0" />
      )}
    </button>
  )
}
