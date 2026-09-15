export class VRSession {
  constructor({ renderer, xr = globalThis.navigator?.xr, secure = globalThis.isSecureContext, onStatus = () => {}, onStart = () => {}, onEnd = () => {}, onVisibility = () => {}, labels = {}, framebufferScale = .85 }) {
    Object.assign(this, { renderer, xr, secure, onStatus, onStart, onEnd, onVisibility });
    this.session = null;
    this.pending = false;
    this.supported = false;
    this.disposed = false;
    this.framebufferScale = framebufferScale;
    this.labels = { screen: 'drive on screen', ready: 'Your headset supports WebXR. Enter VR, center the seat, then start from the cockpit menu.', active: 'The cockpit is active in your headset.', ...labels };
    this.deviceChange = () => { if (!this.session && !this.pending) void this.check(); };
    xr?.addEventListener('devicechange', this.deviceChange);
  }

  status(state, message) { this.onStatus({ state, message }); }

  async check() {
    if (!this.secure) {
      this.status('unavailable', 'VR needs HTTPS. Open an HTTPS address in your headset browser. Localhost also works on the host device.');
      return false;
    }
    if (!this.xr) {
      this.status('unavailable', `This browser has no WebXR support. Open this page in a headset browser, or ${this.labels.screen}.`);
      return false;
    }
    try {
      this.supported = await this.xr.isSessionSupported('immersive-vr');
      if (this.disposed || this.session || this.pending) return this.supported;
      this.status(this.supported ? 'ready' : 'unavailable', this.supported
        ? this.labels.ready
        : `No VR headset is available. Connect a headset and reload, or ${this.labels.screen}.`);
    } catch {
      this.supported = false;
      this.status('error', 'The browser cannot check VR access. Allow XR access in browser settings, then reload.');
    }
    return this.supported;
  }

  async enter() {
    if (this.pending || this.session || this.disposed || !this.supported) return false;
    this.pending = true;
    this.status('requesting', 'Accept the VR request in your browser.');
    let session;
    try {
      // Keep the session request within the button's user activation.
      session = await this.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor'] });
      if (this.disposed) { await session.end(); return false; }
      this.session = session;
      const end = () => {
        session.removeEventListener('end', end);
        session.removeEventListener('visibilitychange', visibility);
        if (this.session !== session) return;
        this.session = null;
        this.pending = false;
        this.onEnd();
        this.status('ready', 'The VR session ends. Resume on screen, or enter VR again.');
      };
      const visibility = () => this.onVisibility(session.visibilityState);
      session.addEventListener('end', end);
      session.addEventListener('visibilitychange', visibility);
      this.renderer.xr.setReferenceSpaceType('local');
      this.renderer.xr.setFramebufferScaleFactor(this.framebufferScale);
      await this.renderer.xr.setSession(session);
      if (this.session !== session || this.disposed) return false;
      this.renderer.xr.setFoveation(1);
      this.pending = false;
      this.onStart(session);
      this.status('active', this.labels.active);
      return true;
    } catch (error) {
      if (session) {
        try { await session.end(); } catch { /* The runtime can end a failed session first. */ }
        if (this.session === session) { this.session = null; this.onEnd(); }
      }
      this.status('error', error?.name === 'NotAllowedError' || error?.name === 'SecurityError'
        ? 'VR access is denied. Allow the browser request, then select Enter VR again.'
        : 'The VR session cannot start. Connect the headset, close other VR sessions, then try again.');
      return false;
    } finally { this.pending = false; }
  }

  get isImmersive() { return Boolean(this.session); }

  setFramebufferScale(scale) {
    try { this.renderer?.xr?.setFramebufferScaleFactor(scale); } catch { /* Optional. */ }
  }

  async exit() {
    if (!this.session) return;
    try { await this.session.end(); }
    catch { this.status('active', 'The browser cannot close VR. Use the headset system menu to exit.'); }
  }

  dispose() {
    this.disposed = true;
    this.xr?.removeEventListener('devicechange', this.deviceChange);
    void this.exit();
  }
}
