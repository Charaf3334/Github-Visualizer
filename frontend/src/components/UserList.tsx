import { X } from 'lucide-react'

interface MiniUser 
{
  login: string
  avatar_url: string
  html_url: string
}

interface UserListProps 
{
  title: string
  users: MiniUser[]
  onClose: () => void
  onSelect: (login: string) => void
}

const UserList = ({ title, users, onClose, onSelect }: UserListProps) => {
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#111]/95 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto p-6 text-white relative animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X size={20} />
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-center tracking-wide">
          {title}
        </h2>
        {users.length ? (
          <div className="space-y-3">
            {users.map((u) => (
              <button
                key={u.login}
                onClick={() => onSelect(u.login)}
                className="flex cursor-pointer items-center gap-4 w-full p-3 rounded-xl transition bg-[#1a1a1a] hover:bg-[#242424] border border-transparent hover:border-gray-700 text-left"
              >
                <img
                  src={u.avatar_url}
                  alt={u.login}
                  className="w-10 h-10 rounded-full border border-gray-700"
                />
                <div>
                  <span className="font-semibold text-white">{u.login}</span>
                  <p className="text-xs text-gray-400">@{u.login}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-12">No users found</p>
        )}
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default UserList