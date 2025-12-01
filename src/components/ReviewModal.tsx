import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Review, RevieweeRole } from '@/types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    revieweeName: string;
    revieweeRole: RevieweeRole;
    rating: number;
    comment?: string;
  }) => Promise<void>;
  existingReview?: Review;
  isEditing?: boolean;
}

export default function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  existingReview,
  isEditing = false,
}: ReviewModalProps) {
  const [revieweeName, setRevieweeName] = useState('');
  const [revieweeRole, setRevieweeRole] = useState<RevieweeRole>('PLAYER');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingReview) {
      setRevieweeName(existingReview.revieweeName);
      setRevieweeRole(existingReview.revieweeRole);
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
    } else {
      setRevieweeName('');
      setRevieweeRole('PLAYER');
      setRating(5);
      setComment('');
    }
    setError('');
  }, [existingReview, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isEditing && !revieweeName.trim()) {
      setError('평가할 사용자 이름을 입력해주세요.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('평점은 1에서 5 사이의 값이어야 합니다.');
      return;
    }

    if (comment.length > 500) {
      setError('코멘트는 최대 500자까지 입력 가능합니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        revieweeName,
        revieweeRole,
        rating,
        comment: comment.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || '평점 제출에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">
          {isEditing ? '평점 수정' : '평점 작성'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  평가할 사용자 이름
                </label>
                <input
                  type="text"
                  value={revieweeName}
                  onChange={(e) => setRevieweeName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">역할</label>
                <select
                  value={revieweeRole}
                  onChange={(e) =>
                    setRevieweeRole(e.target.value as RevieweeRole)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PLAYER">참여자</option>
                  <option value="REFEREE">심판</option>
                </select>
              </div>
            </>
          )}

          {isEditing && (
            <div className="bg-gray-100 p-3 rounded-lg mb-4">
              <p className="text-sm">
                <span className="font-medium">평가 대상:</span>{' '}
                {existingReview?.revieweeName} (
                {existingReview?.revieweeRole === 'PLAYER' ? '참여자' : '심판'}
                )
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              평점 ({rating}점)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="flex-1"
              />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-2xl focus:outline-none"
                  >
                    {star <= rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              코멘트 (선택, 최대 500자)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              maxLength={500}
              placeholder="평가에 대한 코멘트를 남겨주세요."
            />
            <p className="text-sm text-gray-500 mt-1">
              {comment.length} / 500자
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? '제출 중...' : isEditing ? '수정' : '작성'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

