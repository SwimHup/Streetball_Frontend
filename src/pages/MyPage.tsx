import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { gameApi } from '@/apis/gameApi';
import { reviewApi } from '@/apis/reviewApi';
import { UserGame, Review, UserRatingSummary } from '@/types';
import ReviewModal from '@/components/ReviewModal';

export default function MyPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'completed' | 'ongoing'>(
    'completed',
  );
  const [completedGames, setCompletedGames] = useState<UserGame[]>([]);
  const [ongoingGames, setOngoingGames] = useState<UserGame[]>([]);
  const [userRatings, setUserRatings] = useState<UserRatingSummary | null>(
    null,
  );
  const [selectedGameReviews, setSelectedGameReviews] = useState<
    Record<number, Review[]>
  >({});
  const [expandedGames, setExpandedGames] = useState<Set<number>>(new Set());
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [currentGameId, setCurrentGameId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');

      // 진행 중인 게임 조회 (모집_중, 모집_완료)
      const ongoing = await gameApi.getOngoingGames(user.id);
      setOngoingGames(ongoing);

      // 과거 게임 조회 (게임_종료)
      const completed = await gameApi.getPastGames(user.id);
      setCompletedGames(completed);

      // 사용자 평점 요약 조회
      const ratingSummary = await reviewApi.getUserRatingSummary(user.id);
      setUserRatings(ratingSummary);
    } catch (err: any) {
      console.error('데이터 로드 실패:', err);
      setError(err.response?.data?.message || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadGameReviews = async (gameId: number) => {
    try {
      const reviews = await reviewApi.getMyReviewsByGame(gameId);
      setSelectedGameReviews((prev) => ({
        ...prev,
        [gameId]: reviews,
      }));
    } catch (err) {
      console.error('리뷰 로드 실패:', err);
    }
  };

  const toggleGameExpand = (gameId: number) => {
    const newExpanded = new Set(expandedGames);
    if (newExpanded.has(gameId)) {
      newExpanded.delete(gameId);
    } else {
      newExpanded.add(gameId);
      // 리뷰 로드
      if (!selectedGameReviews[gameId]) {
        loadGameReviews(gameId);
      }
    }
    setExpandedGames(newExpanded);
  };

  const handleLeaveGame = async (gameId: number) => {
    if (!confirm('정말 게임 참여를 취소하시겠습니까?')) return;

    try {
      await gameApi.leaveGame(gameId);
      alert('게임 참여가 취소되었습니다.');
      loadData(); // 데이터 새로고침
    } catch (err: any) {
      alert(err.response?.data?.message || '게임 참여 취소에 실패했습니다.');
    }
  };

  const handleCreateReview = (gameId: number) => {
    setCurrentGameId(gameId);
    setEditingReview(null);
    setIsReviewModalOpen(true);
  };

  const handleEditReview = (review: Review) => {
    setCurrentGameId(review.gameId);
    setEditingReview(review);
    setIsReviewModalOpen(true);
  };

  const handleDeleteReview = async (ratingId: number, gameId: number) => {
    if (!confirm('정말 이 평점을 삭제하시겠습니까?')) return;

    try {
      await reviewApi.deleteReview(ratingId);
      alert('평점이 삭제되었습니다.');
      // 해당 게임의 리뷰 목록 다시 로드
      loadGameReviews(gameId);
      // 사용자 평점 요약 다시 로드
      if (user) {
        const ratingSummary = await reviewApi.getUserRatingSummary(user.id);
        setUserRatings(ratingSummary);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || '평점 삭제에 실패했습니다.');
    }
  };

  const handleReviewSubmit = async (data: {
    revieweeName: string;
    revieweeRole: 'PLAYER' | 'REFEREE';
    rating: number;
    comment?: string;
  }) => {
    if (!currentGameId) return;

    if (editingReview) {
      // 수정
      await reviewApi.updateReview(editingReview.ratingId, {
        rating: data.rating,
        comment: data.comment,
      });
      alert('평점이 수정되었습니다.');
    } else {
      // 생성
      await reviewApi.createReview({
        gameId: currentGameId,
        ...data,
      });
      alert('평점이 작성되었습니다.');
    }

    // 해당 게임의 리뷰 목록 다시 로드
    loadGameReviews(currentGameId);
    // 사용자 평점 요약 다시 로드
    if (user) {
      const ratingSummary = await reviewApi.getUserRatingSummary(user.id);
      setUserRatings(ratingSummary);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">로그인이 필요합니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto p-4 pt-32">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* <h1 className="text-3xl font-bold mb-4">{user.name}님의 마이페이지</h1> */}

          {/* 평점 요약 */}
          {userRatings && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  참여자 평점
                </h3>
                <div className="text-3xl font-bold text-orange-600">
                  {userRatings.playScore.toFixed(1)}
                  <span className="text-sm text-gray-500 ml-1">/ 5.0</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {userRatings.playCount}개의 평가
                </p>
              </div>

              <div className="bg-orange-100 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  심판 평점
                </h3>
                <div className="text-3xl font-bold text-orange-600">
                  {userRatings.refScore.toFixed(1)}
                  <span className="text-sm text-gray-500 ml-1">/ 5.0</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {userRatings.refCount}개의 평가
                </p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* 탭 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              activeTab === 'completed'
                ? 'bg-white text-red-500 shadow-sm'
                : 'bg-white text-gray-600 hover:text-gray-800'
            }`}
          >
            게임 종료 ({completedGames.length})
          </button>
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              activeTab === 'ongoing'
                ? 'bg-white text-green-600 shadow-sm'
                : 'bg-white text-gray-600 hover:text-gray-800'
            }`}
          >
            모집중/모집완료 ({ongoingGames.length})
          </button>
        </div>

        {/* 게임 목록 */}
        <div className="space-y-4">
          {activeTab === 'completed' ? (
            completedGames.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center text-gray-500">
                완료된 게임이 없습니다.
              </div>
            ) : (
              completedGames.map((game) => (
                <div key={game.gameId} className="bg-white rounded-lg shadow-sm">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">{game.courtName}</h3>
                        <p className="text-gray-600 text-sm mt-1">
                          방장: {game.hostName}
                          {game.referee && ` | 심판: ${game.referee}`}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                        게임 종료
                      </span>
                    </div>

                    <div className="text-sm text-gray-500 space-y-1">
                      <p>
                        📅{' '}
                        {new Date(game.scheduledTime).toLocaleString('ko-KR')}
                      </p>
                      <p>
                        👥 {game.currentPlayers} / {game.maxPlayers}
                      </p>
                      <p className="text-xs mt-2">
                        참여자: {game.playerNames.join(', ')}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => toggleGameExpand(game.gameId)}
                        className="flex-1 px-4 py-2 bg-orange-200 text-orange-600 rounded-lg hover:bg-orange-300 transition font-medium"
                      >
                        {expandedGames.has(game.gameId)
                          ? '평점 숨기기'
                          : '평점 보기'}
                      </button>
                      <button
                        onClick={() => handleCreateReview(game.gameId)}
                        className="flex-1 px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition font-medium"
                      >
                        평점 작성
                      </button>
                    </div>
                  </div>

                  {/* 내가 남긴 평점 목록 */}
                  {expandedGames.has(game.gameId) && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <h4 className="font-semibold mb-3">
                        내가 남긴 평점 (
                        {selectedGameReviews[game.gameId]?.length || 0})
                      </h4>

                      {selectedGameReviews[game.gameId]?.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                          아직 남긴 평점이 없습니다.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {selectedGameReviews[game.gameId]?.map((review) => (
                            <div
                              key={review.ratingId}
                              className="bg-white p-3 rounded-lg"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium">
                                    {review.revieweeName} (
                                    {review.revieweeRole === 'PLAYER'
                                      ? '참여자'
                                      : '심판'}
                                    )
                                  </p>
                                  <div className="flex items-center gap-1 mt-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <span key={star}>
                                        {star <= review.rating ? '⭐' : '☆'}
                                      </span>
                                    ))}
                                    <span className="text-sm text-gray-600 ml-2">
                                      {review.rating}점
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditReview(review)}
                                    className="text-sm text-orange-600 hover:text-orange-800"
                                  >
                                    수정
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteReview(
                                        review.ratingId,
                                        game.gameId,
                                      )
                                    }
                                    className="text-sm text-red-600 hover:text-red-800"
                                  >
                                    삭제
                                  </button>
                                </div>
                              </div>
                              {review.comment && (
                                <p className="text-sm text-gray-700 mt-2">
                                  {review.comment}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-2">
                                {new Date(review.createdAt).toLocaleString(
                                  'ko-KR',
                                )}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )
          ) : ongoingGames.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center text-gray-500">
              진행중인 게임이 없습니다.
            </div>
          ) : (
            ongoingGames.map((game) => (
              <div
                key={game.gameId}
                className="bg-white rounded-lg shadow-sm p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{game.courtName}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      방장: {game.hostName}
                      {game.referee && ` | 심판: ${game.referee}`}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      game.status === '모집_중'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {game.status === '모집_중' ? '모집중' : '모집완료'}
                  </span>
                </div>

                {/* <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    📅 {new Date(game.scheduledTime).toLocaleString('ko-KR')}
                  </p>
                  <p>
                    👥 {game.currentPlayers} / {game.maxPlayers}
                  </p>
                  <p className="text-xs mt-2">
                    참여자: {game.playerNames.join(', ')}
                  </p>
                </div> */}

                
                <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    📅 {new Date(game.scheduledTime).toLocaleString('ko-KR')}
                  </p>
                  <p>
                    👥 {game.currentPlayers} / {game.maxPlayers}
                  </p>
                  <p className="text-xs mt-2">
                    참여자: {game.playerNames.join(', ')}
                  </p>
                </div>
                <button
                    onClick={() => handleLeaveGame(game.gameId)}
                    className="w-1/5 mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    참여 취소
                  </button>
                </div>  
              </div>
            ))
          )}
        </div>
      </div>

      {/* 리뷰 모달 */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setEditingReview(null);
          setCurrentGameId(null);
        }}
        onSubmit={handleReviewSubmit}
        existingReview={editingReview || undefined}
        isEditing={!!editingReview}
      />
    </div>
  );
}
