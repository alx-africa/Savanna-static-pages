(() => {
  const STORAGE_KEY = 'alx-signup-draft';

  const copy = {
    en: {
      title: 'Create your account',
      name: 'Full name',
      emailLabel: 'Email address',
      phone: 'Phone number',
      idType: 'Identity document or alternative',
      idReference: 'Document or reference number',
      password: 'Password',
      submit: 'Create account',
      required: 'This field is required.',
      emailError: 'Enter a valid email address.',
      phone: 'Enter a valid phone number.',
      password: 'Use at least 8 characters.',
      id: 'Enter your document or self-attestation reference.',
      summary: 'Please correct the following errors:',
      network: 'Registration is unavailable. Check your connection and try again.',
      success: 'Your account was created successfully.'
    },
    am: {
      title: 'መለያዎን ይፍጠሩ',
      name: 'ሙሉ ስም',
      emailLabel: 'የኢሜይል አድራሻ',
      phone: 'የስልክ ቁጥር',
      idType: 'የመታወቂያ ሰነድ ወይም አማራጭ',
      idReference: 'የሰነድ ወይም የማጣቀሻ ቁጥር',
      password: 'የይለፍ ቃል',
      submit: 'መለያ ይፍጠሩ',
      required: 'ይህ መስክ ያስፈልጋል።',
      emailError: 'ትክክለኛ የኢሜይል አድራሻ ያስገቡ።',
      phone: 'ትክክለኛ የስልክ ቁጥር ያስገቡ።',
      password: 'ቢያንስ 8 ፊደላት ይጠቀሙ።',
      id: 'የሰነድ ወይም የራስ ማረጋገጫ ማጣቀሻ ያስገቡ።',
      summary: 'እባክዎ የሚከተሉትን ስህተቶች ያስተካክሉ፦',
      network: 'ምዝገባ አልተሳካም። ግንኙነትዎን ያረጋግጡና እንደገና ይሞክሩ።',
      success: 'መለያዎ በተሳካ ሁኔታ ተፈጥሯል።'
    }
  };

  class AlxSignup extends HTMLElement {
    connectedCallback() {
      if (this.querySelector('form')) return;
      this.lang = this.getAttribute('lang') === 'am' ? 'am' : 'en';
      this.render();
      this.restoreDraft();
    }

    text(key) {
      return (copy[this.lang] || copy.en)[key];
    }

    render() {
      this.innerHTML = `
        <form class="alx-signup" novalidate>
          <h2>${this.text('title')}</h2>
          <div class="alx-signup__summary" role="alert" tabindex="-1" hidden></div>
          <div class="alx-signup__field"><label for="alx-name">${this.text('name')}</label>
            <input id="alx-name" name="name" autocomplete="name" required></div>
          <div class="alx-signup__field"><label for="alx-email">${this.text('emailLabel')}</label>
            <input id="alx-email" name="email" type="email" autocomplete="username" required></div>
          <div class="alx-signup__field"><label for="alx-phone">${this.text('phone')}</label>
            <input id="alx-phone" name="phone" type="tel" autocomplete="tel" required></div>
          <div class="alx-signup__field"><label for="alx-id-type">${this.text('idType')}</label>
            <select id="alx-id-type" name="alternativeIdType" aria-expanded="true" aria-controls="alx-id-reference">
              <option value="kebele_id">Kebele ID</option>
              <option value="passport">Passport</option>
              <option value="refugee_registration">Refugee registration number</option>
              <option value="self_attestation">Self-attestation</option>
            </select></div>
          <div class="alx-signup__field"><label for="alx-id-reference">${this.text('idReference')}</label>
            <input id="alx-id-reference" name="idReference" aria-required="true" required></div>
          <div class="alx-signup__field"><label for="alx-password">${this.text('password')}</label>
            <input id="alx-password" name="password" type="password" autocomplete="new-password" minlength="8" required></div>
          <button type="submit">${this.text('submit')}</button>
          <p class="alx-signup__status" role="status" aria-live="polite"></p>
        </form>`;
      const form = this.querySelector('form');
      form.addEventListener('input', () => this.saveDraft());
      form.elements.alternativeIdType.addEventListener('change', (event) => {
        form.elements.idReference.setAttribute('aria-label', event.target.options[event.target.selectedIndex].text);
        form.elements.idReference.focus();
      });
      form.addEventListener('submit', (event) => this.submit(event));
    }

    restoreDraft() {
      try {
        const draft = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        Object.entries(draft).forEach(([name, value]) => {
          const field = this.querySelector(`[name="${name}"]`);
          if (field) field.value = value;
        });
      } catch (error) {
        console.warn('Unable to restore sign-up draft.', error);
      }
    }

    saveDraft() {
      const data = Object.fromEntries(new FormData(this.querySelector('form')));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.warn('Unable to save sign-up draft.', error);
      }
    }

    validate() {
      const form = this.querySelector('form');
      const values = Object.fromEntries(new FormData(form));
      const errors = {};
      if (!values.name.trim()) errors.name = this.text('required');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = this.text('emailError');
      if (!/^[+]?[0-9 ()-]{7,20}$/.test(values.phone)) errors.phone = this.text('phone');
      if (!values.idReference.trim()) errors.idReference = this.text('id');
      if (values.password.length < 8) errors.password = this.text('password');
      Object.keys(values).forEach((name) => {
        const field = form.elements[name];
        if (!field || name === 'alternativeIdType') return;
        const errorId = `alx-error-${name}`;
        const oldError = document.getElementById(errorId);
        if (oldError) oldError.remove();
        field.removeAttribute('aria-describedby');
        field.removeAttribute('aria-invalid');
        if (errors[name]) {
          const error = document.createElement('div');
          error.id = errorId;
          error.className = 'alx-signup__error';
          error.textContent = errors[name];
          field.setAttribute('aria-invalid', 'true');
          field.setAttribute('aria-describedby', errorId);
          field.after(error);
        }
      });
      return errors;
    }

    async submit(event) {
      event.preventDefault();
      const form = this.querySelector('form');
      const errors = this.validate();
      const summary = this.querySelector('.alx-signup__summary');
      if (Object.keys(errors).length) {
        summary.innerHTML = `${this.text('summary')}<ul>${Object.entries(errors)
          .map(([name, error]) => `<li><a href="#${form.elements[name].id}">${error}</a></li>`).join('')}</ul>`;
        summary.hidden = false;
        summary.focus();
        return;
      }
      const status = this.querySelector('.alx-signup__status');
      try {
        const response = await fetch(this.getAttribute('action') || '/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(this.querySelector('form'))))
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || this.text('network'));
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem('alx_auth_token', result.token);
        window.dispatchEvent(new CustomEvent('alx-auth-success', { detail: result.user }));
        status.textContent = this.text('success');
      } catch (error) {
        status.textContent = error.message || this.text('network');
      }
    }
  }

  customElements.define('alx-signup', AlxSignup);
})();
