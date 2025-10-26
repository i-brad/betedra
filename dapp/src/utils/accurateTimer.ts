export const accurateTimer = (callback: any, time = 1000) => {
  let nextAt: any;
  let timeout: any;
  nextAt = Date.now() + time;
  const wrapper = () => {
    nextAt += time;
    timeout = setTimeout(wrapper, nextAt - Date.now());
    callback?.();
  };
  const cancel = () => clearTimeout(timeout);
  timeout = setTimeout(wrapper, nextAt - Date.now());
  return { cancel };
};
