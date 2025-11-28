import { useAuthStore } from '@/store/authStore';
import { Link, useNavigate } from 'react-router-dom';

import { CgProfile } from 'react-icons/cg';

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="absolute top-0 left-0 right-0 bg-white shadow-md p-4 flex items-center justify-between z-10">
      <div>
        <h1 className="text-xl font-bold text-gray-900">🏀 Streetball</h1>
        <p className="text-sm text-gray-600">{user?.name}님 환영합니다</p>
      </div>
      <div className="flex items-center gap-8">
        <Link to="/mypage" className="text-sm text-gray-600 hover:text-gray-900">
          <CgProfile className="w-6 h-6" />
        </Link>
        <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-gray-900">
          로그아웃
        </button>
      </div>
    </div>
  );
}
