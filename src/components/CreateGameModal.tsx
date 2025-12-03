import { useState } from 'react';
import { CreateGameData } from '@/apis/gameApi';
import Modal from './Modal';
import { useCourt } from '@/hooks/useCourt';
import { useAuthStore } from '@/store/authStore';
import { useCreateGame } from '@/hooks/useGameMutations';

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: { latitude: number; longitude: number };
}

export default function CreateGameModal({ isOpen, onClose }: CreateGameModalProps) {
  const [error, setError] = useState<string | null>(null);
  const { courts, selectedCourt, setSelectedCourt } = useCourt();
  const { user, isAuthenticated } = useAuthStore();
  const createGameMutation = useCreateGame();

  // 날짜와 시간을 별도로 관리 (한국 시간 기준)
  const [date, setDate] = useState(() => {
    const today = new Date();
    // 로컬 시간 기준으로 YYYY-MM-DD 포맷
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [time, setTime] = useState(() => {
    const now = new Date();
    // 로컬 시간 기준으로 HH:MM 포맷
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
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

    setError(null);

    try {
      // 유효성 검사
      if (!selectedCourt?.courtId) {
        setError('농구장을 선택해주세요.');
        return;
      }

      if (!formData.maxPlayers || formData.maxPlayers < 2) {
        setError('최대 인원은 2명 이상이어야 합니다.');
        return;
      }

      // 날짜와 시간을 UTC로 변환해서 전송
      // 사용자가 입력한 한국 시간을 UTC로 변환
      const localDateTime = new Date(`${date}T${time}:00`);
      const scheduledTime = localDateTime.toISOString(); // UTC 형식

      const gameData: CreateGameData = {
        courtId: selectedCourt.courtId,
        creatorUserId: user.id,
        maxPlayers: formData.maxPlayers,
        scheduledTime,
      };

      await createGameMutation.mutateAsync(gameData);
      alert('게임이 생성되었습니다!');
      onClose();

      // 폼 초기화
      setFormData({
        courtId: 0,
        creatorUserId: 0,
        maxPlayers: 0,
        scheduledTime: '',
      });
      // 날짜와 시간도 초기화 (한국 시간 기준)
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const hours = String(today.getHours()).padStart(2, '0');
      const minutes = String(today.getMinutes()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
      setTime(`${hours}:${minutes}`);
    } catch (err: any) {
      setError(err.response?.data?.message || '게임 생성에 실패했습니다.');
    }
  };

  const loading = createGameMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="새 게임 만들기">
      {!isAuthenticated && (
        <div className="p-3 mb-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">⚠️ 로그인이 필요합니다.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700">농구장 선택</label>
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
            <label className="block mb-1 text-sm font-semibold text-gray-700">날짜</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">시간</label>
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
          <label className="block mb-1 text-sm font-semibold text-gray-700">최대 인원</label>
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
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
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
