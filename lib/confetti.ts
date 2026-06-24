import { gsap } from "gsap";

export function triggerConfetti(intensity: "small" | "large" = "large") {
  const count = intensity === "large" ? 150 : 80;
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden";
  document.body.appendChild(container);

  const colors = [
    "#4f46e5", "#10b981", "#f59e0b", "#ef4444",
    "#8b5cf6", "#06b6d4", "#ec4899", "#f97316",
  ];

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    const size = Math.random() * 9 + 5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    el.style.cssText = [
      "position:absolute",
      `width:${size}px`,
      `height:${size}px`,
      `background:${color}`,
      `border-radius:${Math.random() > 0.5 ? "50%" : "2px"}`,
      "top:-20px",
      `left:${Math.random() * 100}vw`,
    ].join(";");
    container.appendChild(el);

    gsap.to(el, {
      y: window.innerHeight + 100,
      x: `+=${(Math.random() - 0.5) * 400}`,
      rotation: Math.random() * 720 - 360,
      opacity: 0,
      duration: Math.random() * 2.5 + 1.5,
      ease: "power1.in",
      delay: Math.random() * 0.4,
    });
  }

  setTimeout(() => {
    if (document.body.contains(container)) container.remove();
  }, 5000);
}
