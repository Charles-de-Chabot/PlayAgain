import prisma from "@/lib/prisma";
import { getClientIp } from "@/lib/ip";

/**
 * Logs a user activity with their IP address to the database.
 * @param userId - The ID of the user performing the action.
 * @param action - The action name (e.g., "LOGIN", "PRODUCT_CREATE", "CHECKOUT").
 */
export async function logUserActivity(userId: number, action: string): Promise<void> {
  try {
    const ipAddress = await getClientIp();
    await prisma.userActivityLog.create({
      data: {
        userId,
        action,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("Failed to log user activity:", error);
  }
}
