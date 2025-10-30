"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  getCalendarByInviteCode,
  joinCalendar,
} from "@/lib/queries/calendarQueries";
import type { CalendarWithMembers } from "@/types/calendar.types";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [calendar, setCalendar] = useState<CalendarWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const token = params?.token as string;

  const loadCalendar = async () => {
    try {
      setLoading(true);
      setError("");
      const calendarData = await getCalendarByInviteCode(token);
      if (!calendarData) {
        setError("招待コードが無効です");
      } else {
        setCalendar(calendarData);
      }
    } catch (err: any) {
      setError(err.message || "カレンダー情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadCalendar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleJoin = async () => {
    if (!user) {
      router.push(`/login?redirect=/invite/${token}`);
      return;
    }

    try {
      setJoining(true);
      setError("");
      const result = await joinCalendar(token);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || "カレンダーへの参加に失敗しました");
    } finally {
      setJoining(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="size-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !calendar) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="size-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">エラー</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="size-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              参加完了!
            </h2>
            <p className="mt-2 text-gray-600">カレンダーに参加しました</p>
            <p className="mt-1 text-sm text-gray-500">
              ホームページにリダイレクトしています...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            カレンダーへの招待
          </h1>
          <p className="mt-2 text-gray-600">
            {user
              ? "このカレンダーに参加しますか？"
              : "ログインしてカレンダーに参加してください"}
          </p>
        </div>

        {calendar && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <span className="text-4xl">{calendar.icon || "📅"}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{calendar.name}</h3>
                {calendar.description && (
                  <p className="mt-1 text-sm text-gray-600">
                    {calendar.description}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  メンバー: {calendar.member_count}/8
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              {user ? (
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {joining ? "参加中..." : "カレンダーに参加"}
                </button>
              ) : (
                <button
                  onClick={() =>
                    router.push(`/login?redirect=/invite/${token}`)
                  }
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  ログインして参加
                </button>
              )}

              <button
                onClick={() => router.push("/")}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                キャンセル
              </button>
            </div>

            {calendar.members && calendar.members.length > 0 && (
              <div className="mt-6">
                <h4 className="mb-3 text-sm font-medium text-gray-700">
                  メンバー
                </h4>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3">
                  {calendar.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center space-x-3"
                    >
                      {member.user.avatar_url ? (
                        <img
                          src={member.user.avatar_url}
                          alt={member.user.name}
                          className="size-8 rounded-full"
                        />
                      ) : (
                        <div className="flex size-8 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
                          {member.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {member.user.name}
                        </p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
