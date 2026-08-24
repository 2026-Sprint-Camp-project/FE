// src/components/ReplyForm/ReplyForm.jsx
import React, { useState } from 'react';
import Icon from '../Icon/Icon';

function ReplyForm({ onSubmit, currentUserAvatar }) {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content);
    setContent('');
  };

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      padding: '16px',
      borderBottom: '1px solid #EFF3F4',
      alignItems: 'flex-start'
    }}>
      {/* 사용자 아바타 */}
      <div style={{ 
        width: '50px', 
        height: '50px', 
        borderRadius: '50%', 
        backgroundColor: '#F7F9F9', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon name="user" size={30} color="#536471" />
      </div>
      
      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} style={{ flex: 1 }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="답글 게시하기"
          rows={2}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: '16px',
            fontFamily: 'inherit'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button
            type="submit"
            disabled={!content.trim()}
            style={{
              backgroundColor: content.trim() ? '#1D9BF0' : '#8ECDF8',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 16px',
              fontWeight: 'bold',
              cursor: content.trim() ? 'pointer' : 'default'
            }}
          >
            답글
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReplyForm;