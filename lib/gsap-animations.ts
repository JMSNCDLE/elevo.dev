'use client'

// GSAP animations for ELEVO AI marketing site
// All functions are client-side only

export function initHeroTextReveal(selector: string): void {
  if (typeof window === 'undefined') return
  void (async () => {
    const { gsap } = await import('gsap')
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    gsap.registerPlugin(ScrollTrigger)

    const elements = document.querySelectorAll(selector)
    if (!elements.length) return

    gsap.fromTo(
      elements,
      { opacity: 0, y: 60, skewY: 3 },
      {
        opacity: 1,
        y: 0,
        skewY: 0,
        duration: 1.2,
        ease: 'power4.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: elements[0] as Element,
          start: 'top 85%',
          once: true,
        },
      }
    )
  })()
}

export function initParallaxSection(selector: string, speed = 0.4): void {
  if (typeof window === 'undefined') return
  void (async () => {
    const { gsap } = await import('gsap')
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    gsap.registerPlugin(ScrollTrigger)

    const elements = document.querySelectorAll(selector)
    elements.forEach(el => {
      gsap.to(el, {
        yPercent: -100 * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    })
  })()
}

export function initCardReveal(selector: string): void {
  if (typeof window === 'undefined') return
  void (async () => {
    const { gsap } = await import('gsap')
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    gsap.registerPlugin(ScrollTrigger)

    const elements = document.querySelectorAll(selector)
    if (!elements.length) return

    gsap.fromTo(
      elements,
      { opacity: 0, y: 40, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: elements[0] as Element,
          start: 'top 80%',
          once: true,
        },
      }
    )
  })()
}

export function initCounterAnimation(element: HTMLElement, end: number): void {
  if (typeof window === 'undefined') return
  void (async () => {
    const { gsap } = await import('gsap')
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    gsap.registerPlugin(ScrollTrigger)

    const obj = { value: 0 }
    gsap.to(obj, {
      value: end,
      duration: 2.5,
      ease: 'power2.out',
      scrollTrigger: { trigger: element, start: 'top 80%', once: true },
      onUpdate() {
        element.textContent = Math.round(obj.value).toLocaleString()
      },
    })
  })()
}

export function initHorizontalScroll(selector: string): void {
  if (typeof window === 'undefined') return
  void (async () => {
    const { gsap } = await import('gsap')
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    gsap.registerPlugin(ScrollTrigger)

    const container = document.querySelector(selector) as HTMLElement | null
    if (!container) return

    const items = container.querySelectorAll(':scope > *')
    if (!items.length) return

    const totalWidth = Array.from(items).reduce((acc, item) => acc + (item as HTMLElement).offsetWidth, 0)
    const endX = -(totalWidth - window.innerWidth)

    gsap.to(container, {
      x: endX,
      ease: 'none',
      scrollTrigger: {
        trigger: container.parentElement ?? container,
        start: 'top top',
        end: () => `+=${totalWidth}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    })
  })()
}
