핵심 로직

1. 게임 생성 (GameService.createGame)
새 게임 생성 시 생성자를 자동으로 Participation 테이블에 'player' 역할로 등록
Transaction을 사용하여 Game과 Participation이 동시에 생성되도록 보장
current_players 자동 증가 및 상태 업데이트

2. 근처 게임 검색 (GameService.findNearbyGames)
Bounding Box를 사용한 1차 필터링
Haversine 공식을 사용한 정확한 거리 계산
모든 게임을 지도에 띄워줌 
- 핀 형태로 띄워주고 클릭 시 모달이 뜨면서 게임 정보와 참여하기 버튼이 뜬다.
'모집 중' 상태의 게임만 반환

3. 사용자 위치 저장 (UserService.updateUserLocation)
사용자의 현재 위치(위도, 경도)를 업데이트
근처 게임 검색의 기준이 되는 정보

4. 게임 참여
게임이 모집 중이고, 최대 인원보다 현재인원이 작다면 참여 가능이므로 
참여하기 버튼을 누르면 해당 게임에 참여할 수 있다.

