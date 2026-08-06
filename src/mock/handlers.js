import { http, HttpResponse } from 'msw';

export const handlers = [
  //회원가입
  http.post('/users/signup', async ({ request }) => {
    const body = await request.json();
    const { email, password, username, name, birthDate } = body;

    if (!email || !password || !username || !name || !birthDate) {
      return HttpResponse.json(
        { message: '회원가입 필수 정보 빠진 경우' },
        { status: 400 },
      );
    }

    const emailExists = mockUsers.some((u) => u.email === email);
    const usernameExists = mockUsers.some((u) => u.username === username);

    if (emailExists || usernameExists) {
      return HttpResponse.json(
        { message: '이미 가입된 이메일, username이 존재하는 경우' },
        { status: 409 },
      );
    }

    const newUser = {
      userId: mockUsers.length + 1,
      email,
      username,
      name,
      profileImageUrl: null,
    };

    mockUsers.push(newUser);

    return HttpResponse.json(
      {
        message: '회원가입 성공',
        createdAt: new Date().toISOString(),
        token: {
          accessToken: 'wruwi03riw039i09w3i0...',
          refreshToken: 'o32uuw93urwru309urw09...',
        },
        user: newUser,
      },
      { status: 200 },
    );
  }),

  //로그인
  http.post('/users/login', async ({ request }) => {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return HttpResponse.json(
        { message: '로그인 필수 정보를 작성하지 않은 경우' },
        { status: 400 },
      );
    }

    const user = mockUsers.find((u) => u.username === username);

    if (!user) {
      return HttpResponse.json(
        { message: '토큰이 없거나 유효하지 않은 경우' },
        { status: 401 },
      );
    }

    return HttpResponse.json(
      {
        message: '로그인 성공',
        token: {
          accessToken: 'wruwi03riw039i09w3i0...',
          refreshToken: 'o32uuw93urwru309urw09...',
        },
        user,
      },
      { status: 200 },
    );
  }),
  //내프로필 조회
  //내프로필 수정
  //다른 사용자 프로필 조회
  //사용자 검색
  //계정 공개 설정
  //비밀번호 변경
  //이메일 변경
  //유저네임 변경
  //리스트 생성
  //리스트 조회
  //리스트 삭제
  //리스트 멤버 추가
  //리스트 멤버 삭제
  //리스트 멤버 조회
  //다른 사용자 리스트 조회
  //비밀번호 검즌
];
