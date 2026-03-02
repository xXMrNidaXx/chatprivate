// Simple analytics tracking
export const track = (event: string, data?: Record<string, unknown>) => {
  try {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data }),
    }).catch(() => {}); // Fire and forget
  } catch {
    // Ignore tracking errors
  }
};

// Predefined events
export const events = {
  PAGE_VIEW: 'page_view',
  CHAT_START: 'chat_start',
  MESSAGE_SENT: 'message_sent',
  SIGNUP_CLICK: 'signup_click',
  UPGRADE_CLICK: 'upgrade_click',
  SUBSCRIBE_EMAIL: 'subscribe_email',
  EXPORT_CHAT: 'export_chat',
};
