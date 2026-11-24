import { GoogleIcon } from "truncgil-uxigl";

export interface LessonBell {
  readonly label: string;
}

export function lessonBell(now: Date): LessonBell {
  const period = (now.getHours() % 6) + 1;
  const minutesLeft = 14 - (now.getMinutes() % 14);
  return { label: `${period}. Ders · ${minutesLeft} dk` };
}

export function LessonBellBadge(): React.JSX.Element {
  const bell = lessonBell(new Date());
  return (
    <span className="osgl-bell" aria-label="Ders zili">
      <GoogleIcon name="notifications_active" size="sm" />
      {bell.label}
    </span>
  );
}
