import { useEffect, useRef, useState } from 'react';
import { Location, Game } from '@/types';

declare global {
  interface Window {
    kakao: any;
  }
}

interface UseKakaoMapProps {
  center: Location;
  level?: number;
}

export const useKakaoMap = ({ center, level = 3 }: UseKakaoMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  // 지도 초기화
  useEffect(() => {
    // ref가 아직 할당되지 않았거나 이미 map 객체가 생성되었다면 return
    if (!mapRef.current || map) return;

    console.log('🧭 useKakaoMap 초기화 이펙트 실행');

    const initMap = () => {
      // 이 시점에서는 window.kakao.maps가 존재한다고 가정
      const container = mapRef.current;
      if (!container) return; // 만약 컨테이너가 사라졌다면 종료

      const options = {
        center: new window.kakao.maps.LatLng(center.latitude, center.longitude),
        level,
      };

      console.log('🗺️ 지도 초기화 중...', options);
      try {
        const mapInstance = new window.kakao.maps.Map(container, options);
        console.log('✅ 지도 초기화 완료!', mapInstance);
        setMap(mapInstance);
      } catch (e) {
        console.error('❌ 카카오맵 객체 생성 실패:', e);
      }
    };

    if (window.kakao && window.kakao.maps) {
      // 카카오맵 SDK가 이미 로드되어 있으면 바로 초기화
      initMap();
    } else if (window.kakao && !window.kakao.maps) {
      // window.kakao는 있지만 maps 객체는 아직 준비되지 않은 경우 (로드 중)
      const checkKakao = setInterval(() => {
        if (window.kakao.maps) {
          clearInterval(checkKakao);
          initMap();
        }
      }, 100);

      return () => clearInterval(checkKakao);
    } else {
      // window.kakao 객체 자체가 없는 경우 (SDK 로드 실패)
      console.error(
        '❌ 카카오맵 SDK 로드 실패: window.kakao 객체를 찾을 수 없습니다. (API 키 및 도메인 설정을 확인하세요)',
      );
    }
  }, [map]); // map이 null일 때만 실행되도록 의존성 배열에 map 추가

  // 중심 위치 변경
  useEffect(() => {
    if (!map || !center) return;

    const moveLatLon = new window.kakao.maps.LatLng(center.latitude, center.longitude);
    map.setCenter(moveLatLon);
  }, [map, center]);

  // 마커 추가
  const addMarkers = (games: Game[], onClick: (game: Game) => void) => {
    if (!map || !window.kakao || !window.kakao.maps) {
      console.warn(
        '⚠️ 지도 객체(map) 또는 카카오맵 라이브러리가 준비되지 않아 마커를 추가할 수 없습니다.',
      );
      return;
    }

    // 기존 마커 제거
    markers.forEach((marker) => marker.setMap(null));

    // 새 마커 생성
    const newMarkers = games.map((game) => {
      const position = new window.kakao.maps.LatLng(game.latitude, game.longitude);

      const marker = new window.kakao.maps.Marker({
        position,
        map,
      });

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        onClick(game);
      });

      return marker;
    });

    setMarkers(newMarkers);
  };

  // 마커 제거
  const clearMarkers = () => {
    markers.forEach((marker) => marker.setMap(null));
    setMarkers([]);
  };

  return {
    mapRef,
    map,
    addMarkers,
    clearMarkers,
  };
};
