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
    if (!mapRef.current || !window.kakao) return;

    const container = mapRef.current;
    const options = {
      center: new window.kakao.maps.LatLng(center.latitude, center.longitude),
      level,
    };

    const mapInstance = new window.kakao.maps.Map(container, options);
    setMap(mapInstance);
  }, []);

  // 중심 위치 변경
  useEffect(() => {
    if (!map) return;

    const moveLatLon = new window.kakao.maps.LatLng(
      center.latitude,
      center.longitude
    );
    map.setCenter(moveLatLon);
  }, [map, center]);

  // 마커 추가
  const addMarkers = (games: Game[], onClick: (game: Game) => void) => {
    if (!map) return;

    // 기존 마커 제거
    markers.forEach((marker) => marker.setMap(null));

    // 새 마커 생성
    const newMarkers = games.map((game) => {
      const position = new window.kakao.maps.LatLng(
        game.latitude,
        game.longitude
      );

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

