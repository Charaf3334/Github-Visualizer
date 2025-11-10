import { X, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'

interface MiniUser 
{
  login: string
  avatar_url: string
  url: string
}

interface UserListProps 
{
  title: string
  users: MiniUser[]
  onClose: () => void
  onSelect: (login: string) => void
  loading?: boolean
}

const UserList = ({title, users, onClose, onSelect, loading = false}: UserListProps) => {
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}>
      <div
        className="bg-[#111]/95 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto p-6 text-white relative animate-slideUp"
        onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
          <X size={20} className='cursor-pointer'/>
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-center tracking-wide">
          {title}
        </h2>
        {loading 
        ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={40} className="animate-spin text-white/10 mb-4" />
            <p className="text-gray-400">Loading users...</p>
          </div>
        ) 
        : 
        users.length 
        ? (
          <div className="space-y-3">
            {users.map((u) => (
              <Link to={`/user/${u.login}`} className='flex '>
                <motion.button
                  initial={{opacity:0, y:0}} animate={{opacity:1, y:0}} transition={{duration: 1}}
                  key={u.login}
                  onClick={() => onSelect(u.login)}
                  className="flex cursor-pointer items-center gap-4 w-full p-3 rounded-xl transition bg-[#1a1a1a] hover:bg-[#242424] border border-transparent hover:border-gray-700 text-left">
                  <img
                    src={u.avatar_url}
                    alt={u.login}
                    className="w-10 h-10 rounded-full border border-gray-700"/>
                  <div>
                    <span className="font-semibold text-white">{u.login.length > 32 ? u.login.slice(0, 30) + '...' : u.login}</span>
                    <p className="text-xs text-gray-400 lora-italic">@{u.login}</p>
                  </div>
                </motion.button>
              </Link>
            ))}
          </div>
        ) 
        : (
          <p className="text-gray-400 text-center py-12">No users found</p>
        )}
      </div>
      <style>
        {`
        @keyframes slideUp {
          from {transform: translateY(20px); opacity: 0;}
          to {transform: translateY(0); opacity: 1;}
      }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
      }
      `}
      </style>
    </div>
  )
}

export default UserList