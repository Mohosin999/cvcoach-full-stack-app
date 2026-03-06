export const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.8 },
  },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -100 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

export const slideInRight = {
  initial: { opacity: 0, x: 100 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

export const floatAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const pulseGlow = {
  initial: { boxShadow: "0 0 20px rgba(34, 197, 94, 0.4)" },
  animate: {
    boxShadow: [
      "0 0 20px rgba(34, 197, 94, 0.4)",
      "0 0 40px rgba(34, 197, 94, 0.8)",
      "0 0 20px rgba(34, 197, 94, 0.4)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};
