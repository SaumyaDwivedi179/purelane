if (!customElements.get('purelane-slider')) {
  customElements.define('purelane-slider', class extends HTMLElement {
    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;
      this.slides = [...this.querySelectorAll('[data-slide]')];
      this.buttons = [...this.querySelectorAll('[data-slide-button]')];
      if (this.slides.length < 2) return;

      this.show = (index) => {
        this.index = index;
        this.slides.forEach((slide, i) => slide.toggleAttribute('data-active', i === index));
        this.buttons.forEach((button, i) => {
          button.toggleAttribute('data-active', i === index);
          button.setAttribute('aria-current', i === index ? 'true' : 'false');
        });
      };

      this.buttons.forEach((button, index) => button.addEventListener('click', () => this.show(index)));
      this.show(0);

      if (!matchMedia('(prefers-reduced-motion: reduce)').matches && !window.Shopify?.designMode) {
        this.timer = setInterval(() => this.show((this.index + 1) % this.slides.length), 4500);
      }
    }

    disconnectedCallback() {
      clearInterval(this.timer);
    }
  });
}
