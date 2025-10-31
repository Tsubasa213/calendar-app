"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useCalendar } from "@/app/context/CalendarContext";
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
import EventTypeManager from "@/app/_components/EventTypeManager";
import EditCalendarModal from "@/app/_components/EditCalendarModal";
import { EventType } from "@/types/event.types";
("@/app/context/CalendarContext");

export default function CalendarsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { setCurrentCalendarId } = useCalendar();
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
  const [editCalendarId, setEditCalendarId] = useState<string | null>(null);
  const [calendarEventTypes, setCalendarEventTypes] = useState<
    Record<string, EventType[]>
  >({});
  const [editCalendarData, setEditCalendarData] = useState<
    Record<string, { name: string; description: string; icon: string }>
  >({});

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

  const handleCalendarClick = (calendarId: string) => {
    setCurrentCalendarId(calendarId);
    router.push("/");
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
                const eventTypes = calendarEventTypes[calendar.id] || [];
                const editData = editCalendarData[calendar.id] || {
                  name: calendar.name,
                  description: calendar.description || "",
                  icon: calendar.icon || "📅",
                };
                return (
                  <button
                    key={calendar.id}
                    className="mb-2 w-full rounded-lg border border-gray-200 p-4 text-left transition-shadow hover:shadow-md focus:outline-none"
                    onClick={() => {
                      if (editCalendarId === calendar.id) {
                        handleCalendarClick(calendar.id);
                      } else {
                        setEditCalendarId(calendar.id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{editData.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {editData.name}
                          </h3>
                          {owner && (
                            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                              オーナー
                            </span>
                          )}
                        </div>
                        {editData.description && (
                          <p className="mt-1 text-sm text-gray-600">
                            {editData.description}
                          </p>
                        )}
                        <p className="mt-2 text-sm text-gray-500">
                          メンバー: {calendar.member_count}/8
                        </p>
                      </div>
                    </div>
                  </button>
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

      {/* 編集モーダル */}
      {editCalendarId && (
        <EditCalendarModal
          isOpen={!!editCalendarId}
          calendar={calendars.find((c) => c.id === editCalendarId)!}
          eventTypes={calendarEventTypes[editCalendarId] || []}
          onChangeEventTypes={(types) =>
            setCalendarEventTypes({
              ...calendarEventTypes,
              [editCalendarId]: types,
            })
          }
          onClose={() => setEditCalendarId(null)}
          onSave={({ name, description, icon, eventTypes }) => {
            setEditCalendarData({
              ...editCalendarData,
              [editCalendarId]: { name, description, icon },
            });
            setCalendarEventTypes({
              ...calendarEventTypes,
              [editCalendarId]: eventTypes,
            });
            setEditCalendarId(null);
          }}
        />
      )}
    </div>
  );
}
