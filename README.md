# DeepSeeHarness 底座平台

> 🚀 开源底座项目，欢迎大家二次开发！

![Python](https://img.shields.io/badge/Python-3.8+-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3+-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌟 关于我们

**DeepSeeHarness 底座平台** 是一个开源的智能底座架构，提供 **项目插拔管理** 和 **数字员工办公区** 两大核心能力。我们希望这个项目能为开发者提供一个灵活、可扩展的基础框架，帮助你快速搭建自己的智能工作平台。

**我们欢迎任何形式的二次开发和贡献！** 无论你是想：
- 🔧 基于底座扩展新功能
- 🎨 定制自己的 UI 主题
- 🤖 接入更多 AI 能力
- 📦 封装成自己的产品

都可以直接 Fork 本项目开始你的创作。

## 🎯 核心功能

| 模块 | 说明 |
|------|------|
| 🎯 **项目管理** | 项目像萝卜一样插入/拔出底座，统一提供运行环境和依赖 |
| 🤖 **数字员工** | 办公区+工位+卡槽，每个数字人是独立个体 |
| 📊 **仪表板** | 实时统计项目、员工、工位使用情况 |
| 🏢 **办公区** | 可视化工位布局，员工自由分配 |

## 🚀 一键启动

### Windows

双击 `start.bat` 即可一键启动前后端服务。

### 手动启动

```bash
# 1. 安装后端依赖
pip install -r requirements.txt

# 2. 安装前端依赖
cd frontend && npm install && cd ..

# 3. 启动后端 (端口 8080)
cd backend && python main.py

# 4. 启动前端 (端口 3000, 新终端)
cd frontend && npm run dev
```

### 访问地址

| 服务 | 地址 |
|------|------|
| 前端界面 | http://localhost:3000 |
| 后端 API | http://localhost:8080 |
| API 文档 | http://localhost:8080/docs |

## 📁 项目结构

```
base_platform/
├── start.bat               # 一键启动脚本
├── stop.bat                # 停止服务脚本
├── requirements.txt        # Python 依赖
├── .gitignore              # Git 忽略配置
├── README.md               # 项目说明
├── config/
│   └── example.json        # 配置示例
├── backend/                # FastAPI 后端
│   ├── main.py             # API 入口
│   └── core/               # 底座核心逻辑
│       ├── base_architecture.py   # 底座架构
│       ├── project_manager.py     # 项目管理
│       ├── worker_manager.py      # 员工管理
│       └── resource_pool.py       # 资源池
└── frontend/               # React + Vite 前端
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── index.css
        └── components/
            ├── Dashboard.jsx      # 仪表板
            ├── Projects.jsx       # 项目管理
            ├── Workers.jsx        # 员工管理
            └── Office.jsx         # 办公区
```

## 🛠️ 技术栈

- **后端**: Python 3.8+ / FastAPI / Uvicorn / Pydantic
- **前端**: React 18 / Vite / Tailwind CSS / Framer Motion / Lucide Icons
- **通信**: RESTful API + Axios

## 📡 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/projects` | 创建项目 |
| GET | `/api/projects` | 项目列表 |
| DELETE | `/api/projects/{id}` | 删除项目 |
| POST | `/api/projects/{id}/start` | 启动项目 |
| POST | `/api/projects/{id}/stop` | 停止项目 |
| POST | `/api/workers` | 雇佣员工 |
| GET | `/api/workers` | 员工列表 |
| DELETE | `/api/workers/{id}` | 解雇员工 |
| POST | `/api/office` | 创建工位 |
| GET | `/api/office` | 办公区状态 |
| POST | `/api/assign` | 分配工位 |
| POST | `/api/release` | 释放工位 |
| GET | `/api/dashboard` | 仪表板数据 |

## 🤝 参与贡献

我们非常欢迎社区参与！你可以通过以下方式贡献：
1. **Fork** 本仓库
2. 创建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建一个 **Pull Request**

### 💡 二次开发建议

| 方向 | 说明 |
|------|------|
| **接入真实 AI** | 替换内存存储，接入 LLM API，让数字员工真正工作 |
| **持久化存储** | 集成数据库（SQLite/PostgreSQL），数据不再随重启丢失 |
| **权限系统** | 添加用户登录、角色权限管理 |
| **WebSocket 实时通信** | 工位状态实时推送，告别轮询 |
| **Docker 部署** | 提供 Dockerfile 和 docker-compose，一键容器化部署 |
| **插件系统** | 开放底座插件接口，支持社区贡献扩展模块 |

### 📬 反馈与交流

- 🐛 发现 Bug？请提交 [Issue](../../issues)
- 💡 有新想法？欢迎发起 [Discussion](../../discussions)
- ⭐ 觉得不错？给个 Star 支持一下！

## 📄 License

本项目基于 [MIT License](LICENSE) 开源，你可以自由使用、修改和分发。

---

> **Made with ❤️ by DeepSeeHarness Team** — 开源底座，共建未来 🚀
