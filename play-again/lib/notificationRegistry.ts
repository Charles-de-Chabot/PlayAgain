type PushCallback = (data: string) => void;

class NotificationRegistry {
  private clients = new Map<number, PushCallback>();

  register(userId: number, callback: PushCallback) {
    this.clients.set(userId, callback);
  }

  unregister(userId: number) {
    this.clients.delete(userId);
  }

  trigger(userId: number, data: any) {
    const send = this.clients.get(userId);
    if (send) {
      try {
        send(JSON.stringify(data));
      } catch (err) {
        console.error(`Erreur d'envoi SSE pour l'utilisateur ${userId}:`, err);
      }
    }
  }
}

// Global singleton pour préserver l'état lors du Hot Module Replacement (HMR) de Next.js en développement
const globalForRegistry = global as unknown as { notificationRegistry?: NotificationRegistry };
export const notificationRegistry = globalForRegistry.notificationRegistry || new NotificationRegistry();

if (process.env.NODE_ENV !== "production") {
  globalForRegistry.notificationRegistry = notificationRegistry;
}
