import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import DocsLayout from "./DocsLayout";

// ─── Lazy page imports ────────────────────────────────────────────────────────

const Introduction       = lazy(() => import("./pages/introduction"));
const WhatsNew           = lazy(() => import("./pages/whats-new"));
const Quickstart         = lazy(() => import("./pages/quickstart"));
const Authentication     = lazy(() => import("./pages/authentication"));
const Errors             = lazy(() => import("./pages/errors"));

const UnderstandOverview = lazy(() => import("./pages/understand-overview"));
const UnderstandText     = lazy(() => import("./pages/understand-text"));
const UnderstandAudio    = lazy(() => import("./pages/understand-audio"));
const Codeswitch         = lazy(() => import("./pages/codeswitch"));
const Provisional        = lazy(() => import("./pages/provisional"));

const SttOverview        = lazy(() => import("./pages/stt-overview"));
const SttLanguages       = lazy(() => import("./pages/stt-languages"));
const SttUploadSync      = lazy(() => import("./pages/stt-upload-sync"));
const SttUploadAsync     = lazy(() => import("./pages/stt-upload-async"));
const SttStreaming        = lazy(() => import("./pages/stt-streaming"));

const TtsOverview        = lazy(() => import("./pages/tts-overview"));
const TtsLanguages       = lazy(() => import("./pages/tts-languages"));
const TtsGenerate        = lazy(() => import("./pages/tts-generate"));
const TtsStreaming        = lazy(() => import("./pages/tts-streaming"));

const LanguageDetect     = lazy(() => import("./pages/language-detect"));
const LanguageEntities   = lazy(() => import("./pages/language-entities"));
const LanguageCodeswitch = lazy(() => import("./pages/language-codeswitch"));

const ContextResolve     = lazy(() => import("./pages/context-resolve"));
const ContextCoverage    = lazy(() => import("./pages/context-coverage"));

const AgentOverview      = lazy(() => import("./pages/agent-overview"));
const AgentSessions      = lazy(() => import("./pages/agent-sessions"));
const AgentTurns         = lazy(() => import("./pages/agent-turns"));
const AgentEvents        = lazy(() => import("./pages/agent-events"));

const SdkPython          = lazy(() => import("./pages/sdk-python"));
const SdkJavascript      = lazy(() => import("./pages/sdk-javascript"));
const SdkLocal           = lazy(() => import("./pages/sdk-local"));
const SdkTesting         = lazy(() => import("./pages/sdk-testing"));

const Health             = lazy(() => import("./pages/health"));
const LanguagesCatalog   = lazy(() => import("./pages/languages-catalog"));
const ModelsCatalog      = lazy(() => import("./pages/models-catalog"));

// ─── Skeleton loader ─────────────────────────────────────────────────────────

function DocPageLoader() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 lg:px-10 animate-pulse">
      <div className="h-8 w-48 rounded bg-zinc-100 dark:bg-zinc-800 mb-4" />
      <div className="h-4 w-96 rounded bg-zinc-100 dark:bg-zinc-800 mb-10" />
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-4 rounded bg-zinc-100 dark:bg-zinc-800"
            style={{ width: `${65 + (i % 4) * 9}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Wrap a page in the shared layout + Suspense ─────────────────────────────

function Page({ Component }: { Component: React.ComponentType }) {
  return (
    <DocsLayout>
      <Suspense fallback={<DocPageLoader />}>
        <Component />
      </Suspense>
    </DocsLayout>
  );
}

// ─── Router ──────────────────────────────────────────────────────────────────
//
// Each page gets its own <Route>. React Router compares the path on every
// navigation and re-renders the matched element, this is what makes the
// sidebar links actually change the content.

export default function DocsRouter() {
  return (
    <Routes>
      {/* Default: redirect /docs → /docs/introduction */}
      <Route index element={<Navigate to="introduction" replace />} />

      {/* Getting Started */}
      <Route path="introduction"    element={<Page Component={Introduction} />} />
      <Route path="whats-new"       element={<Page Component={WhatsNew} />} />
      <Route path="quickstart"      element={<Page Component={Quickstart} />} />
      <Route path="authentication"  element={<Page Component={Authentication} />} />
      <Route path="errors"          element={<Page Component={Errors} />} />

      {/* Speech, Understand */}
      <Route path="understand-overview" element={<Page Component={UnderstandOverview} />} />
      <Route path="understand-text"     element={<Page Component={UnderstandText} />} />
      <Route path="understand-audio"    element={<Page Component={UnderstandAudio} />} />
      <Route path="codeswitch"          element={<Page Component={Codeswitch} />} />
      <Route path="provisional"         element={<Page Component={Provisional} />} />

      {/* STT */}
      <Route path="stt-overview"     element={<Page Component={SttOverview} />} />
      <Route path="stt-languages"    element={<Page Component={SttLanguages} />} />
      <Route path="stt-upload-sync"  element={<Page Component={SttUploadSync} />} />
      <Route path="stt-upload-async" element={<Page Component={SttUploadAsync} />} />
      <Route path="stt-streaming"    element={<Page Component={SttStreaming} />} />

      {/* TTS */}
      <Route path="tts-overview"  element={<Page Component={TtsOverview} />} />
      <Route path="tts-languages" element={<Page Component={TtsLanguages} />} />
      <Route path="tts-generate"  element={<Page Component={TtsGenerate} />} />
      <Route path="tts-streaming" element={<Page Component={TtsStreaming} />} />

      {/* Language API */}
      <Route path="language-detect"     element={<Page Component={LanguageDetect} />} />
      <Route path="language-entities"   element={<Page Component={LanguageEntities} />} />
      <Route path="language-codeswitch" element={<Page Component={LanguageCodeswitch} />} />

      {/* Context API */}
      <Route path="context-resolve"  element={<Page Component={ContextResolve} />} />
      <Route path="context-coverage" element={<Page Component={ContextCoverage} />} />

      {/* Voice Agent API */}
      <Route path="agent-overview"  element={<Page Component={AgentOverview} />} />
      <Route path="agent-sessions"  element={<Page Component={AgentSessions} />} />
      <Route path="agent-turns"     element={<Page Component={AgentTurns} />} />
      <Route path="agent-events"    element={<Page Component={AgentEvents} />} />

      {/* SDKs */}
      <Route path="sdk-python"      element={<Page Component={SdkPython} />} />
      <Route path="sdk-javascript"  element={<Page Component={SdkJavascript} />} />
      <Route path="sdk-local"       element={<Page Component={SdkLocal} />} />
      <Route path="sdk-testing"     element={<Page Component={SdkTesting} />} />

      {/* Catalog */}
      <Route path="health"            element={<Page Component={Health} />} />
      <Route path="languages-catalog" element={<Page Component={LanguagesCatalog} />} />
      <Route path="models-catalog"    element={<Page Component={ModelsCatalog} />} />

      {/* Unknown page */}
      <Route
        path="*"
        element={
          <DocsLayout>
            <div className="mx-auto max-w-3xl px-6 py-10">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                Page not found
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400">
                No documentation page exists at this path.
              </p>
            </div>
          </DocsLayout>
        }
      />
    </Routes>
  );
}
