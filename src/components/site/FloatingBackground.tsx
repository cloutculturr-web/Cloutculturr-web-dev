import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import phone from "@/assets/float-phone.png";
import camera from "@/assets/float-camera.png";
import laptop from "@/assets/float-laptop.png";

const assets = [
  { src: phone, className: "left-[4%] top-[16%] w-32 sm:w-44", depth: 34, anim: "animate-float-slow", extra: "" },
  { src: laptop, className: "right-[2%] top-[24%] w-44 sm:w-64", depth: -28, anim: "animate-float-mid", extra: "" },
  { src: camera, className: "left-[10%] bottom-[12%] w-32 sm:w-48", depth: 22, anim: "animate-float-mid", extra: "" },
  { src: phone, className: "right-[12%] bottom-[8%] w-24 sm:w-36 opacity-70", depth: -40, anim: "animate-float-slow", extra: "blur-[1px]" },
];

export function FloatingBackground() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 top-[-10%] size-[70rem] -translate-x-1/2 rounded-full opacity-60 blur-3xl animate-pulse-glow"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--lavender-creative) 34%, transparent), transparent 62%)",
        }}
      />
      <div
        className="absolute right-[-15%] top-[40%] size-[45rem] rounded-full opacity-50 blur-3xl animate-pulse-glow"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--indigo-deep) 40%, transparent), transparent 60%)",
        }}
      />
      <div
        className="absolute left-[-15%] bottom-[-10%] size-[40rem] rounded-full opacity-40 blur-3xl animate-pulse-glow"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--mint-soft) 34%, transparent), transparent 60%)",
        }}
      />

      {ready
        ? assets.map((a, i) => <FloatingAsset key={i} asset={a} sx={sx} sy={sy} />)
        : null}

      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

function FloatingAsset({
  asset,
  sx,
  sy,
}: {
  asset: (typeof assets)[number];
  sx: ReturnType<typeof useSpring>;
  sy: ReturnType<typeof useSpring>;
}) {
  const x = useTransform(sx, (v) => v * asset.depth * 2.4);
  const y = useTransform(sy, (v) => v * asset.depth * 2.4);
  return (
    <motion.div style={{ x, y }} className={`absolute ${asset.className}`}>
      <img
        src={asset.src}
        alt=""
        loading="lazy"
        className={`w-full drop-shadow-[0_20px_60px_rgba(69,54,170,0.35)] ${asset.anim} ${asset.extra}`}
      />
    </motion.div>
  );
}