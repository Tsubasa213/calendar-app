"use client";

import { useState } from "react";
import Image from "next/image"; // 1. next/image をインポート
import { getInviteUrl } from "@/lib/queries/calendarQueries";
import type { CalendarWithMembers } from "@/types/calendar.types";

interface ShareCalendarModalProps {
  isOpen: boolean;
  calendar: CalendarWithMembers;
  onClose: () => void;
}

export default function ShareCalendarModal({
  isOpen,
  calendar,
  onClose,
}: ShareCalendarModalProps) {
  const [copied, setCopied] = useState(false);

  const inviteUrl = calendar.invite_code
    ? getInviteUrl(calendar.invite_code)
    : "";

  const handleCopy = async () => {
    if (!inviteUrl) {
      alert("招待URLが生成されていません。カレンダーを再作成してください。");
      return;
    }
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              カレンダーを共有
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg
                className="size-6"
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
            </button>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="flex items-center space-x-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <span className="text-3xl">{calendar.icon || "📅"}</span>
            <div>
              <h3 className="font-medium text-gray-900">{calendar.name}</h3>
              <p className="text-sm text-gray-500">
                メンバー: {calendar.member_count}/8
              </p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              招待URL
            </label>
            {!inviteUrl ? (
              <div className="rounded-md bg-yellow-50 p-3">
                <p className="text-sm text-yellow-800">
                  招待URLが生成されていません。このカレンダーは古いバージョンで作成された可能性があります。
                  新しいカレンダーを作成してください。
                </p>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteUrl}
                    readOnly
                    className="block flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600"
                  />
                  <button
                    onClick={handleCopy}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    {copied ? "✓ コピー済み" : "コピー"}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  このURLを共有することで、他のユーザーをカレンダーに招待できます
                </p>
              </>
            )}
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-700">
              メンバー一覧
            </h4>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3">
              {calendar.members && calendar.members.length > 0 ? (
                calendar.members.map((member) => {
                  if (!member.user || !member.user.id) {
                    return (
                      <div
                        key={member.id}
                        className="flex items-center space-x-3 opacity-50"
                      >
                        <div className="flex size-8 items-center justify-center rounded-full bg-gray-400 text-sm font-medium text-white">
                          ?
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            不明なユーザー
                          </p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={member.id}
                      className="flex items-center space-x-3"
                    >
                      {/* --- ▼ 修正点: <img> を <Image> に変更 ▼ --- */}
                      {member.user.avatar_url ? (
                        <Image
                          src={member.user.avatar_url}
                          alt={member.user.name || "アバター"}
                          width={32}
                          height={32}
                          className="size-8 rounded-full"
                        />
                      ) : (
                        <div className="flex size-8 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
                          {member.user.name
                            ? member.user.name.charAt(0).toUpperCase()
                            : "?"}
                        </div>
                      )}
                      {/* --- ▲ 修正点 ▲ --- */}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {member.user.name || "名前なし"}
                        </p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">メンバーがいません</p>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-yellow-50 p-3">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="size-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  カレンダーには最大8人まで参加できます（現在:{" "}
                  {calendar.member_count}/8）
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
