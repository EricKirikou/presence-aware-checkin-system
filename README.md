# 🕒 Attendance System

A fullstack employee attendance management system built with:

- **Frontend:** Vite + React + TypeScript + Tailwind CSS + ShadCN-UI
- **Backend:** Node.js + Express.js + MongoDB (via MongoDB Atlas)
- **Authentication:** JWT-based login & password management

---

## 📁 Project Structure

attendance-system/
│
├── mongo-api/ # Backend (Node.js + Express)
│ ├── server.js
│ ├── db.js
│ ├── .env
│ └── ...
│
├── frontend/ # Frontend (React + Vite)
│ ├── index.html
│ ├── src/
│ ├── vite.config.ts
│ └── ...
│
├── .gitignore
├── package.json
└── README.md

yaml
Copy
Edit

---

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/attendance-system.git
cd attendance-system
2. Install Dependencies
bash
Copy
Edit
npm install
This installs dependencies for both client and server if concurrently is set in root.

🔐 Environment Variables
Create a .env file in the mongo-api/ folder:

env
Copy
Edit
# mongo-api/.env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/attendance-db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:5173
PORT=3001
NODE_ENV=development
🏃‍♂️ Run the App
bash
Copy
Edit
npm run dev
This runs:

React client on http://localhost:5173

Express server on http://localhost:3001

You can also run separately from frontend/ and mongo-api/ folders using npm run dev.

🔗 API Endpoints
✅ POST /api/register
Registers a new user. Fields: name, email, password, role?

✅ POST /api/login
Logs in a user and returns a JWT.

✅ POST /api/update-password
Updates user password. Requires Authorization header: Bearer <token>

✅ GET /api/health
Health check endpoint.

🧪 Testing the API
Use Postman or Thunder Client:

Base URL: http://localhost:3001/api

Add Authorization: Bearer <your_jwt_token> to protected routes.

🛡 Security Features
JWT-based authentication

Helmet for HTTP headers

Rate limiting (100 req / 15 mins)

MongoDB sanitization

CORS (limited to localhost frontend)

🧰 Technologies Used
Frontend	Backend	Utilities
React + TypeScript	Node + Express	UUID
Vite	MongoDB + Mongoose	bcryptjs
Tailwind CSS	dotenv	jsonwebtoken
shadcn/ui	nodemon	express-rate-limit
Axios	cors	helmet + sanitize

✨ Features To Add
 Attendance marking

 Admin dashboard

 Role-based access

 CSV reports

 Forgot password

 User profile management

📜 License
This project is open-source and available under the MIT License.

💬 Author
Built by @Kayrico 🚀





