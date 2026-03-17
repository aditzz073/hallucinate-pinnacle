import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer } from "../utils/motion";

export default function SectionWrapper({ children, className = "", style, ...props }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "show"}
      viewport={{ once: true, amount: 0.2 }}
      variants={reduceMotion ? undefined : staggerContainer}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </motion.section>
  );
}
