import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  site: 'https://app.gemasa.com.ar',
  integrations: [tailwind()]
});
