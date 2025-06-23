import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Настройка NProgress
NProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 500,
  showSpinner: false
});

export const start = () => NProgress.start();
export const done = () => NProgress.done();

export default NProgress;