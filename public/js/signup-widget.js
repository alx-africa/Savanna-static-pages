// The canonical component stays at the module root for backwards compatibility.
// This public entry point lets partner sites use the documented /js path.
if (!customElements.get('alx-signup')) {
  const script = document.createElement('script');
  script.src = '/signup-widget.js';
  script.defer = true;
  document.head.appendChild(script);
}
