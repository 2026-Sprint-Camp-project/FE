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

  // 1단계: 비밀번호 확인 (아이디/이메일/비밀번호/공개설정 변경 전 공통으로 거쳐야 함)
  // pendingModal: 확인 통과 후 진행할 작업 — 'username' | 'email' | 'password' | 'privacy'
  const [pendingModal, setPendingModal] = useState(null);
  const [pendingPrivacyValue, setPendingPrivacyValue] = useState(null);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [verifyValue, setVerifyValue] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // 2단계: 실제 값 수정 모달 (비밀번호 확인 통과 후에만 열림)
  const [activeModal, setActiveModal] = useState(null); // 'username' | 'email' | 'password' | null
  const [fieldValue, setFieldValue] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestVerification = (modalKey, privacyValue = null) => {
    setPendingModal(modalKey);
    setPendingPrivacyValue(privacyValue);
    setVerifyValue('');
    setVerifyError('');
    setIsVerifyOpen(true);
  };

  const closeVerifyModal = () => {
    if (isVerifying) return;
    setIsVerifyOpen(false);
    setPendingModal(null);
    setPendingPrivacyValue(null);
  };

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

  const applyPrivacyChange = async (next) => {
    const prev = isPrivate;
    setIsPrivate(next); // 낙관적 업데이트
    try {
      await usersApi.updatePrivacy(next);
    } catch (err) {
      setIsPrivate(prev); // 실패 시 롤백
      window.alert(err.message || '설정 변경에 실패했습니다.');
    }
  };

  const handleVerifyConfirm = async () => {
    if (!verifyValue) {
      setVerifyError('비밀번호를 입력해주세요.');
      return;
    }

    setVerifyError('');
    setIsVerifying(true);
    try {
      await usersApi.verifyPassword(verifyValue);
      setIsVerifyOpen(false);

      if (pendingModal === 'privacy') {
        await applyPrivacyChange(pendingPrivacyValue);
        setPendingModal(null);
        setPendingPrivacyValue(null);
      } else {
        openModal(pendingModal);
        setPendingModal(null);
      }
    } catch (err) {
      setVerifyError(err.message || '비밀번호가 일치하지 않습니다.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTogglePrivateRequest = (next) => {
    requestVerification('privacy', next);
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
        <SettingRow
          title="아이디 변경"
          onClick={() => requestVerification('username')}
        />
        <SettingRow
          title="이메일 변경"
          onClick={() => requestVerification('email')}
        />
        <SettingRow
          title="비밀번호 변경"
          onClick={() => requestVerification('password')}
        />
        <SettingRow
          title="비공개 계정"
          description="비공개 계정으로 전환하면 팔로우를 승인한 사람만 게시물을 볼 수 있어요."
          trailing={
            <ToggleSwitch
              checked={isPrivate}
              onChange={handleTogglePrivateRequest}
            />
          }
        />
        <SettingRow title="로그아웃" onClick={handleLogout} />
      </section>

      {isVerifyOpen && (
        <EditFieldModal
          title="비밀번호 확인"
          description="보안을 위해 현재 비밀번호를 다시 입력해주세요."
          fieldProps={{
            id: 'verifyPassword',
            label: '비밀번호',
            type: 'password',
            value: verifyValue,
            onChange: (e) => setVerifyValue(e.target.value),
            error: verifyError,
          }}
          confirmText="확인"
          onCancel={closeVerifyModal}
          onConfirm={handleVerifyConfirm}
          isSubmitting={isVerifying}
        />
      )}

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
