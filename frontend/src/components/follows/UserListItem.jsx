import { useNavigate } from 'react-router-dom'
import Avatar from '../ui/Avatar'

export default function UserListItem({ user, extra }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/user/${user.id}`)}
      className="flex items-center gap-3 px-4 py-3 hover:bg-bg-hover/50 cursor-pointer transition-colors"
    >
      <Avatar src={user.avatarUrl} username={user.username} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-text-primary text-sm truncate">{user.username}</p>
      </div>
      {extra && <div className="shrink-0">{extra}</div>}
    </div>
  )
}
