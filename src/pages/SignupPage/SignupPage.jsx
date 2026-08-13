import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup, saveTokens } from '../../api/auth';
import styles from './SignupPage.module.css';

const INITIAL_FORM = {
  username: '',
  email: '',
  name: '',
  password: '',
  birthDate: '',
};

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { username, email, name, password, birthDate } = formData;
    if (!username || !email || !name || !password || !birthDate) {
      setError('모든 항목을 입력해주세요.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const data = await signup(formData);
      saveTokens(data.token);
      navigate('/');
    } catch (err) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <p className={styles.logo}>X</p>
        <p className={styles.title}>계정을 생성하세요</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Figma 디자인에는 없지만, 로그인/mock 핸들러가 username을 요구해 추가한 필드 */}
          <div className={styles.field}>
            <label htmlFor="username">아이디</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="name">이름</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="홍길동"
              autoComplete="name"
              value={formData.name}
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
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="birthDate">생년월일</label>
            <input
              id="birthDate"
              name="birthDate"
              type="text"
              placeholder="1999.01.01"
              autoComplete="bday"
              value={formData.birthDate}
              onChange={handleChange}
            />
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}

          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            가입하기
          </button>
        </form>

        <Link to="/login" className={styles.loginLink}>
          이미 계정이 있으신가요? 로그인
        </Link>
      </div>
    </div>
  );
}

export default SignupPage;
