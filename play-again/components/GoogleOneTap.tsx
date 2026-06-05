"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";

declare global {
  interface Window {
    google?: any;
  }
}

/**
 * GoogleOneTap Component
 * Renders the Google One Tap prompt for unauthenticated users,
 * configured with dark mode and a custom layout container.
 */
export default function GoogleOneTap() {
  const { data: session, status } = useSession();
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // If user is already authenticated, do nothing
    if (status !== "unauthenticated" || session) return;

    // Avoid reloading the script if already initialized
    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, [session, status]);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!scriptLoaded || !clientId || status !== "unauthenticated" || session) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          await signIn("credentials", {
            credentialToken: response.credential,
            isOneTap: "true",
            redirect: true,
            callbackUrl: "/profile",
          });
        },
        theme: "dark",               // Dark theme to match the website style
        ui_mode: "card",             // Premium card layout
        cancel_on_tap_outside: false, // Prevent accidental dismissal
        use_fedcm: false,            // Disable FedCM to prevent local development NetworkErrors
      });

      // Display the prompt
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          console.warn("One Tap not displayed:", notification.getNotDisplayedReason());
        }
      });
    } catch (error) {
      console.error("Google One Tap initialization failed:", error);
    }
  }, [scriptLoaded, status, session]);

  // Floating wrapper with absolute layering and neon purple glow
  return (
    <div 
      id="oneTapHelper" 
      className="fixed right-4 top-4 z-[9999] max-w-[375px] shadow-[0_8px_30px_rgba(125,56,255,0.2)] rounded-2xl overflow-hidden" 
    />
  );
}
