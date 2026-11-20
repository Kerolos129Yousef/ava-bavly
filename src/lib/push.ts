import * as webpush from "web-push";
import { prisma } from "./db";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY!;

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails("mailto:push@ava-bavly.vercel.app", VAPID_PUBLIC, VAPID_PRIVATE);
}

export async function sendPushToUsers(userIds: string[], payload: { title: string; body: string; url?: string }) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: { in: userIds } },
  });

  console.log("sendPushToUsers: found", subscriptions.length, "subscriptions for", userIds.length, "users");
  const data = JSON.stringify(payload);

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          data
        );
      } catch (err: any) {
        console.error("Push send error:", err.statusCode, err.message);
        if (err.statusCode === 410 || err.statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
      }
    })
  );
}

export async function sendPushToClass(classId: string | null, payload: { title: string; body: string; url?: string }) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;

  const where: any = { role: "SERVANT" };
  if (classId) {
    where.classId = classId;
  }

  const users = await prisma.user.findMany({
    where,
    select: { id: true },
  });

  console.log("sendPushToClass: found", users.length, "users for classId:", classId);
  if (users.length === 0) return;
  await sendPushToUsers(users.map((u) => u.id), payload);
}
