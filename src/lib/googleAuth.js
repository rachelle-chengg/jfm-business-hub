/**
 * Google Identity Services — token client (implicit grant).
 *
 * The other person clicks "Save to Drive", is prompted to log in with their
 * Google account, approves the Drive scope, and we receive a short-lived
 * access token we use for the upload. No backend required.
 *
 * Tokens last ~1 h. We re-request silently (prompt: '') when possible and
 * fall back to the consent popup when we need to.
 */

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

let _tokenClient = null;
let _token = null;         // { access_token, expires_at }
let _resolveToken = null;
let _rejectToken = null;

function isTokenValid() {
  return _token && Date.now() < _token.expires_at - 30_000; // 30 s buffer
}

/** Ensure the GIS script is loaded, then return the token client. */
function getTokenClient() {
  if (_tokenClient) return _tokenClient;

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("VITE_GOOGLE_CLIENT_ID is not set.");

  if (!window.google?.accounts?.oauth2) {
    throw new Error("Google Identity Services script not loaded.");
  }

  _tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: DRIVE_SCOPE,
    callback: (resp) => {
      if (resp.error) {
        _rejectToken?.(new Error(resp.error_description ?? resp.error));
        return;
      }
      _token = {
        access_token: resp.access_token,
        expires_at: Date.now() + resp.expires_in * 1000,
      };
      _resolveToken?.(_token.access_token);
    },
  });

  return _tokenClient;
}

/**
 * Returns a valid access token, showing the consent popup if needed.
 * Call this right before a Drive API request.
 */
export function getAccessToken() {
  if (isTokenValid()) return Promise.resolve(_token.access_token);

  return new Promise((resolve, reject) => {
    _resolveToken = resolve;
    _rejectToken = reject;
    const client = getTokenClient();
    // prompt: '' = silent refresh if session still active; falls back to popup
    client.requestAccessToken({ prompt: isTokenValid() ? "" : "consent" });
  });
}

/** Revoke + clear the cached token (for a "disconnect" flow). */
export function revokeToken() {
  if (!_token) return;
  window.google?.accounts?.oauth2?.revoke(_token.access_token, () => {});
  _token = null;
}
