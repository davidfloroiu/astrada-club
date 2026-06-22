/** Client-safe notification shape (the store is server-only; this isn't). */
export interface StoredNotification {
  id: string;
  type: string; // 'forum_mention' | 'chat_mention'
  actorId: string;
  actorName: string;
  title: string;
  body: string;
  url: string;
  read: boolean;
  createdAt: string;
}
