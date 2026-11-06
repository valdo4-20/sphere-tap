import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {navigationState} from './navigationState';
const expanded = { atTop: true, hidden: false, collapsed: false };
// Limiar e comportamento de AppNavigation.tsx do Sphere UI Kit.
export default function useSphereNavigation(route, paused = false) {
  const [state, setState] = useState(expanded);
  const scroll = useRef({
    last: 0,
    direction: 0,
    distance: 0,
    state: expanded,
  });
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    scroll.current = { last: 0, direction: 0, distance: 0, state: expanded };
    setState(expanded);
  }, [route]);
  useEffect(() => {
    if (paused) {
      scroll.current.state = expanded;
      setState(expanded);
      return;
    }
    function update() {
      const y = Math.max(0, window.scrollY),
        s = scroll.current,
        delta = y - s.last;
      const fullscreen = Boolean(document.fullscreenElement);
      const atTop = y <= 32 || fullscreen;
      const sign=Math.sign(delta);
      s.distance=sign===s.direction?s.distance+Math.abs(delta):Math.abs(delta);
      s.direction=sign;
      const touchViewport = window.matchMedia(
        "(max-width: 900px), (hover: none) and (pointer: coarse)",
      ).matches;
      const next = touchViewport
        ? navigationState(s.state, fullscreen ? 0 : y, delta, s.distance)
        : {
            atTop,
            hidden: fullscreen || y <= 32
              ? false
              : delta > 8 && y > 110
                ? true
                : delta < -5
                  ? false
                  : s.state.hidden,
            collapsed: false,
          };
      const {hidden,collapsed}=next;
      if(next.atTop||collapsed!==s.state.collapsed)s.distance=0;
      s.last = y;
      if (
        s.state.atTop !== atTop ||
        s.state.hidden !== hidden ||
        s.state.collapsed !== collapsed
      ) {
        s.state = { atTop, hidden, collapsed };
        setState(s.state);
      }
    }
    window.addEventListener("scroll", update, { passive: true });
    document.addEventListener("fullscreenchange", update);
    return () => {
      window.removeEventListener("scroll", update);
      document.removeEventListener("fullscreenchange", update);
    };
  }, [paused]);
  return {
    ...state,
    expand: () => {
      scroll.current.distance = 0;
      scroll.current.state = {
        ...scroll.current.state,
        hidden: false,
        collapsed: false,
      };
      setState(scroll.current.state);
    },
  };
}
