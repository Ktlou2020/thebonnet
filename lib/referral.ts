import { db } from "@/lib/db";

export function generateReferralCode(userId: string): string {
  return `BON-${userId.slice(0, 6).toUpperCase()}`;
}

export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const profile = await db.profile.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });
  if (profile?.referralCode) return profile.referralCode;
  const code = generateReferralCode(userId);
  await db.profile.update({ where: { id: userId }, data: { referralCode: code } });
  return code;
}

export async function processReferral(
  newUserId: string,
  referralCode: string
): Promise<void> {
  const referrer = await db.profile.findFirst({ where: { referralCode } });
  if (!referrer || referrer.id === newUserId) return;
  await db.referral.create({
    data: { referrerId: referrer.id, referredEmail: newUserId },
  });
  const until = new Date();
  until.setMonth(until.getMonth() + 1);
  await db.profile.update({
    where: { id: referrer.id },
    data: { bonnetPlusUntil: until },
  });
}
