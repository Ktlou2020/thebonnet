import { db } from "@/lib/db";
import { getDriverLevel } from "./gamification";

export async function awardXp(profileId: string, amount: number) {
  const xp = await db.userXP.upsert({
    where: { profileId },
    create: { profileId, totalXp: amount, level: 1 },
    update: { totalXp: { increment: amount } },
  });
  const level = getDriverLevel(xp.totalXp);
  if (xp.level !== level.level) {
    await db.userXP.update({ where: { profileId }, data: { level: level.level } });
  }
  return xp;
}
