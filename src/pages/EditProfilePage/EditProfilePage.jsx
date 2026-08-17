import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import * as usersApi from '../../api/users';
import { useAuth } from '../../hooks/useAuth';
import styles from './EditProfilePage.module.css';

const EMPTY_FORM = {
  name: '',
  bio: '',
  location: '',
  birthDate: '',
  profileImageUrl: '',
  bannerImageUrl: '',
};

function EditProfilePage() {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  const [form, setForm] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    usersApi
      .getMe()
      .then((data) => {
        if (cancelled) return;
        const user = data.user;
        setForm({
          name: user.name ?? '',
          bio: user.bio ?? '',
          location: user.location ?? '',
          birthDate: user.birthDate ?? '',
          profileImageUrl: user.profileImageUrl ?? '',
          bannerImageUrl: user.bannerImageUrl ?? '',
        });
      })
      .catch((err) => {
        if (!cancelled)
          setError(err.message || '프로필을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload = { ...form, birthDate: form.birthDate || null };
      const data = await usersApi.updateMe(payload);
      refreshAuth();
      navigate(`/${data.user.username}`);
    } catch (err) {
      setError(err.message || '프로필 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          ←
        </button>
        <p className={styles.title}>프로필 수정</p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Input
          id="name"
          name="name"
          label="이름"
          value={form.name}
          onChange={handleChange}
          required
        />

        <div className={styles.field}>
          <label htmlFor="bio" className={styles.bioLabel}>
            소개
          </label>
          <textarea
            id="bio"
            name="bio"
            className={styles.textarea}
            value={form.bio}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <Input
          id="location"
          name="location"
          label="위치"
          value={form.location}
          onChange={handleChange}
        />
        <Input
          id="birthDate"
          name="birthDate"
          label="생년월일"
          value={form.birthDate}
          onChange={handleChange}
          placeholder="1999.01.01"
        />
        <Input
          id="profileImageUrl"
          name="profileImageUrl"
          label="프로필 이미지 URL"
          value={form.profileImageUrl}
          onChange={handleChange}
        />
        <Input
          id="bannerImageUrl"
          name="bannerImageUrl"
          label="배너 이미지 URL"
          value={form.bannerImageUrl}
          onChange={handleChange}
        />

        {error && <p className={styles.errorMessage}>{error}</p>}

        <div className={styles.actions}>
          <Button type="submit" disabled={isSubmitting}>
            저장하기
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditProfilePage;
