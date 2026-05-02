Render & Netlify deployment notes

Required environment variables

Backend (Render service env vars):
- SPRING_DATA_MONGODB_URI: mongodb://<user>:<pass>@host:port/db
- APP_JWT_SECRET: strong random secret >= 32 bytes (do NOT commit this to repo)
- APP_CORS_ALLOWED_ORIGINS: comma-separated origins (e.g. https://your-site.netlify.app)
- PORT: (Render usually sets this automatically)
- APP_CREATE_DEFAULT_ADMIN: set to `true` only for one-time seeding
- APP_ADMIN_DEFAULT_USERNAME: username for initial admin when seeding
- APP_ADMIN_DEFAULT_PASSWORD: password for initial admin when seeding

Frontend (Netlify env vars):
- API_BASE_URL: https://<your-backend>.onrender.com/api

Notes
- The backend now requires `APP_JWT_SECRET` to be set in production. If missing or too short, the application will fail fast with an explanatory error.
- To seed a default admin account: set `APP_CREATE_DEFAULT_ADMIN=true` plus the two admin credentials on the Render service, then deploy once. After the admin is created, remove or set `APP_CREATE_DEFAULT_ADMIN=false` and rotate the admin password.
- The frontend reads `window.API_BASE_URL` if set (the code also falls back to localhost for dev). On Netlify, set the `API_BASE_URL` environment variable to your Render service URL.
- Actuator health is available at `/actuator/health` (exposed endpoints: health, info).

Render quick steps
1. In Render dashboard, create a new Web Service and connect the repo.
2. Add the required environment variables under the service's Environment tab.
3. Deploy. Use the health endpoint for readiness checks.

Netlify quick steps
1. In Netlify, set `API_BASE_URL` under Site settings -> Build & deploy -> Environment.
2. Ensure the site build/publish points to the `frontend` folder (or upload files directly).

Security recommendations
- Do not store secrets in `application.properties` in the repository.
- Use Render's secret management to store `APP_JWT_SECRET` and DB credentials.
- Enable HTTPS and CORS only for your frontend domain(s).