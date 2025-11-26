import { useState } from 'react';
import { Game } from '@/types';
import { gameApi } from '@/apis/gameApi';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import Modal from './Modal';

interface GameModalProps {
  game: Game | null;
  onClose: () => void;
}

export default function GameModal({ game, onClose }: GameModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { updateGame } = useGameStore();

  if (!game) return null;

  const isCreator = user?.id === game.creator_id;
  const isFull = game.current_players >= game.max_players;
  const canJoin = !isCreator && !isFull && game.status === 'recruiting';

  const handleJoin = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await gameApi.joinGame(game.id);
      if (response.success && response.data) {
        updateGame(game.id, response.data);
        alert('게임에 참여했습니다!');
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '참여에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    setLoading(true);
    setError(null);

    try {
      const response = await gameApi.deleteGame(game.id);
      if (response.success) {
        alert('게임이 삭제되었습니다.');
        onClose();
        window.location.reload(); // 간단하게 새로고침
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={!!game} onClose={onClose} title={game.title}>
      <div className="space-y-4">
        {/* 상태 배지 */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              game.status === 'recruiting'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {game.status === 'recruiting' ? '모집 중' : '마감'}
          </span>
          <span className="text-sm text-gray-600">
            {game.current_players} / {game.max_players}명
          </span>
        </div>

        {/* 게임 정보 */}
        <div className="space-y-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">설명</h3>
            <p className="text-gray-600">{game.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700">일시</h3>
            <p className="text-gray-600">
              {game.date} {game.time}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700">생성 일시</h3>
            <p className="text-gray-600">
              {new Date(game.created_at).toLocaleString('ko-KR')}
            </p>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-2 pt-4">
          {isCreator ? (
            <>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                {loading ? '처리 중...' : '게임 삭제'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 btn-secondary"
              >
                닫기
              </button>
            </>
          ) : canJoin ? (
            <>
              <button
                onClick={handleJoin}
                disabled={loading}
                className="flex-1 btn-primary disabled:bg-gray-400"
              >
                {loading ? '처리 중...' : '참여하기'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 btn-secondary"
              >
                취소
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              닫기
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

