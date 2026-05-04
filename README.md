# 🍏 HLFR - Hyper-Local Food Rescue

![HLFR Banner](./docs/images/banner.png)

**HLFR** is a community-driven platform designed to bridge the gap between food surplus and food scarcity. By connecting local donors (restaurants, grocers, individuals) with receivers (charities, food banks, neighbors), we aim to reduce food waste and support those in need through hyper-local coordination.

---

## ✨ Key Features

- 📍 **Geo-Location Search**: Find available food listings within a specific radius of your current location.
- 🔐 **Secure Authentication**: Role-based access for Donors and Receivers.
- 📦 **Real-time Listings**: Live status updates for food availability, expiry, and claim status.
- 🔔 **Instant Notifications**: Stay updated on new listings and claim approvals via in-app polling.
- 📊 **Dashboard Analytics**: Track rescue statistics and impact (coming soon).
- 📅 **Automated Expiry**: System automatically removes stale listings to ensure food safety.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **Database**: SQLite with [SQLAlchemy](https://www.sqlalchemy.org/) (Async)
- **Validation**: Pydantic v2
- **Scheduling**: APScheduler (for automated cleanup)

### Frontend
- **Framework**: [React](https://react.dev/) (Vite)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Fetching**: [Axios](https://axios-http.com/) & [React Query](https://tanstack.com/query/latest)

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10 or higher
- Node.js 18+ and npm

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the setup script to initialize the database:
   ```bash
   ./setup.bat
   ```
5. Start the API server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *The API will be available at `http://localhost:8000`*

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:5173`*

---

## 📖 API Documentation

Once the backend is running, you can access the interactive API documentation:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request or open an Issue for suggestions and bug reports.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">Made with ❤️ for a Zero-Waste World</p>
