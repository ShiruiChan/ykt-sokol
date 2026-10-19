/**
 * Возможности framer-motion грузятся отдельным чанком уже после первой
 * отрисовки: в основном бандле остаются только лёгкие компоненты m.*.
 * domMax, а не domAnimation, — ради плавающей подсветки пункта меню (layoutId).
 */
export { domMax as default } from 'framer-motion';
