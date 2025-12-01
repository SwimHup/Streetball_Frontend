import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useKakaoMap } from '@/hooks/useKakaoMap';
import { gameApi } from '@/apis/gameApi';
import GameModal from '@/components/GameModal';
import CreateGameModal from '@/components/CreateGameModal';
import { useNavigate } from 'react-router-dom';
import { useCourt } from '@/hooks/useCourt';

// Note: 실제 타입 정의 파일 (types.ts)이 필요할 수 있습니다.
// interface Location { latitude: number; longitude: number; }
// interface Game { id: number; latitude: number; longitude: number; /* ... other props */ }

export default function MapPage() {
  const { user, logout } = useAuthStore();
  const { games, selectedGame, setGames, setSelectedGame } = useGameStore();
  const { courts } = useCourt();
  const { location, error: locationError } = useGeolocation(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();
  // 기본 위치 (서울 시청)
  const defaultLocation = { latitude: 37.5665, longitude: 126.978 };
  const currentLocation = location || defaultLocation;

  const { mapRef, addMarkers, addCourtMarkers } = useKakaoMap({
    center: currentLocation,
    level: 3,
  });

  // 위치 업데이트 및 근처 게임 가져오기
  // useEffect(() => {
  //   // location이 null이거나 아직 로드되지 않은 상태일 수 있으므로 return 조건 유지
  //   if (!location) return;

  //   const fetchNearbyGames = async () => {
  //     try {
  //       const response = await gameApi.getNearbyGames({
  //         latitude: location.latitude,
  //         longitude: location.longitude,
  //         radius: 5, // 5km 반경
  //       });

  //       if (response.success && response.data) {
  //         setGames(response.data);
  //       }
  //     } catch (error) {
  //       console.error('근처 게임 가져오기 실패:', error);
  //     }
  //   };

  //   fetchNearbyGames();
  // }, [location]);

  // 지도에 게임 마커 추가
  useEffect(() => {
    if (games.length > 0) {
      addMarkers(games, (game) => {
        setSelectedGame(game);
      });
    }
  }, [games]);

  // 지도에 농구장 마커 추가
  useEffect(() => {
    if (courts && courts.length > 0) {
      addCourtMarkers(courts, (court) => {
        // 농구장 클릭 시 해당 위치로 이동하거나 정보 표시
        console.log('농구장 클릭:', court);
        // TODO: 농구장 정보 표시 또는 해당 농구장에서 게임 만들기
      });
    }
  }, [courts]);

  const handleLogout = () => {
    try {
      logout();
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
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
    <div className="relative h-screen w-screen overflow-hidden">
      {/* 지도 컨테이너: ref={mapRef}를 사용합니다. */}
      <div ref={mapRef} className="absolute top-0 left-0 w-full h-full z-0" />

      {/* 위치 에러 메시지 */}
      {locationError && (
        <div className="absolute top-20 left-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">{locationError}</p>
          <p className="text-xs text-yellow-700 mt-1">기본 위치(서울 시청)를 사용합니다.</p>
        </div>
      )}

      {/* 하단 액션 버튼들 */}
      <div className="absolute bottom-8 left-4 right-4 flex gap-2 z-10">
        <button onClick={() => setIsCreateModalOpen(true)} className="flex-1 btn-primary shadow-lg">
          ➕ 게임 만들기
        </button>
      </div>

      {/* 게임 및 농구장 정보 카드 (하단) */}
      {(games.length > 0 || courts.length > 0) && (
        <div className="absolute bottom-32 left-4 right-4 bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-900">지도 정보</h3>
          </div>
          <div className="space-y-1">
            {courts.length > 0 && (
              <div className="flex items-center text-sm">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                <span className="text-gray-600">농구장 {courts.length}개</span>
              </div>
            )}
            {games.length > 0 && (
              <div className="flex items-center text-sm">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                <span className="text-gray-600">게임 {games.length}개</span>
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            지도의 핀을 클릭하여 자세한 정보를 확인하세요
          </div>
        </div>
      )}

      {/* 모달들 */}
      <GameModal game={selectedGame} onClose={() => setSelectedGame(null)} />

      <CreateGameModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userLocation={currentLocation}
      />
    </div>
  );
}
