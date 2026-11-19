import { prisma } from "./db";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export type Role = "SERVANT" | "CLASS_ADMIN" | "MINISTRY_ADMIN";

export interface SessionUser {
  id: string;
  username: string;
  name: string;
  role: Role;
  servantId: string | null;
  classId: string | null;
}

const SESSION_COOKIE = "ava-session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = Buffer.from(`${userId}:${Date.now()}`).toString("base64");
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, `${userId}:${token}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session) return null;

  const userId = session.value.split(":")[0];
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role as Role,
    servantId: user.servantId,
    classId: user.classId,
  };
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function canAccessPerson(user: SessionUser, person: { servantId?: string | null; classId?: string | null }) {
  if (user.role === "MINISTRY_ADMIN") return true;
  if (user.role === "CLASS_ADMIN") return person.classId === user.classId;
  if (user.role === "SERVANT") return person.servantId === user.servantId;
  return false;
}

export function canAccessClass(user: SessionUser, classId: string) {
  if (user.role === "MINISTRY_ADMIN") return true;
  if (user.role === "CLASS_ADMIN") return classId === user.classId;
  return false;
}
