import { Component } from "react";

/**
 * Without this, any uncaught render error just unmounts the whole tree —
 * the page goes blank with no clue why. This shows the actual error instead.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Render error caught by ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, maxWidth: 640, margin: "0 auto", fontFamily: "sans-serif" }}>
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: "#6B6B6B", marginBottom: 16 }}>
            This page hit an error and couldn't render. Reloading usually fixes it — if the
            problem started right after loading a saved invoice/job, that record may have
            old data this version doesn't expect.
          </p>
          <pre style={{
            background: "#F2F0EB", padding: 16, borderRadius: 8, overflowX: "auto",
            fontSize: 12.5, whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}>
            {this.state.error.message}
          </pre>
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button type="button" onClick={() => window.location.reload()}>Reload</button>
            <button type="button" onClick={() => { window.location.href = "/"; }}>Back to Hub</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
