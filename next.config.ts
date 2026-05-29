import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  output: "standalone",
  typedRoutes: false,
  // Enables instrumentation.ts, which runs prisma migrate deploy at startup
  // before any requests are handled, preventing P2022 schema-mismatch errors.
  instrumentationHook: true,
};

export default withSentryConfig(nextConfig, {
  silent: true,
  telemetry: false,
});
