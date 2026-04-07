import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://9cbccfe8d06250c49f2b90bd7ede1215@o4511175505936384.ingest.de.sentry.io/4511175522123856",
  environment: process.env.NODE_ENV,
  release: "gato-returns@1.0.0",
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration(),
  ],
});
