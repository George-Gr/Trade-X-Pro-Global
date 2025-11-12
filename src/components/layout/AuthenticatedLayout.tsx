import React, { Suspense } from "react";

// Lazy-load the heavy inner layout so pages importing `AuthenticatedLayout`
// get a small module; the full layout (sidebar, header, icons) is loaded
// only when needed.
const AuthenticatedLayoutInner = React.lazy(() => import("./AuthenticatedLayoutInner"));

const AuthenticatedLayout = (props: { children: React.ReactNode }) => (
  <Suspense fallback={<div style={{ minHeight: 200 }} />}> 
    <AuthenticatedLayoutInner {...props} />
  </Suspense>
);

export default AuthenticatedLayout;
