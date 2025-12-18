import React, { Suspense } from "react";
import { AutoBreadcrumb } from "@/components/ui/breadcrumb";

// Lazy-load the inner layout so pages importing `PublicLayout`
// get a small module; the full layout is loaded only when needed.
const PublicLayoutInner = React.lazy(() => import("./PublicLayoutInner"));

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div style={{ minHeight: "200px", width: "100%" }} />}>
    <PublicLayoutInner>
      <AutoBreadcrumb className="mb-4" />
      {children}
    </PublicLayoutInner>
  </Suspense>
);

export default PublicLayout;
