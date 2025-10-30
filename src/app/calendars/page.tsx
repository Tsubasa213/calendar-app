"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  getUserCalendars,
  getCalendarStats,
  deleteCalendar,
  joinCalendar,
  leaveCalendar,
  getInviteUrl,
} from "@/lib/queries/calendarQueries";
import type {
  CalendarWithMembers,
  CalendarStats,
} from "@/types/calendar.types";
import CreateCalendarModal from "@/app/_components/CreateCalendarModal";
import ShareCalendarModal from "@/app/_components/ShareCalendarModal";

export default function CalendarsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [calendars, setCalendars] = useState<CalendarWithMembers[]>([]);
  const [stats, setStats] = useState<CalendarStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [shareCalendar, setShareCalendar] =
    useState<CalendarWithMembers | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");
  const [joiningCalendar, setJoiningCalendar] = useState(false);

  useEffect(() => {
    loadCalendars();
  }, []);

  const loadCalendars = async () => {
    try {
      setLoading(true);
      const [calendarsData, statsData] = await Promise.all([
        getUserCalendars(),
        getCalendarStats(),
      ]);
      setCalendars(calendarsData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load calendars:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadCalendars();
  };

  const handleDeleteCalendar = async (
    calendarId: string,
    calendarName: string
  ) => {
    if (
      !confirm(
        `本当に「${calendarName}」を削除しますか？\nこの操作は取り消せません。`
      )
    ) {
      return;
    }

    try {
      await deleteCalendar(calendarId);
      await loadCalendars();
    } catch (error: any) {
      alert(error.message || "カレンダーの削除に失敗しました");
    }
  };

  const handleLeaveCalendar = async (
    calendarId: string,
    calendarName: string
  ) => {
    if (!confirm(`本当に「${calendarName}」から退出しますか？`)) {
      return;
    }

    try {
      await leaveCalendar(calendarId);
      await loadCalendars();
    } catch (error: any) {
      alert(error.message || "カレンダーからの退出に失敗しました");
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError("");
    setJoinSuccess("");

    if (!inviteCode.trim()) {
      setJoinError("招待コードを入力してください");
      return;
    }

    try {
      setJoiningCalendar(true);
      const result = await joinCalendar(inviteCode.trim());

      if (result.success) {
        setJoinSuccess(result.message);
        setInviteCode("");
        await loadCalendars();
        setTimeout(() => setJoinSuccess(""), 3000);
      } else {
        setJoinError(result.message);
      }
    } catch (error: any) {
      setJoinError(error.message || "カレンダーへの参加に失敗しました");
    } finally {
      setJoiningCalendar(false);
    }
  };

  const isOwner = (calendar: CalendarWithMembers) => {
    return calendar.owner_id === user?.id;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="size-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto bg-gray-50 p-4 pb-20 lg:pb-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">カレンダー管理</h1>
          <button
            onClick={() => router.push("/")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            戻る
          </button>
        </div>

        {/* 統計情報 */}
        {stats && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-sm text-gray-600">作成したカレンダー</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {stats.owned_calendars}/2
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-sm text-gray-600">参加中のカレンダー</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {stats.participated_calendars}/3
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-sm text-gray-600">合計</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {calendars.length}
              </p>
            </div>
          </div>
        )}

        {/* 招待コードで参加 */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            招待コードで参加
          </h2>
          <form onSubmit={handleJoinByCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                招待コードまたはURL
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="例: ABC123DEF456 または https://..."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={joiningCalendar || !stats?.can_join_more}
              />
              {!stats?.can_join_more && (
                <p className="mt-1 text-sm text-red-600">
                  参加できるカレンダーの上限（3つ）に達しています
                </p>
              )}
            </div>
            {joinError && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{joinError}</p>
              </div>
            )}
            {joinSuccess && (
              <div className="rounded-md bg-green-50 p-3">
                <p className="text-sm text-green-800">{joinSuccess}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={joiningCalendar || !stats?.can_join_more}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300"
            >
              {joiningCalendar ? "参加中..." : "参加する"}
            </button>
          </form>
        </div>

        {/* カレンダー一覧 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              マイカレンダー
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={!stats?.can_create_more}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                stats?.can_create_more
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "cursor-not-allowed bg-gray-300 text-gray-500"
              }`}
              title={
                stats?.can_create_more
                  ? "新しいカレンダーを作成"
                  : "カレンダー作成上限（2つ）に達しました"
              }
            >
              {stats?.can_create_more ? "+ 新規作成" : "作成上限に達しました"}
            </button>
          </div>
          {calendars.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <p>カレンダーがありません</p>
              <p className="mt-2 text-sm">
                新しいカレンダーを作成するか、招待コードで参加してください
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {calendars.map((calendar) => {
                const owner = isOwner(calendar);
                return (
                  <div
                    key={calendar.id}
                    className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">
                          {calendar.icon || "📅"}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {calendar.name}
                            </h3>
                            {owner && (
                              <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                オーナー
                              </span>
                            )}
                          </div>
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShareCalendar(calendar)}
                          className="rounded-md bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200"
                          title="共有"
                        >
                          <svg
                            className="size-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                            />
                          </svg>
                        </button>
                        {owner ? (
                          <button
                            onClick={() =>
                              handleDeleteCalendar(calendar.id, calendar.name)
                            }
                            className="rounded-md bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200"
                            title="削除"
                          >
                            <svg
                              className="size-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleLeaveCalendar(calendar.id, calendar.name)
                            }
                            className="rounded-md bg-yellow-100 p-2 text-yellow-600 transition-colors hover:bg-yellow-200"
                            title="退出"
                          >
                            <svg
                              className="size-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateCalendarModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {shareCalendar && (
        <ShareCalendarModal
          isOpen={!!shareCalendar}
          calendar={shareCalendar}
          onClose={() => setShareCalendar(null)}
        />
      )}
    </div>
  );
}
