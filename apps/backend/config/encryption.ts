import { defineConfig, drivers } from '@adonisjs/core/encryption';

import env from '#start/env';

const encryptionConfig = defineConfig({
  default: 'app',
  list: {
    app: drivers.legacy({
      keys: [env.get('APP_KEY')],
    }),
  },
});

export default encryptionConfig;
