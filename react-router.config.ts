import type { Config } from "@react-router/dev/config";

export default {
  // we want an SPA. SSR is overkill for this webapp
  ssr: false,
  // pre-rendering is just a nicety
  prerender: true,
  basename: process.env.PUBLIC_BASE_PATH,
} satisfies Config;
