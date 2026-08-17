import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, saveTokens } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import styles from './LoginPage.module.css';

function LoginPage() {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.username || !formData.password) {
      setError('아이디(이메일)와 비밀번호를 모두 입력해주세요.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const data = await login(formData);
      saveTokens(data.token);
      refreshAuth();

      // 로그인 성공 시 메인 홈피드로 이동
      navigate('/');
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <p className={styles.logo}>X</p>
        <p className={styles.title}>지금 일어나고 있는 일을 확인하세요</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="username">아이디 또는 이메일</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="you@example.com"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            로그인
          </button>
        </form>

        <Link to="/signup" className={styles.signupLink}>
          계정이 없으신가요? 가입하기
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;
