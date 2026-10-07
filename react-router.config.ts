import type { Config } from "@react-router/dev/config";

export default {
  // we want an SPA. SSR is overkill for this webapp
  ssr: false,
  // pre-rendering is just a nicety
  prerender: true,
} satisfies Config;
