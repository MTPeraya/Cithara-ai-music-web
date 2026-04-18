# 🛠️ Cithara Troubleshooting Guide

This guide covers common issues encountered during the setup and development of Cithara.

## 🐳 Docker Issues

### Port already in use (8000 or 5173)
**Issue:** `Error starting userland proxy: listen tcp4 0.0.0.0:8000: bind: address already in use`
**Solution:** Another service is using port 8000 (Backend) or 5173 (Frontend).
1. Identify the process: `lsof -i :8000` or `lsof -i :5173`
2. Kill the process: `kill -9 <PID>`
3. Or change the ports in `docker-compose.yml`.

### Frontend modules mismatch
**Issue:** Frontend fails to start inside Docker with errors like `vite: command not found`.
**Solution:** This usually happens if `node_modules` were installed natively and then mounted into Docker.
1. `rm -rf frontend/node_modules`
2. `docker-compose up --build`

---

## 🐍 Backend (Django) Issues

### Database is locked (SQLite)
**Issue:** `django.db.utils.OperationalError: database is locked`
**Solution:** A previous process is still holding the SQLite file.
1. Stop all running Django processes.
2. If the lock persists, you may need to reset the DB:
   ```bash
   rm Cithara/db.sqlite3
   python3 manage.py migrate
   ```

### Missing Migrations
**Issue:** `django.db.utils.OperationalError: no such table: domain_song`
**Solution:** Run the migrations manually or recreate them if they are corrupted.
```bash
python3 manage.py makemigrations domain
python3 manage.py migrate
```

### Superuser Issues
**Issue:** Cannot access the admin panel at `/admin`.
**Solution:** Create a new superuser natively:
```bash
python3 manage.py createsuperuser
```

---

## ⚛️ Frontend (React) Issues

### API Connection Refused
**Issue:** Frontend shows errors connecting to `http://localhost:8000/api`.
**Solution:**
1. Ensure the backend is running and healthy. Check Docker logs: `docker logs cithara-backend`.
2. Verify you can access `http://localhost:8000/admin`.
3. Check Browser Console (F12) for CORS errors. If found, ensure `CORS_ALLOWED_ORIGINS` in `settings.py` includes your frontend URL.

---

## 🎵 AI Generation (Suno API) Issues

### 401 Unauthorized
**Issue:** Suno strategy returns `Authentication failed`.
**Solution:**
1. Check your `SUNO_API_KEY` in `.env`.
2. Ensure you have balance/credits in your Suno API account.
3. Verify the key is not expired.

### Stuck in "Queued" or "Generating"
**Issue:** The UI stays on the loading screen forever.
**Solution:** 
1. If using **Mock Strategy**, wait at least 20 seconds for the simulation to complete.
2. If using **Suno Strategy**, check the backend logs for specific API error codes.
3. If the poll fails, try refreshing the page—the library should show the actual status.

---

## 🔄 Still Having Trouble?
If these steps don't resolve your issue, please:
1. Check the [README.md](./README.md) for basic setup instructions.
2. Review the [Dev Quickstart](./Dev_quickstart.md) for architecture details.
3. Open an issue on GitHub with your logs and OS details.
