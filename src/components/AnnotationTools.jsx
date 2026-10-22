import { lazy, Suspense } from "react";

const Agentation = lazy(() => import("agentation").then(module => ({ default: module.Agentation })));

/** Opt-in review mode; annotations stay in the browser until copied. */
export default function AnnotationTools() {
  const enabled = new URLSearchParams(window.location.search).get("annotate") === "1";
  return enabled ? <Suspense fallback={null}><Agentation /></Suspense> : null;
}
