(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const reveals = document.querySelectorAll('.rv,.pl-reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in', 'is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: .12 });
    reveals.forEach((element) => observer.observe(element));
    document.documentElement.classList.add('pl-motion-ready');
  } else {
    reveals.forEach((element) => element.classList.add('in', 'is-visible'));
  }

  const scenes = [...document.querySelectorAll('.scene')];
  const zones = [...document.querySelectorAll('[data-scene],[data-pl-depth]')];
  const stage = document.getElementById('scenes') || document.querySelector('.pl-scenes');
  const railLinks = [...document.querySelectorAll('.rail a,.pl-progress a')];
  const railTargets = railLinks.map((link) => document.querySelector(link.getAttribute('href')));
  const header = document.getElementById('hdr') || document.querySelector('.pl-header');
  const product = document.getElementById('heroProd');
  let currentScene = 0;
  let raf = null;
  let mx = 0;
  let my = 0;

  const setScene = (sceneNumber) => {
    if (sceneNumber === currentScene) return;
    currentScene = sceneNumber;
    scenes.forEach((scene, index) => scene.classList.toggle('on', index + 1 === sceneNumber));
    stage?.setAttribute('data-d', String(sceneNumber));
    stage?.setAttribute('data-depth', String(sceneNumber));
  };

  const pickScene = () => {
    const focus = scrollY + innerHeight * .5;
    let sceneNumber = 1;
    zones.forEach((zone) => {
      const top = zone.getBoundingClientRect().top + scrollY;
      if (top <= focus) sceneNumber = Number(zone.dataset.scene || zone.dataset.plDepth) || sceneNumber;
    });
    setScene(sceneNumber);
  };

  const syncRail = () => {
    const mid = scrollY + innerHeight * .42;
    let active = 0;
    let activeTop = -Infinity;
    railTargets.forEach((target, index) => {
      if (!target) return;
      const top = target.getBoundingClientRect().top + scrollY;
      if (top <= mid && top >= activeTop) {
        active = index;
        activeTop = top;
      }
    });
    railLinks.forEach((link, index) => {
      link.classList.toggle('on', index === active);
      link.toggleAttribute('data-active', index === active);
    });
  };

  const frame = () => {
    raf = null;
    const y = scrollY || pageYOffset;
    header?.classList.toggle('up', y > 90);
    header?.classList.toggle('is-scrolled', y > 24);

    if (!reduce) {
      document.querySelectorAll('#water .wl').forEach((layer, index) => {
        const d = [.05, .09, .03, .02][index] || .05;
        layer.style.setProperty('--px', `${(mx * d * 130).toFixed(1)}px`);
        layer.style.setProperty('--py', `${(-y * d + my * d * 90).toFixed(1)}px`);
      });
      if (product) {
        const f = Math.min(y / 700, 1);
        product.style.transform = `translate3d(${(mx * -16).toFixed(2)}px,${(-f * 54 + my * -10).toFixed(2)}px,0) scale(${(1 - f * .06).toFixed(3)})`;
        product.style.opacity = (1 - f * .55).toFixed(3);
      }
    }

    syncRail();
    pickScene();
  };

  const queue = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  if (!reduce && matchMedia('(min-width: 1024px)').matches) {
    addEventListener('mousemove', (event) => {
      mx = (event.clientX / innerWidth - .5) * 2;
      my = (event.clientY / innerHeight - .5) * 2;
      queue();
    }, { passive: true });
  }

  const slides = [...document.querySelectorAll('#hstage .hslide')];
  const dots = [...document.querySelectorAll('#hdots button')];
  if (slides.length) {
    let index = 0;
    const show = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => slide.classList.toggle('on', slideIndex === index));
      dots.forEach((dot, dotIndex) => dot.classList.toggle('on', dotIndex === index));
    };
    dots.forEach((dot, dotIndex) => dot.addEventListener('click', () => show(dotIndex)));
    show(0);
    if (!reduce && !window.Shopify?.designMode) setInterval(() => show(index + 1), 4500);
  }

  queue();
})();
