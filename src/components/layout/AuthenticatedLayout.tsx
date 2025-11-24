import React, { Suspense } from "react";

// Lazy-load the heavy inner layout so pages importing `AuthenticatedLayout`
// get a small module; the full layout (sidebar, header, icons) is loaded
// only when needed.
const AuthenticatedLayoutInner = React.lazy(() => import("./AuthenticatedLayoutInner"));

const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div style={{ minHeight: "200px", width: "100%" }} />}> 
    <AuthenticatedLayoutInner>{children}</AuthenticatedLayoutInner>
  </Suspense>
);

export default AuthenticatedLayout;
