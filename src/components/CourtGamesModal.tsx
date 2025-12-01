import { useState, useEffect } from 'react';
import { Court, Game } from '@/types';
import Modal from './Modal';
import { useAuthStore } from '@/store/authStore';
import { gameApi } from '@/apis/gameApi';
import { useGameStore } from '@/store/gameStore';

interface CourtGamesModalProps {
  court: Court | null;
  games: Game[];
  onClose: () => void;
  onCreateGame: () => void;
}

export default function CourtGamesModal({
  court,
  games,
  onClose,
  onCreateGame,
}: CourtGamesModalProps) {
  const { user } = useAuthStore();
  const { updateGame } = useGameStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const courtGames = court ? games.filter((game) => game.courtId === court.courtId) : [];

  const handleJoinGame = async (gameId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await gameApi.joinGame(gameId);
      updateGame(gameId, response);
      alert('게임에 참여했습니다!');
    } catch (err: any) {
      setError(err.response?.data?.message || '참여에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGame = async (gameId: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    setLoading(true);
    setError(null);

    try {
      await gameApi.deleteGame(gameId);
      alert('게임이 삭제되었습니다.');
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.message || '삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (court) {
      setError(null);
    }
  }, [court]);

  if (!court) return null;

  return (
    <Modal isOpen={!!court} onClose={onClose} title={court.courtName}>
      <div className="space-y-4">
        {/* 농구장 정보 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">{court.isIndoor ? '🏢 실내' : '🌤️ 실외'}</span>
            <span className="text-sm text-gray-600">게임 {courtGames.length}개</span>
          </div>
        </div>

        {/* 게임 리스트 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">진행 중인 게임</h3>

          {courtGames.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">아직 게임이 없습니다</p>
              <button onClick={onCreateGame} className="btn-primary">
                첫 게임 만들기
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {courtGames.map((game) => {
                const isHost = user?.name === game.hostName;
                const isFull = game.currentPlayers >= game.maxPlayers;
                const canJoin = !isHost && !isFull && game.status === '모집_중';

                return (
                  <div
                    key={game.gameId}
                    className="border border-gray-200 rounded-lg p-3 hover:border-orange-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              game.status === '모집_중'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {game.status === '모집_중' ? '모집 중' : game.status}
                          </span>
                          <span className="text-xs text-gray-600">
                            {game.currentPlayers} / {game.maxPlayers}명
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 font-medium">
                          {new Date(game.scheduledTime).toLocaleString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {game.hostName && (
                          <p className="text-xs text-gray-500 mt-1">호스트: {game.hostName}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {isHost ? (
                          <button
                            onClick={() => handleDeleteGame(game.gameId)}
                            disabled={loading}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-xs font-semibold rounded transition-colors"
                          >
                            삭제
                          </button>
                        ) : canJoin ? (
                          <button
                            onClick={() => handleJoinGame(game.gameId)}
                            disabled={loading}
                            className="px-3 py-1 btn-primary text-xs disabled:bg-gray-400"
                          >
                            참여
                          </button>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
                            {isFull ? '마감' : '참여중'}
                          </span>
                        )}
                      </div>
                    </div>

                    {game.playerNames.length > 0 && (
                      <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                        참가자: {game.playerNames.join(', ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="flex gap-2 pt-2">
          {courtGames.length > 0 && (
            <button onClick={onCreateGame} className="flex-1 btn-primary">
              새 게임 만들기
            </button>
          )}
          <button onClick={onClose} className="flex-1 btn-secondary">
            닫기
          </button>
        </div>
      </div>
    </Modal>
  );
}
