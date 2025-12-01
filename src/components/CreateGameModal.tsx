import { useState } from 'react';
import { gameApi, CreateGameData } from '@/apis/gameApi';
import { useGameStore } from '@/store/gameStore';
import Modal from './Modal';
import { useCourt } from '@/hooks/useCourt';
import { useAuthStore } from '@/store/authStore';

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: { latitude: number; longitude: number };
}

export default function CreateGameModal({ isOpen, onClose }: CreateGameModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addGame } = useGameStore();
  const { courts, selectedCourt, setSelectedCourt } = useCourt();
  const { user, isAuthenticated } = useAuthStore();
  // 날짜와 시간을 별도로 관리
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  });
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:MM
  });

  const [formData, setFormData] = useState<CreateGameData>({
    courtId: 0,
    creatorUserId: 0,
    maxPlayers: 0,
    scheduledTime: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 로그인 확인
    if (!user || !isAuthenticated) {
      setError('로그인이 필요합니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 날짜와 시간을 ISO 8601 형식으로 결합 (밀리초 및 타임존 포함)
      const scheduledDateTime = new Date(`${date}T${time}:00`);
      const scheduledTime = scheduledDateTime.toISOString(); // "2025-12-01T14:50:00.000Z"

      const gameData = {
        ...formData,
        courtId: selectedCourt?.courtId || 0,
        creatorUserId: user.id,
        scheduledTime,
      };

      const response = await gameApi.createGame(gameData);
      console.log('response', response);
      if (response) {
        addGame(response);
        alert('게임이 생성되었습니다!');
        onClose();
        // 폼 초기화
        setFormData({
          courtId: 0,
          creatorUserId: 0,
          maxPlayers: 0,
          scheduledTime: '',
        });
        // 날짜와 시간도 초기화
        const today = new Date();
        setDate(today.toISOString().split('T')[0]);
        setTime(today.toTimeString().slice(0, 5));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '게임 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="새 게임 만들기">
      {!isAuthenticated && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">⚠️ 로그인이 필요합니다.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">농구장 선택</label>
          <select
            value={selectedCourt?.courtId || ''}
            onChange={(e) => {
              const court = courts?.find((c) => c.courtId === Number(e.target.value));
              setSelectedCourt(court || null);
            }}
            className="input-field"
            required
          >
            <option value="">농구장을 선택하세요</option>
            {courts?.map((court) => (
              <option key={court.courtId} value={court.courtId}>
                {court.courtName} {court.isIndoor ? '(실내)' : '(실외)'}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">날짜</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">시간</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="input-field"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">최대 인원</label>
          <input
            type="number"
            value={formData.maxPlayers}
            onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) })}
            className="input-field"
            min={2}
            max={20}
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={loading || !isAuthenticated}
            className="flex-1 btn-primary disabled:bg-gray-400"
          >
            {loading ? '생성 중...' : '게임 만들기'}
          </button>
          <button type="button" onClick={onClose} className="flex-1 btn-secondary">
            취소
          </button>
        </div>
      </form>
    </Modal>
  );
}
