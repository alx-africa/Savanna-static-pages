class AlxProfile extends HTMLElement {
  connectedCallback() {
    const user = JSON.parse(localStorage.getItem('alx-profile') || '{}');
    this.innerHTML = `
      <section class="alx-profile-card" aria-labelledby="alx-profile-title">
        <h2 id="alx-profile-title">Your profile</h2>
        <p>${user.name ? `Welcome, ${user.name}.` : 'Your profile is ready to complete.'}</p>
        <a href="/pages/profile.html">Open full profile and career gateway</a>
      </section>`;
  }
}

customElements.define('alx-profile', AlxProfile);
