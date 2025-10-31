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
import { createClient } from "@/lib/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareAlt } from "@fortawesome/free-solid-svg-icons";

export default function CalendarsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    setCurrentCalendarId,
    currentCalendarId,
    refreshEventTypes: refreshGlobalEventTypes,
  } = useCalendar();
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

  const supabase = createClient();

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

  const handleOpenEditModal = async (calendar: CalendarWithMembers) => {
    try {
      const { data, error } = await supabase
        .from("event_types")
        .select("*")
        .eq("calendar_id", calendar.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setCalendarEventTypes((prev) => ({
        ...prev,
        [calendar.id]: data || [],
      }));

      setEditCalendarId(calendar.id);
    } catch (error) {
      console.error("Failed to load event types:", error);
      alert("ジャンルの読み込みに失敗しました");
    }
  };

  const handleSaveCalendar = async (
    calendarId: string,
    data: {
      name: string;
      description: string;
      icon: string;
      eventTypes: EventType[];
    }
  ) => {
    try {
      const { error: calendarError } = await supabase
        .from("calendars")
        .update({
          name: data.name,
          description: data.description,
          icon: data.icon,
          updated_at: new Date().toISOString(),
        })
        .eq("id", calendarId);
      if (calendarError) throw calendarError;

      const { error: deleteError } = await supabase
        .from("event_types")
        .delete()
        .eq("calendar_id", calendarId);
      if (deleteError) throw deleteError;

      if (data.eventTypes.length > 0) {
        const typesToInsert = data.eventTypes.map((type) => ({
          // id: type.id, // IDは自動生成させる
          calendar_id: calendarId,
          name: type.name,
          color: type.color,
          created_at: new Date().toISOString(),
        }));
        const { error: insertError } = await supabase
          .from("event_types")
          .insert(typesToInsert);
        if (insertError) throw insertError;
      }

      await loadCalendars();

      if (calendarId === currentCalendarId) {
        await refreshGlobalEventTypes();
      }

      setEditCalendarId(null);
      alert("カレンダー設定を保存しました");
    } catch (error: any) {
      console.error("Save error:", error);
      alert("保存に失敗しました: " + error.message);
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
            {/* --- ▼ 修正点: ボタンクラスを変更 ▼ --- */}
            <button
              type="submit"
              disabled={joiningCalendar || !stats?.can_join_more}
              className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 font-medium text-blue-600 backdrop-blur-sm transition-all hover:border-blue-500/50 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {joiningCalendar ? "参加中..." : "参加する"}
            </button>
            {/* --- ▲ 修正点 ▲ --- */}
          </form>
        </div>

        {/* カレンダー一覧 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              マイカレンダー
            </h2>
            {/* --- ▼ 修正点: ボタンクラスを変更 ▼ --- */}
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={!stats?.can_create_more}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                stats?.can_create_more
                  ? "border border-blue-500/30 bg-blue-500/10 text-blue-600 backdrop-blur-sm hover:border-blue-500/50 hover:bg-blue-500/20"
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
            {/* --- ▲ 修正点 ▲ --- */}
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
                  <button
                    key={calendar.id}
                    className="mb-2 w-full rounded-lg border border-gray-200 p-4 text-left transition-shadow hover:shadow-md focus:outline-none"
                    onClick={() => {
                      handleOpenEditModal(calendar);
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-1 items-start gap-3">
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

                      <div className="shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShareCalendar(calendar);
                          }}
                          className="ml-4 rounded p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                          title="招待URLを共有"
                        >
                          <FontAwesomeIcon
                            icon={faShareAlt}
                            className="size-5"
                          />
                        </button>
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
            handleSaveCalendar(editCalendarId, {
              name,
              description,
              icon,
              eventTypes,
            });
          }}
        />
      )}
    </div>
  );
}
