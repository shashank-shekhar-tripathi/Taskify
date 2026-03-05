# ✦ Taskify — Full Stack Todo Manager
> Made with ❤️ by Shashank

A beautiful, production-ready Todo Manager built with **React** + **Django REST Framework**

---

## 🎨 Features
- 🔐 JWT Authentication (Register / Login)
- ✅ Full CRUD — Create, Update, Delete Tasks
- 🏷️ Categories & Priority Levels
- 📅 Due Dates with Overdue Highlighting
- 📊 Stats Dashboard + Progress Bar
- 🔍 Search & Filter
- 📱 Responsive Dark UI

---

## 💻 Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # Edit: set DEBUG=True
python manage.py migrate
python manage.py runserver  # http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env        # Edit: REACT_APP_API_URL=http://localhost:8000/api
npm start                   # http://localhost:3000
```

---

## 🚀 Deployment

### Step 1 — Push to GitHub
```bash
git init && git add . && git commit -m "Taskify initial commit"
git remote add origin https://github.com/YOUR_USERNAME/taskify.git
git push -u origin main
```

### Step 2 — Backend on Railway
1. Go to railway.app → New Project → Deploy from GitHub
2. Set Root Directory: `backend`
3. Add PostgreSQL plugin
4. Add these Variables:
   - SECRET_KEY = any-random-long-string
   - DEBUG = False
   - DATABASE_URL = (auto from Railway PostgreSQL)
   - CORS_ALLOWED_ORIGINS = http://localhost:3000
5. Run in Shell: `python manage.py migrate && python manage.py collectstatic --noinput`
6. Copy your Railway URL

### Step 3 — Frontend on Vercel
1. Go to vercel.com → New Project → import repo
2. Set Root Directory: `frontend`
3. Add env variable: REACT_APP_API_URL = https://your-railway-app.up.railway.app/api
4. Deploy!
5. Copy your Vercel URL

### Step 4 — Update CORS
In Railway Variables, update:
CORS_ALLOWED_ORIGINS = https://your-app.vercel.app,http://localhost:3000

---

## 🔌 API Endpoints

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | /api/auth/register/ | No |
| POST | /api/auth/login/ | No |
| GET/POST | /api/todos/ | Yes |
| PATCH/DELETE | /api/todos/{id}/ | Yes |
| GET | /api/todos/stats/summary/ | Yes |

---

Made with ❤️ by Shashank
