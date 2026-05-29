import { PostHog } from "posthog-node";

let _client: PostHog | null = null;

export function getPostHogClient(): PostHog | null {
  if (!process.env.POSTHOG_KEY) return null;
  if (!_client) {
    _client = new PostHog(process.env.POSTHOG_KEY, {
      host: process.env.POSTHOG_HOST ?? "https://app.posthog.com",
    });
  }
  return _client;
}

export function trackServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
): void {
  getPostHogClient()?.capture({ distinctId, event, properties });
}
