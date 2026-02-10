import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Globe, Users, EyeOff } from 'lucide-react'
import { threadsAPI } from '../api/threads.api'
import { useAuth } from '../contexts/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import LikeButton from '../components/reactions/LikeButton'
import RepostButton from '../components/reactions/RepostButton'
import SaveButton from '../components/reactions/SaveButton'
import Button from '../components/ui/Button'
import { fullDateTime, timeAgo } from '../utils/formatDate'
import { sanitizeMediaUrl, safeOpenUrl, isAllowedUrl } from '../utils/sanitizeUrl'
import toast from 'react-hot-toast'
import { THREAD_MAX_LENGTH } from '../utils/constants'
import { useConfirm } from '../hooks/useConfirm'
import ConfirmDialog from '../components/ui/ConfirmDialog'

export default function ThreadDetailPage() {
  const { threadId } = useParams()
  const navigate = useNavigate()
  const { user: me } = useAuth()
  const { t } = useTranslation()
  const { confirm, confirmDialogProps } = useConfirm()

  useDocumentTitle('pageTitle.thread')

  const [thread, setThread] = useState(null)
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState('')
  const [posting, setPosting] = useState(false)

  const loadThread = async () => {
    setLoading(true)
    try {
      const { data } = await threadsAPI.getOne(threadId)
      setThread(data.thread)
      setReplies(data.replies)
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error(t('thread.threadNotFound'))
        navigate('/')
      } else if (err.response?.status === 403) {
        toast.error(t('thread.noAccessToThread'))
        navigate('/')
      } else {
        toast.error(t('thread.failedToLoadThread'))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadThread()
  }, [threadId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyContent.trim()) return

    setPosting(true)
    try {
      const { data } = await threadsAPI.reply(threadId, { content: replyContent.trim() })
      const newReply = {
        ...data.reply,
        author: { username: me.username, avatarUrl: me.avatarUrl },
      }
      setReplies((prev) => [...prev, newReply])
      setThread((prev) => ({ ...prev, repliesCount: (prev.repliesCount || 0) + 1 }))
      setReplyContent('')
      toast.success(t('thread.replyPostedToast'))
    } catch (err) {
      toast.error(err.response?.data?.message || t('thread.failedToReply'))
    } finally {
      setPosting(false)
    }
  }

  const handleDeleteReply = async (replyId) => {
    if (!(await confirm(t('thread.deleteThisReply')))) return
    try {
      await threadsAPI.removeReply(replyId)
      setReplies((prev) => prev.filter((r) => r.id !== replyId))
      setThread((prev) => ({ ...prev, repliesCount: Math.max(0, (prev.repliesCount || 1) - 1) }))
      toast.success(t('thread.replyDeleted'))
    } catch (err) {
      toast.error(err.response?.data?.message || t('thread.deleteFailed'))
    }
  }

  const handleDeleteThread = async () => {
    if (!(await confirm(t('thread.deleteThreadAndReplies')))) return
    try {
      await threadsAPI.remove(threadId)
      toast.success(t('thread.threadDeleted'))
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || t('thread.deleteFailed'))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={28} />
      </div>
    )
  }

  if (!thread) return null

  const threadAuthor = thread.author
  const isOwn = me?.id === thread.authorId

  return (
    <>
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-xl border-b border-border
                      flex items-center gap-4 px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-full hover:bg-bg-hover cursor-pointer"
          aria-label={t('common.goBack')}
        >
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <h2 className="text-xl font-bold text-text-primary">{t('thread.threadTitle')}</h2>
      </div>

      {/* Thread detail */}
      <div className="px-4 py-4 border-b border-border">
        {/* Author row */}
        <div className="flex items-center gap-3">
          <div
            className="cursor-pointer"
            onClick={() => navigate(`/user/${thread.authorId}`)}
          >
            <Avatar src={threadAuthor?.avatarUrl} username={threadAuthor?.username} size="md" />
          </div>
          <div className="flex-1">
            <span
              className="font-bold text-text-primary text-[15px] hover:underline cursor-pointer"
              onClick={() => navigate(`/user/${thread.authorId}`)}
            >
              {threadAuthor?.username || t('common.unknownUser')}
            </span>
          </div>
          {isOwn && (
            <button
              onClick={handleDeleteThread}
              className="p-2 rounded-full hover:bg-danger/10 text-text-muted
                         hover:text-danger cursor-pointer"
              aria-label={t('thread.delete')}
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>

        {/* Content */}
        <p className="text-text-primary text-[17px] leading-relaxed mt-3 whitespace-pre-wrap wrap-break-word">
          {thread.content}
        </p>

        {/* Media */}
        {thread.mediaUrls?.length > 0 && (
          <div className="mt-3 grid gap-2 grid-cols-1">
            {thread.mediaUrls.filter(isAllowedUrl).map((url, i) => (
              <img
                key={i}
                src={sanitizeMediaUrl(url)}
                alt={`${t('thread.media')} ${i + 1}`}
                className="rounded-xl border border-border object-cover w-full max-h-100
                           cursor-pointer hover:opacity-90"
                onClick={() => safeOpenUrl(sanitizeMediaUrl(url))}
              />
            ))}
          </div>
        )}

        {/* Date & visibility */}
        <div className="flex items-center gap-2 mt-3 text-text-muted text-sm">
          <span>{fullDateTime(thread.createdAt)}</span>
          <span>·</span>
          {thread.visibility === 'PUBLIC' ? (
            <span className="flex items-center gap-1">
              <Globe size={13} /> {t('thread.everyone')}
            </span>
          ) : thread.visibility === 'FOLLOWERS' ? (
            <span className="flex items-center gap-1 text-success">
              <Users size={13} /> {t('thread.followersOnly')}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-warning">
              <EyeOff size={13} /> {t('thread.onlyMe')}
            </span>
          )}
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-bold text-text-primary">{thread.repliesCount || 0}</span>
            <span className="text-text-muted">{t('thread.replies')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-bold text-text-primary">{thread.likesCount || 0}</span>
            <span className="text-text-muted">{t('thread.likes')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-bold text-text-primary">{thread.repostsCount || 0}</span>
            <span className="text-text-muted">{t('thread.reposts')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-2 pt-3 border-t border-border -ml-2">
          <LikeButton
            targetType="THREAD"
            targetId={thread.id}
            initialCount={thread.likesCount}
            initialLiked={thread.likedByMe}
          />
          <RepostButton
            threadId={thread.id}
            initialReposted={thread.repostedByMe}
            initialCount={thread.repostsCount}
          />
          <div className="ml-auto">
            <SaveButton
              threadId={thread.id}
              initialSaved={thread.savedByMe}
            />
          </div>
        </div>
      </div>

      {/* Reply compose */}
      <form onSubmit={handleReply} className="flex items-start gap-3 px-4 py-3 border-b border-border">
        <Avatar src={me?.avatarUrl} username={me?.username} size="sm" />
        <div className="flex-1">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder={t('thread.postYourReply')}
            maxLength={THREAD_MAX_LENGTH}
            rows={1}
            className="w-full bg-transparent text-text-primary placeholder-text-muted
                       resize-none outline-none text-[15px] py-2"
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = e.target.scrollHeight + 'px'
            }}
          />
        </div>
        <Button type="submit" size="sm" loading={posting} disabled={!replyContent.trim()}>
          {t('thread.replyButton')}
        </Button>
      </form>

      {/* Replies list */}
      {replies.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm">
          {t('thread.noRepliesYet')}
        </div>
      ) : (
        replies.map((reply) => {
          const replyAuthor = reply.author
          const isOwnReply = me?.id === reply.authorId
          return (
            <div
              key={reply.id}
              className="px-4 py-3 border-b border-border hover:bg-bg-hover/30 transition-colors"
            >
              <div className="flex gap-3">
                <div
                  className="cursor-pointer shrink-0"
                  onClick={() => navigate(`/user/${reply.authorId}`)}
                >
                  <Avatar src={replyAuthor?.avatarUrl} username={replyAuthor?.username} size="sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-bold text-text-primary text-sm hover:underline cursor-pointer"
                      onClick={() => navigate(`/user/${reply.authorId}`)}
                    >
                      {replyAuthor?.username || t('common.unknownUser')}
                    </span>
                    <span className="text-text-muted text-xs">{timeAgo(reply.createdAt)}</span>
                    {isOwnReply && (
                      <button
                        onClick={() => handleDeleteReply(reply.id)}
                        className="ml-auto p-1 rounded-full text-text-muted hover:text-danger
                                   hover:bg-danger/10 cursor-pointer"
                        aria-label={t('thread.delete')}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <p className="text-text-primary text-[14px] leading-relaxed mt-1
                                whitespace-pre-wrap wrap-break-word">
                    {reply.content}
                  </p>
                  <div className="mt-1.5 -ml-2">
                    <LikeButton
                      targetType="REPLY"
                      targetId={reply.id}
                      initialCount={reply.likesCount || 0}
                      initialLiked={reply.likedByMe}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })
      )}

      {/* Bottom padding for mobile nav */}
      <div className="h-20 md:h-0" />
    </div>
    <ConfirmDialog {...confirmDialogProps} />
    </>
  )
}
