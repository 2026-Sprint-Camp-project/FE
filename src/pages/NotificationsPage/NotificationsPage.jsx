// src/pages/NotificationsPage/NotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { getNotifications } from '../../api/notifications';
import NotificationItem from '../../components/NotificationItem/NotificationItem';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await getNotifications();

        // API 명세서에 맞춰 data.notifications 배열 추출
        if (data && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error('알림 목록 조회 실패:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // 알림 타입(notificationType)에 따라 텍스트를 생성하는 함수
  const getNotificationMessage = (type, senderName) => {
    switch (type) {
      case 'LIKE':
        return `${senderName}님이 회원님의 게시물을 좋아합니다.`;
      case 'FOLLOW':
        return `${senderName}님이 회원님을 팔로우하기 시작했습니다.`;
      case 'REPOST':
        return `${senderName}님이 회원님의 게시물을 리포스트했습니다.`;
      case 'REPLY':
        return `${senderName}님이 회원님의 게시물에 답글을 남겼습니다.`;
      default:
        return `${senderName}님이 회원님에게 반응을 남겼습니다.`;
    }
  };

  return (
    <div style={{ borderLeft: '1px solid #EFF3F4', borderRight: '1px solid #EFF3F4', minHeight: '100vh' }}>

      {/* 1. 상단 알림 헤더 */}
      <div style={{
        position: 'sticky', top: 0, backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)', padding: '16px', borderBottom: '1px solid #EFF3F4', zIndex: 10
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>알림</h2>
      </div>

      {/* 2. 알림 리스트 렌더링 */}
      <div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#536471' }}>알림을 불러오는 중...</div>
        ) : notifications.length > 0 ? (
          notifications.map((noti) => (
            <NotificationItem
              key={noti.notificationId}
              // 🚨 NotificationItem에 정의된 정확한 이름으로 변경
              message={getNotificationMessage(noti.notificationType, noti.sender?.name || '사용자')}
              timestamp={noti.createdAt}

              // 아바타 이미지와 이름도 함께 전달 (선택 사항)
              avatarUrl={noti.sender?.profileImageUrl}
              name={noti.sender?.name || '사용자'}
            />
          ))
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#536471' }}>아직 알림이 없습니다.</div>
        )}
      </div>

    </div>
  );
}

export default NotificationsPage;