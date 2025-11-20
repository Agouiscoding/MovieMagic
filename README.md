
# 🎬 MovieMagic / 电影魔术

A full-stack web application that allows users to **search and filter movies and TV shows** using data from **The Movie Database (TMDb)** API.  
一个基于 **TMDb API** 的全栈网页应用，允许用户**搜索与筛选电影和电视剧**。

Built with **React (Vite)** and **Flask**, this project demonstrates front-end and back-end integration, RESTful API communication, and UI data rendering.  
使用 **React (Vite)** 和 **Flask** 构建，展示了前后端集成、RESTful API 调用以及数据可视化。

---

## 🚀 Features / 功能特性

| English | 中文 |
|----------|------|
| 🔍 Search by title (movies / TV shows) | 🔍 按标题搜索（电影 / 电视剧） |
| 🎭 Filter by genre, sort order, and release year | 🎭 按类型、排序方式和上映年份筛选 |
| 📅 Filter by release date range (from / to) | 📅 支持上映日期范围筛选 |
| 🌐 Switch between movie and TV modes | 🌐 可切换电影和电视剧模式 |
| 🧩 Flask backend proxy to TMDb API | 🧩 Flask 后端代理 TMDb API 请求 |
| 🧱 Responsive UI with React + Vite | 🧱 使用 React + Vite 构建响应式界面 |
| ⚙️ Ready for extensions like Firebase login, favorites, etc. | ⚙️ 可扩展收藏、登录等功能 |

---

## 🛠 Tech Stack / 技术栈

| Layer / 层级 | Technology / 技术 | Version / 版本 |
|---------------|------------------|----------------|
| Frontend 前端 | React (Vite) | Node.js 22.20.0 / npm 10.9.3 |
| Backend 后端 | Flask (Python) | Python 3.14.0 |
| API 接口 | [TMDb API](https://developer.themoviedb.org/reference/intro/getting-started) | v3 |
| Database 数据库 | SQLite  | — |
| Styling 样式 | CSS / Tailwind | — |

---

## 📂 Project Structure / 项目结构

```

MovieMagic/
├── backend/
│   ├── app.py
│   ├── routes/
│   │   ├── search_proxy.py        # /api/search → TMDb search api
│   │   └── discover.py            # /api/discover → TMDb discover api
│   ├── requirements.txt
│   └── .env                       # TMDB_API_KEY=your_tmdb_api_key
├── frontend/
│   ├── src/
│   │   ├── api/flaskClient.js     # 前端与后端交互接口
│   │   ├── components/            # 组件（搜索栏、筛选栏、卡片等）
│   │   ├── pages/Search.jsx       # 主页面（搜索+筛选）
│   │   ├── router.jsx             # 路由配置
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md

````

---

## ⚙️ Installation & Setup / 安装与运行

### 1️⃣ Clone the repository / 克隆项目
```bash
git clone https://github.com/Agouiscoding/MovieMagic
cd MovieMagic
````

---

### 2️⃣ Backend Setup (Flask + Python 3.14.0)

backend environment setup / 后端环境配置：

```bash
cd backend
python -m venv .venv
# macOS / Linux
source .venv/bin/activate
# Windows
.venv\Scripts\activate
```
if there is an error, try to make sure your shell gives it permission

install dependencies/ 安装依赖:

```bash
pip install -r requirements.txt
```

创建 `.env` 文件：

```bash
# backend/.env
TMDB_API_KEY=your_tmdb_api_key
```

run the backend / 运行后端：

```bash
python app.py
```

Flask will run at [http://localhost:5000](http://localhost:5000)

test the backend running / 测试后端运行：

visit [http://localhost:5000/api/hello](http://localhost:5000/api/hello) to test the backend connection.

---

### 3️⃣ Frontend Setup (React + Vite + Node 22.20.0)
make sure you have Node.js 22.20.0 and npm 10.9.3 installed.
```bash
cd ../frontend
npm install
```


run the frontend / 运行前端：

```bash
npm run dev
```

Vite run at [http://localhost:5173](http://localhost:5173)

---

### 4️⃣ Test the connection / 测试运行

访问 [http://localhost:5173](http://localhost:5173)
在搜索框中输入 “Inception”，或使用筛选栏选择类型、年份、日期范围。
visit [http://localhost:5173](http://localhost:5173) and try searching for "Inception" or using the filters.


---

## 🧠 API Endpoints / 后端接口说明

| Endpoint        | Method | Description / 描述 |
| --------------- | :----: | ---------------- |
| `/api/search`   |   GET  | search movie or TV show by keyword / 搜索电影或电视剧（按关键词）   |
| `/api/discover` |   GET  | discover content by type, year, and date range / 按类型、年份、日期范围筛选内容  |
| `/api/hello`    |   GET  | test connection / 测试连接用健康检查接口      |

### Example / 示例

#### 🔍 Search

```
GET /api/search?type=movie&query=inception&page=1
```

#### 🎭 Discover

```
GET /api/discover?type=movie&with_genres=28,12
    &sort_by=popularity.desc
    &fromDate=2023-01-01&toDate=2023-12-31
```

---

---

## 🔐 User Accounts (Firebase) / 用户账号功能

本项目已集成 Firebase 登录（前端）+ Firebase Admin 验证（后端）+ SQLite 持久化业务数据（收藏/提醒/资料）。

### 启动步骤（账号功能）
- 后端环境变量（编辑 `backend/.env`）
  - `TMDB_API_KEY=你的TMDB密钥`
  - `FIREBASE_PROJECT_ID=你的-firebase-project-id`
  - `GOOGLE_APPLICATION_CREDENTIALS=C:\\绝对路径\\到\\service-account.json`
  - 提示：`GOOGLE_APPLICATION_CREDENTIALS` 是下载的服务账号JSON文件，可用相对路径，但相对“启动后端时的工作目录”。
- 前端环境变量（编辑 `frontend/.env`）
  - `VITE_FIREBASE_API_KEY=...`
  - `VITE_FIREBASE_AUTH_DOMAIN=...`
  - `VITE_FIREBASE_PROJECT_ID=...`
  - `VITE_FIREBASE_APP_ID=...`
- 运行
  - 后端：`python backend/app.py`（端口 5000）
  - 前端：在 `frontend` 目录执行 `npm run dev`（端口 5173）
  - 浏览器打开 `http://localhost:5173` → 导航进入 Login / Profile / Favorites / Alerts

### 新增后端路由（均需 Bearer Token）
- `POST /api/user/bootstrap`：首次调用确保用户行存在
- `GET /api/profile` / `PUT /api/profile`：读取/更新资料（display_name, photo_url）
- `GET /api/alerts` / `PUT /api/alerts`：读取/更新提醒偏好（daily/weekly/monthly, keywords, channels）
- `GET /api/favorites` / `POST /api/favorites` / `DELETE /api/favorites/:media_type/:tmdb_id`：收藏列表/新增/删除

### 关键文件
- 后端
  - `backend/app.py`：加载 `backend/.env`，注册蓝图，初始化数据库
  - `backend/auth.py`：Firebase Admin 初始化与 `require_auth`（验证 ID Token 并 upsert 用户）
  - `backend/db.py`：SQLite 引擎/会话，`init_db()` 建表
  - `backend/models.py`：`User`、`Favorite`、`AlertPreference` 模型
  - `backend/routes/user.py`：用户相关 API 路由
- 前端
  - `frontend/src/firebase.js`：Firebase Web SDK 初始化
  - `frontend/src/auth/AuthProvider.jsx`：提供 `useAuth()`（user/idToken/login/logout/register）
  - `frontend/src/api/flaskClient.js`：封装 API；在请求头附加 `Authorization: Bearer <idToken>`
  - 页面：`frontend/src/pages/Login.jsx`、`Profile.jsx`、`Alerts.jsx`、`Favorites.jsx`
  - 路由：`frontend/src/router.jsx`（导航与登录显示）

### 常见问题
- `TMDB_API_KEY missing`
  - 确认在 `backend/.env` 设置了 TMDB_API_KEY，或在 PowerShell 中使用 `$Env:TMDB_API_KEY = '...'`，并重启后端
- 点击 Favorites 报 `Invalid token: A project ID is required...`
  - 在 `backend/.env` 设置 `FIREBASE_PROJECT_ID` 与 `GOOGLE_APPLICATION_CREDENTIALS`（服务账号 JSON）
  - 前后端需使用同一 Firebase 项目（前端 `.env` 的 projectId 与后端一致）


---

## 🧩 Environment Variables / 环境变量

| Variable                     | Description / 说明 | Example                            |
| ---------------------------- | ---------------- | ---------------------------------- |
| `TMDB_API_KEY`               | TMDb v3 API 密钥   | `e048c3324d1e8ec79e78fd1e981d0c44` |


---

## 💻 Commands Summary / 常用命令汇总

| Action / 操作 | Command / 命令                      |
| ----------- | --------------------------------- |
| 启动后端        | `cd backend && python app.py`     |
| 启动前端        | `cd frontend && npm run dev`      |
| 安装后端依赖      | `pip install -r requirements.txt` |
| 安装前端依赖      | `npm install`                     |
| 打包前端（部署）    | `npm run build`                   |

---

## 🧪 Example Workflow / 使用流程

1. 启动 Flask 后端（端口 5000）
2. 启动 React 前端（端口 5173）
3. 搜索：`/api/search`（按标题）
4. 筛选：`/api/discover`（按类型、年份、日期范围）
5. 查看结果网格并切换分页

Engligh:
1. Start the Flask backend (port 5000)
2. Start the React frontend (port 5173)
3. Search: `/api/search` (by title)
4. Discover: `/api/discover` (by genre, year, date range)
5. View results grid and paginate
---

## 🏗 Future Improvements / 后续改进方向

| Feature                       | 中文说明      |
| ----------------------------- | --------- |
| 🔐 Firebase authentication    | 用户登录与收藏功能 |
| 💾 SQLite integration         | 用户收藏数据持久化 |
| 🌙 Dark / light theme         | 深浅色主题切换   |
| 🧪 Unit tests (PyTest / Jest) | 单元测试完善    |
| 🚀 Deploy to Vercel + Render  | 前后端部署上线   |

---






