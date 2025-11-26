import { useState } from 'react';
import { gameApi, CreateGameData } from '@/apis/gameApi';
import { useGameStore } from '@/store/gameStore';
import Modal from './Modal';

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: { latitude: number; longitude: number };
}

export default function CreateGameModal({
  isOpen,
  onClose,
  userLocation,
}: CreateGameModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addGame } = useGameStore();

  const [formData, setFormData] = useState<CreateGameData>({
    title: '',
    description: '',
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    date: '',
    time: '',
    max_players: 10,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await gameApi.createGame(formData);
      if (response.success && response.data) {
        addGame(response.data);
        alert('게임이 생성되었습니다!');
        onClose();
        // 폼 초기화
        setFormData({
          title: '',
          description: '',
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          date: '',
          time: '',
          max_players: 10,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '게임 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="새 게임 만들기">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            게임 제목
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="input-field"
            placeholder="예: 강남 3on3 농구"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            설명
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="input-field"
            rows={3}
            placeholder="게임에 대한 설명을 입력하세요"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              날짜
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              시간
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              className="input-field"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            최대 인원
          </label>
          <input
            type="number"
            value={formData.max_players}
            onChange={(e) =>
              setFormData({ ...formData, max_players: parseInt(e.target.value) })
            }
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
            disabled={loading}
            className="flex-1 btn-primary disabled:bg-gray-400"
          >
            {loading ? '생성 중...' : '게임 만들기'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 btn-secondary"
          >
            취소
          </button>
        </div>
      </form>
    </Modal>
  );
}

