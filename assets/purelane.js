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

const purelaneHeader = document.querySelector('.pl-header');
if (purelaneHeader) {
  const updatePurelaneHeader = () => purelaneHeader.classList.toggle('is-scrolled', scrollY > 24);
  updatePurelaneHeader();
  addEventListener('scroll', updatePurelaneHeader, { passive: true });
}

const purelaneReveals = document.querySelectorAll('.pl-reveal');
const purelaneProgress = [...document.querySelectorAll('.pl-progress a')];
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('is-visible');
  }), { threshold: .12 });
  purelaneReveals.forEach((element) => revealObserver.observe(element));

  const sectionObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const link = purelaneProgress.find((item) => item.hash === `#${entry.target.id}`);
    if (link) purelaneProgress.forEach((item) => item.toggleAttribute('data-active', item === link));
    const depth = entry.target.dataset.plDepth;
    if (depth) document.querySelector('.pl-scenes')?.setAttribute('data-depth', depth);
  }), { rootMargin: '-35% 0px -55%' });
  document.querySelectorAll('[id], [data-pl-depth]').forEach((section) => sectionObserver.observe(section));
} else {
  purelaneReveals.forEach((element) => element.classList.add('is-visible'));
}
