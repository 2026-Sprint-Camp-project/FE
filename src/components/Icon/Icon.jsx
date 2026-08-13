import styles from './Icon.module.css';

// 아이콘 path 데이터 출처: Figma 파일(qThbbN9ZQQwNseRmgtMIZR)에서 내려받은
// src/assets/icons/*.svg 원본을 그대로 옮긴 것. 디자인이 바뀌면 해당 svg를
// 다시 받아 이 맵을 갱신한다. stroke/fill 색상은 currentColor로 바꿔서
// color prop과 다크모드 대응이 CSS만으로 가능하도록 했다.
const ICONS = {
  home: {
    viewBox: '0 0 30 30',
    paths: (
      <>
        <path
          d="M3.75 13.125L15 3.75L26.25 13.125"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.25 11.875V25C6.25 25.3315 6.3817 25.6495 6.61612 25.8839C6.85054 26.1183 7.16848 26.25 7.5 26.25H12.5V18.75H17.5V26.25H22.5C22.8315 26.25 23.1495 26.1183 23.3839 25.8839C23.6183 25.6495 23.75 25.3315 23.75 25V11.875"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  search: {
    viewBox: '0 0 30 30',
    paths: (
      <>
        <path
          d="M13.125 21.875C17.9575 21.875 21.875 17.9575 21.875 13.125C21.875 8.29251 17.9575 4.375 13.125 4.375C8.29251 4.375 4.375 8.29251 4.375 13.125C4.375 17.9575 8.29251 21.875 13.125 21.875Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M26.25 26.25L20.875 20.875"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  bell: {
    viewBox: '0 0 30 30',
    paths: (
      <>
        <path
          d="M7.5 10C7.5 8.01088 8.29018 6.10322 9.6967 4.6967C11.1032 3.29018 13.0109 2.5 15 2.5C16.9891 2.5 18.8968 3.29018 20.3033 4.6967C21.7098 6.10322 22.5 8.01088 22.5 10C22.5 18.75 26.25 21.25 26.25 21.25H3.75C3.75 21.25 7.5 18.75 7.5 10Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.875 26.25C13.0842 26.6306 13.3918 26.9479 13.7656 27.169C14.1394 27.39 14.5657 27.5067 15 27.5067C15.4343 27.5067 15.8606 27.39 16.2344 27.169C16.6082 26.9479 16.9158 26.6306 17.125 26.25"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  user: {
    viewBox: '0 0 30 30',
    paths: (
      <>
        <path
          d="M15 15C17.7614 15 20 12.7614 20 10C20 7.23858 17.7614 5 15 5C12.2386 5 10 7.23858 10 10C10 12.7614 12.2386 15 15 15Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M5 26.25C5 21.25 10 18.75 15 18.75C20 18.75 25 21.25 25 26.25"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  more: {
    viewBox: '0 0 30 30',
    paths: (
      <>
        <path
          d="M6.25 17.25C7.49264 17.25 8.5 16.2426 8.5 15C8.5 13.7574 7.49264 12.75 6.25 12.75C5.00736 12.75 4 13.7574 4 15C4 16.2426 5.00736 17.25 6.25 17.25Z"
          fill="currentColor"
        />
        <path
          d="M15 17.25C16.2426 17.25 17.25 16.2426 17.25 15C17.25 13.7574 16.2426 12.75 15 12.75C13.7574 12.75 12.75 13.7574 12.75 15C12.75 16.2426 13.7574 17.25 15 17.25Z"
          fill="currentColor"
        />
        <path
          d="M23.75 17.25C24.9926 17.25 26 16.2426 26 15C26 13.7574 24.9926 12.75 23.75 12.75C22.5074 12.75 21.5 13.7574 21.5 15C21.5 16.2426 22.5074 17.25 23.75 17.25Z"
          fill="currentColor"
        />
      </>
    ),
  },
  image: {
    viewBox: '0 0 20 20',
    paths: (
      <>
        <path
          d="M15 2.5H5C3.61929 2.5 2.5 3.61929 2.5 5V15C2.5 16.3807 3.61929 17.5 5 17.5H15C16.3807 17.5 17.5 16.3807 17.5 15V5C17.5 3.61929 16.3807 2.5 15 2.5Z"
          stroke="currentColor"
          strokeWidth="1.66667"
        />
        <path
          d="M7.08333 8.41667C7.81971 8.41667 8.41667 7.81971 8.41667 7.08333C8.41667 6.34695 7.81971 5.75 7.08333 5.75C6.34695 5.75 5.75 6.34695 5.75 7.08333C5.75 7.81971 6.34695 8.41667 7.08333 8.41667Z"
          fill="currentColor"
        />
        <path
          d="M17.5 12.5L13.3333 8.33333L10 11.6667L7.5 9.16667L2.5 14.1667"
          stroke="currentColor"
          strokeWidth="1.66667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  poll: {
    viewBox: '0 0 20 20',
    paths: (
      <>
        <path d="M15 16.6667V8.33333" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 16.6667V3.33333" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 16.6667V11.6667" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  emoji: {
    viewBox: '0 0 20 20',
    paths: (
      <>
        <path
          d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z"
          stroke="currentColor"
          strokeWidth="1.66667"
        />
        <path
          d="M6.66667 11.6667C6.66667 11.6667 7.91667 13.3333 10 13.3333C12.0833 13.3333 13.3333 11.6667 13.3333 11.6667"
          stroke="currentColor"
          strokeWidth="1.66667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.5 9.16667C7.96024 9.16667 8.33333 8.79357 8.33333 8.33333C8.33333 7.8731 7.96024 7.5 7.5 7.5C7.03976 7.5 6.66667 7.8731 6.66667 8.33333C6.66667 8.79357 7.03976 9.16667 7.5 9.16667Z"
          fill="currentColor"
        />
        <path
          d="M12.5 9.16667C12.9602 9.16667 13.3333 8.79357 13.3333 8.33333C13.3333 7.8731 12.9602 7.5 12.5 7.5C12.0398 7.5 11.6667 7.8731 11.6667 8.33333C11.6667 8.79357 12.0398 9.16667 12.5 9.16667Z"
          fill="currentColor"
        />
      </>
    ),
  },
  schedule: {
    viewBox: '0 0 20 20',
    paths: (
      <>
        <path
          d="M15.8333 4.16667H4.16667C3.24619 4.16667 2.5 4.91286 2.5 5.83333V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H15.8333C16.7538 17.5 17.5 16.7538 17.5 15.8333V5.83333C17.5 4.91286 16.7538 4.16667 15.8333 4.16667Z"
          stroke="currentColor"
          strokeWidth="1.66667"
        />
        <path d="M2.5 8.33333H17.5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.66667 2.5V5.83333" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.3333 2.5V5.83333" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  reply: {
    viewBox: '0 0 18 18',
    paths: (
      <path
        d="M2.25 9C2.25 5.7 5.25 3 9 3C12.75 3 15.75 5.7 15.75 9C15.75 12.3 12.75 15 9 15C8.175 15 7.35 14.85 6.6 14.625L2.25 15.75L3.375 12.375C2.625 11.25 2.25 10.125 2.25 9Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  retweet: {
    viewBox: '0 0 18 18',
    paths: (
      <>
        <path d="M12.75 1.5L15.75 4.5L12.75 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M2.25 8.25V7.5C2.25 6.70435 2.56607 5.94129 3.12868 5.37868C3.69129 4.81607 4.45435 4.5 5.25 4.5H15.75"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M5.25 16.5L2.25 13.5L5.25 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M15.75 9.75V10.5C15.75 11.2956 15.4339 12.0587 14.8713 12.6213C14.3087 13.1839 13.5456 13.5 12.75 13.5H2.25"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  heart: {
    viewBox: '0 0 18 18',
    paths: (
      <path
        d="M9 15.75C9 15.75 3.75 12.45 1.875 9C1.22853 8.05517 0.983881 6.89222 1.19486 5.767C1.40584 4.64179 2.05517 3.64647 3 3C3.94483 2.35353 5.10778 2.10888 6.233 2.31986C7.35821 2.53084 8.35353 3.18017 9 4.125C9.64646 3.18017 10.6418 2.53084 11.767 2.31986C12.3242 2.21539 12.8964 2.22169 13.4511 2.33839C14.0059 2.45509 14.5322 2.6799 15 3C15.4678 3.3201 15.868 3.72921 16.1778 4.20397C16.4875 4.67873 16.7007 5.20985 16.8051 5.767C16.9096 6.32416 16.9033 6.89643 16.7866 7.45115C16.6699 8.00586 16.4451 8.53217 16.125 9C14.25 12.45 9 15.75 9 15.75Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  bookmark: {
    viewBox: '0 0 18 18',
    paths: (
      <path
        d="M4.5 2.25H13.5C13.6989 2.25 13.8897 2.32902 14.0303 2.46967C14.171 2.61032 14.25 2.80109 14.25 3V15.75L9 12.75L3.75 15.75V3C3.75 2.80109 3.82902 2.61032 3.96967 2.46967C4.11032 2.32902 4.30109 2.25 4.5 2.25Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  share: {
    viewBox: '0 0 18 18',
    paths: (
      <>
        <path d="M9 2.25V11.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.25 6L9 2.25L12.75 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.75 15.75H14.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
};

/**
 * 공통 아이콘 컴포넌트. Figma에서 내려받은 벡터 path를 그대로 사용하고,
 * 색은 currentColor로 둬서 color prop이나 부모의 CSS color로 제어한다.
 *
 * @param {{ name: keyof typeof ICONS, size?: number, color?: string, className?: string }} props
 */
function Icon({ name, size = 24, color = 'currentColor', className, ...rest }) {
  const icon = ICONS[name];

  if (!icon) {
    if (import.meta.env.DEV) {
      console.warn(`Icon: 알 수 없는 아이콘 이름 "${name}"`);
    }
    return null;
  }

  return (
    <svg
      className={className ? `${styles.icon} ${className}` : styles.icon}
      width={size}
      height={size}
      viewBox={icon.viewBox}
      fill="none"
      color={color}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      {icon.paths}
    </svg>
  );
}

export default Icon;
