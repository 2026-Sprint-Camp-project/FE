import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingRow from '../../components/SettingRow/SettingRow';
import ToggleSwitch from '../../components/ToggleSwitch/ToggleSwitch';
import EditFieldModal from '../../components/EditFieldModal/EditFieldModal';
import { useAuth } from '../../hooks/useAuth';
import { saveTokens } from '../../api/auth';
import * as usersApi from '../../api/users';
import styles from './SettingPage.module.css';

const MODALS = {
  username: {
    title: '아이디 변경',
    description: '다른 사람들에게 표시되는 아이디를 변경합니다.',
    fieldLabel: '새 아이디',
    fieldType: 'text',
  },
  email: {
    title: '이메일 변경',
    description: '로그인에 사용하는 이메일 주소를 변경합니다.',
    fieldLabel: '새 이메일',
    fieldType: 'email',
  },
  password: {
    title: '비밀번호 변경',
    description: '8자 이상의 새 비밀번호를 입력해주세요.',
    fieldLabel: '새 비밀번호',
    fieldType: 'password',
  },
};

function SettingPage() {
  const navigate = useNavigate();
  const { currentUser, logout, refreshAuth } = useAuth();

  const [isPrivate, setIsPrivate] = useState(Boolean(currentUser?.isPrivate));
  const [activeModal, setActiveModal] = useState(null); // 'username' | 'email' | 'password' | null
  const [fieldValue, setFieldValue] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = (key) => {
    setActiveModal(key);
    setFieldValue('');
    setFieldError('');
  };

  const closeModal = () => {
    setActiveModal(null);
    setFieldValue('');
    setFieldError('');
  };

  const handleTogglePrivate = async (next) => {
    setIsPrivate(next); // 낙관적 업데이트
    try {
      await usersApi.updatePrivacy(next);
    } catch (err) {
      setIsPrivate(!next); // 실패 시 롤백
      window.alert(err.message || '설정 변경에 실패했습니다.');
    }
  };

  const handleConfirmModal = async () => {
    if (!activeModal) return;
    setFieldError('');
    setIsSubmitting(true);

    try {
      if (activeModal === 'username') {
        await usersApi.updateUsername(fieldValue);
        refreshAuth();
      } else if (activeModal === 'email') {
        await usersApi.updateEmail(fieldValue);
      } else if (activeModal === 'password') {
        const data = await usersApi.updatePassword(fieldValue);
        if (data?.token) saveTokens(data.token);
        refreshAuth();
      }
      closeModal();
    } catch (err) {
      setFieldError(err.message || '변경에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeModalConfig = activeModal ? MODALS[activeModal] : null;

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <p className={styles.title}>설정</p>
      </header>

      <section className={styles.section}>
        <SettingRow
          title="프로필 수정"
          onClick={() => navigate('/settings/profile')}
        />
        <SettingRow title="아이디 변경" onClick={() => openModal('username')} />
        <SettingRow title="이메일 변경" onClick={() => openModal('email')} />
        <SettingRow
          title="비밀번호 변경"
          onClick={() => openModal('password')}
        />
        <SettingRow
          title="비공개 계정"
          description="비공개 계정으로 전환하면 팔로우를 승인한 사람만 게시물을 볼 수 있어요."
          trailing={
            <ToggleSwitch checked={isPrivate} onChange={handleTogglePrivate} />
          }
        />
        <SettingRow title="로그아웃" onClick={handleLogout} />
      </section>

      {activeModalConfig && (
        <EditFieldModal
          title={activeModalConfig.title}
          description={activeModalConfig.description}
          fieldProps={{
            id: 'settingField',
            label: activeModalConfig.fieldLabel,
            type: activeModalConfig.fieldType,
            value: fieldValue,
            onChange: (e) => setFieldValue(e.target.value),
            error: fieldError,
          }}
          onCancel={closeModal}
          onConfirm={handleConfirmModal}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

export default SettingPage;
