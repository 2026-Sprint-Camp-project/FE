// 인증 API

import { http, HttpResponse } from 'msw';
import {
  mockUsers,
  nextId,
  toProfileUser,
  toPublicUser,
  findUserById,
} from '../db';
import { issueToken, getCurrentUser } from '../utils/auth';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const authHandlers = [
  //==================================================================================================
  // 회원가입
  http.post('/users/signup', async ({ request }) => {
    const { email, username, name, password, birthDate } = await request.json();

    if (!email || !username || !name || !password || !birthDate) {
      return HttpResponse.json(
        { message: '회원가입에 필요한 정보가 모두 입력되지 않았습니다.' },
        { status: 400 },
      );
    }

    const isDuplicate = mockUsers.some(
      (u) => u.email === email || u.username === username,
    );
    if (isDuplicate) {
      return HttpResponse.json(
        { message: '이미 가입된 이메일 또는 아이디입니다.' },
        { status: 409 },
      );
    }

    const newUser = {
      userId: nextId('user'),
      email,
      username,
      name,
      password,
      birthDate,
      bio: '',
      location: '',
      profileImageUrl: null,
      bannerImageUrl: null,
      isPrivate: false,
      createdAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);

    const { userId, profileImageUrl } = newUser;
    return HttpResponse.json(
      {
        message: '회원가입 성공',
        createdAt: newUser.createdAt,
        token: issueToken(userId),
        user: { userId, email, username, name, profileImageUrl },
      },
      { status: 201 },
    );
  }),

  //==================================================================================================
  // 로그인
  http.post('/users/login', async ({ request }) => {
    const { username, password } = await request.json();

    if (!username || !password) {
      return HttpResponse.json(
        { message: '아이디와 비밀번호를 모두 입력해주세요.' },
        { status: 400 },
      );
    }

    const user = mockUsers.find((u) => u.username === username);
    if (!user || user.password !== password) {
      return HttpResponse.json(
        { message: '아이디 또는 비밀번호가 일치하지 않습니다.' },
        { status: 401 },
      );
    }

    const { userId, email, name, profileImageUrl } = user;
    return HttpResponse.json(
      {
        message: '로그인 성공',
        token: issueToken(userId),
        user: { userId, email, username, name, profileImageUrl },
      },
      { status: 200 },
    );
  }),

  //==================================================================================================
  // 내 프로필 조회
  http.get('/users/me', ({ request }) => {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return HttpResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    return HttpResponse.json(
      { user: toProfileUser(currentUser) },
      { status: 200 },
    );
  }),

  //==================================================================================================
  // 내 프로필 수정
  http.patch('/users/me', async ({ request }) => {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return HttpResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const { bio, location, profileImageUrl, bannerImageUrl, name, birthDate } =
      await request.json();
    const patch = {
      bio,
      location,
      profileImageUrl,
      bannerImageUrl,
      name,
      birthDate,
    };
    const hasAnyField = Object.values(patch).some((v) => v !== undefined);

    if (!hasAnyField) {
      return HttpResponse.json(
        { message: '수정할 내용이 없습니다.' },
        { status: 400 },
      );
    }

    Object.entries(patch).forEach(([key, value]) => {
      if (value !== undefined) currentUser[key] = value;
    });

    return HttpResponse.json(
      { user: toProfileUser(currentUser) },
      { status: 200 },
    );
  }),

  //==================================================================================================
  // 다른 사용자 프로필 조회
  http.get('/users/:userId', ({ request, params }) => {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return HttpResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const targetUser = findUserById(params.userId);
    if (!targetUser) {
      return HttpResponse.json(
        { message: '사용자를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    const { password, email, ...publicProfile } = toProfileUser(targetUser);
    return HttpResponse.json({ user: publicProfile }, { status: 200 });
  }),

  //==================================================================================================
  // 사용자 검색
  http.get('/users', ({ request }) => {
    const keyword = new URL(request.url).searchParams.get('keyword');
    if (!keyword) {
      return HttpResponse.json(
        { message: '검색어를 입력해주세요.' },
        { status: 400 },
      );
    }

    const matched = mockUsers.filter(
      (u) => u.username.includes(keyword) || u.name.includes(keyword),
    );

    return HttpResponse.json(
      { totalCount: matched.length, users: matched.map(toPublicUser) },
      { status: 200 },
    );
  }),

  //==================================================================================================
  // 계정 공개 설정
  http.patch('/users/me/privacy', async ({ request }) => {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return HttpResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const { isPrivate } = await request.json();
    currentUser.isPrivate = Boolean(isPrivate);

    return HttpResponse.json(
      { message: '설정이 변경되었습니다.', isPrivate: currentUser.isPrivate },
      { status: 200 },
    );
  }),

  //==================================================================================================
  // 비밀번호 변경
  http.patch('/users/me/settings/password', async ({ request }) => {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return HttpResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const { newPassword } = await request.json();
    if (!newPassword || newPassword.length < 8) {
      return HttpResponse.json(
        { message: '비밀번호는 8자 이상이어야 합니다.' },
        { status: 403 },
      );
    }

    currentUser.password = newPassword;
    return HttpResponse.json(
      {
        message: '비밀번호가 변경되었습니다.',
        token: issueToken(currentUser.userId),
      },
      { status: 200 },
    );
  }),

  //==================================================================================================
  // 이메일 변경
  http.patch('/users/me/settings/email', async ({ request }) => {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return HttpResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const { newEmail } = await request.json();
    if (!newEmail || !EMAIL_PATTERN.test(newEmail)) {
      return HttpResponse.json(
        { message: '올바른 이메일 형식이 아닙니다.' },
        { status: 403 },
      );
    }

    const isDuplicate = mockUsers.some(
      (u) => u.email === newEmail && u.userId !== currentUser.userId,
    );
    if (isDuplicate) {
      return HttpResponse.json(
        { message: '이미 사용 중인 이메일입니다.' },
        { status: 409 },
      );
    }

    currentUser.email = newEmail;
    return HttpResponse.json(
      { message: '이메일이 변경되었습니다.' },
      { status: 200 },
    );
  }),

  //==================================================================================================
  // 유저네임 변경
  http.patch('/users/me/settings/username', async ({ request }) => {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return HttpResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    const { newUsername } = await request.json();
    if (!newUsername || newUsername.length < 2) {
      return HttpResponse.json(
        { message: '아이디는 2자 이상이어야 합니다.' },
        { status: 403 },
      );
    }

    const isDuplicate = mockUsers.some(
      (u) => u.username === newUsername && u.userId !== currentUser.userId,
    );
    if (isDuplicate) {
      return HttpResponse.json(
        { message: '이미 사용 중인 아이디입니다.' },
        { status: 409 },
      );
    }

    currentUser.username = newUsername;
    return HttpResponse.json(
      { message: '아이디가 변경되었습니다.' },
      { status: 200 },
    );
  }),
];
