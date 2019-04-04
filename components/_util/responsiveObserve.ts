// matchMedia polyfill for
// https://github.com/WickyNilliams/enquire.js/issues/82
export let enquire: any;

if (typeof window !== 'undefined') {
  const matchMediaPolyfill = (mediaQuery: string) => {
    return {
      media: mediaQuery,
      matches: false,
      addListener() {},
      removeListener() {},
    };
  };
  window.matchMedia = window.matchMedia || matchMediaPolyfill;
  enquire = require('enquire.js');
}

export type Breakpoint = 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs';
export type BreakpointMap = Partial<Record<Breakpoint, string>>;

export const responsiveArray: Breakpoint[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];

export const responsiveMap: BreakpointMap = {
  xs: '(max-width: 575px)',
  sm: '(min-width: 576px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 992px)',
  xl: '(min-width: 1200px)',
  xxl: '(min-width: 1600px)',
};

type SubscribeFunc = (screens: BreakpointMap) => void;

const ResponsiveObserve = () => {
  let subscribers: Array<{
    token: string;
    func: SubscribeFunc;
  }> = [];
  let subUid = -1;
  return {
    screens: {},
    dispatch(screens: BreakpointMap) {
      this.screens = screens;
      if (subscribers.length < 1) {
        return false;
      }

      //performance
      let len = subscribers ? subscribers.length : 0;

      while (len--) {
        subscribers[len].func(screens);
      }
      return true;
    },
    subscribe(func: SubscribeFunc) {
      if (subscribers.length === 0) {
        this.register();
      }
      const token = (++subUid).toString();
      subscribers.push({
        token: token,
        func: func,
      });
      func(this.screens);
      return token;
    },
    unsubscribe(token: string) {
      subscribers = subscribers.filter(item => item.token !== token);
      if (subscribers.length === 0) {
        this.unregister();
      }
    },
    unregister() {
      Object.keys(responsiveMap).map((screen: Breakpoint) =>
        enquire.unregister(responsiveMap[screen]),
      );
    },
    register() {
      Object.keys(responsiveMap).map((screen: Breakpoint) =>
        enquire.register(responsiveMap[screen], {
          match: () => {
            const screens = {
              ...this.screens,
              [screen]: true,
            };
            this.dispatch(screens);
          },
          unmatch: () => {
            const screens = {
              ...this.screens,
              [screen]: false,
            };
            this.dispatch(screens);
          },
          // Keep a empty destory to avoid triggering unmatch when unregister
          destroy() {},
        }),
      );
    },
  };
};

const responsiveObserve = ResponsiveObserve();
export default responsiveObserve;
