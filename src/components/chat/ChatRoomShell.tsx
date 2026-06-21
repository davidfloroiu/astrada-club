"use client";

import { useState } from "react";
import { chatRooms, defaultRoomSlug, chatRoomBySlug } from "@/lib/whop/config";
import { CommunityChat } from "@/components/chat/CommunityChat";
import { RoomSidebar } from "@/components/chat/RoomSidebar";

/**
 * Two-pane community chat: a room switcher + the active room's embed. Switching
 * rooms changes the `channelId` passed to the embed; the Whop session/token stay
 * mounted above the swapped <ChatElement>.
 */
export function ChatRoomShell() {
  const [slug, setSlug] = useState(defaultRoomSlug);
  const room = chatRoomBySlug(slug) ?? chatRooms[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-6">
      <RoomSidebar activeSlug={room.slug} onSelect={setSlug} />
      <CommunityChat channelId={room.channelId} />
    </div>
  );
}
