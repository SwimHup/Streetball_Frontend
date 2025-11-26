import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useKakaoMap } from '@/hooks/useKakaoMap';
import { gameApi } from '@/apis/gameApi';
import { authApi } from '@/apis/authApi';
import GameModal from '@/components/GameModal';
import CreateGameModal from '@/components/CreateGameModal';

export default function MapPage() {
  const { user, logout, updateUserLocation } = useAuthStore();
  const { games, selectedGame, setGames, setSelectedGame } = useGameStore();
  const { location, error: locationError } = useGeolocation(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 기본 위치 (서울 시청)
  const defaultLocation = { latitude: 37.5665, longitude: 126.978 };
  const currentLocation = location || defaultLocation;

  const { mapRef, addMarkers } = useKakaoMap({
    center: currentLocation,
    level: 3,
  });

  // 위치 업데이트 및 근처 게임 가져오기
  useEffect(() => {
    if (!location) return;

    const updateLocation = async () => {
      try {
        await authApi.updateLocation(location.latitude, location.longitude);
        updateUserLocation(location.latitude, location.longitude);
      } catch (error) {
        console.error('위치 업데이트 실패:', error);
      }
    };

    const fetchNearbyGames = async () => {
      try {
        const response = await gameApi.getNearbyGames({
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 5, // 5km 반경
        });

        if (response.success && response.data) {
          setGames(response.data);
        }
      } catch (error) {
        console.error('근처 게임 가져오기 실패:', error);
      }
    };

    updateLocation();
    fetchNearbyGames();
  }, [location]);

  // 지도에 마커 추가
  useEffect(() => {
    if (games.length > 0) {
      addMarkers(games, (game) => {
        setSelectedGame(game);
      });
    }
  }, [games]);

  const handleLogout = () => {
    logout();
  };

  const handleRefresh = async () => {
    if (!location) return;

    try {
      const response = await gameApi.getNearbyGames({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 5,
      });

      if (response.success && response.data) {
        setGames(response.data);
      }
    } catch (error) {
      console.error('새로고침 실패:', error);
    }
  };

  return (
    <div className="relative h-screen w-screen">
      {/* 지도 */}
      <div ref={mapRef} className="w-full h-full" />

      {/* 상단 헤더 */}
      <div className="absolute top-0 left-0 right-0 bg-white shadow-md p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">🏀 Streetball</h1>
          <p className="text-sm text-gray-600">
            {user?.name}님 환영합니다
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          로그아웃
        </button>
      </div>

      {/* 위치 에러 메시지 */}
      {locationError && (
        <div className="absolute top-20 left-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">{locationError}</p>
          <p className="text-xs text-yellow-700 mt-1">
            기본 위치(서울 시청)를 사용합니다.
          </p>
        </div>
      )}

      {/* 하단 액션 버튼들 */}
      <div className="absolute bottom-8 left-4 right-4 flex gap-2">
        <button
          onClick={handleRefresh}
          className="flex-1 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 rounded-lg shadow-lg transition-colors duration-200"
        >
          🔄 새로고침
        </button>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex-1 btn-primary shadow-lg"
        >
          ➕ 게임 만들기
        </button>
      </div>

      {/* 게임 정보 카드 (하단) */}
      {games.length > 0 && (
        <div className="absolute bottom-32 left-4 right-4 bg-white rounded-lg shadow-lg p-4">
          <h3 className="font-bold text-gray-900 mb-2">
            근처 게임 {games.length}개
          </h3>
          <div className="text-sm text-gray-600">
            지도의 핀을 클릭하여 게임 정보를 확인하세요
          </div>
        </div>
      )}

      {/* 모달들 */}
      <GameModal
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
      />

      <CreateGameModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userLocation={currentLocation}
      />
    </div>
  );
}

