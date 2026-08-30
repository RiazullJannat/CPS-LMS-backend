import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      // Comma-separated list of allowed frontend origins, e.g.
      // CORS_ORIGINS=https://app.example.com,https://admin.example.com
      // Defaults to localhost for local development.
      origin: env.array('CORS_ORIGINS', ['http://localhost:3000', 'http://localhost:1337']),
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
