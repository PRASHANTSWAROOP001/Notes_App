# 📝 Notes App (Dockerized)

A secure, containerized Notes web application built with Node.js, Express, Prisma, and PostgreSQL.  
This app features JWT authentication (access & refresh tokens), robust API endpoints, and is production-ready with Docker and Docker Compose.

---

## 🚀 Features

- User registration & login (JWT-based authentication)
- Add, view, update, and delete personal notes
- PostgreSQL database (runs in a container)
- Prisma ORM for type-safe DB access
- Multi-stage Docker build for small, fast images
- Environment variable support via `.env`
- Ready for local development or production deployment

---

## 🐳 Running with Docker

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)

### 1. Clone the repository

```bash
git clone https://github.com/PRASHANTSWAROOP001/notes-app.git
cd notes-app
```

### 2. Configure environment variables

Copy the example env file and edit as needed:

```bash
cp .env.example .env
```

**Key variables:**
- `DATABASE_URL` (PostgreSQL connection string)
- `JWT_SECRET` (your JWT secret)
- `PORT` (default: 5000)

### 3. Start the app with Docker Compose

```bash
docker-compose up --build -d
```

- The backend will be available at [http://localhost:5000](http://localhost:5000)
- PostgreSQL will run in its own container

### 4. Stopping and cleaning up

```bash
docker-compose down
```

---

## 🗂️ Project Structure

```
.
├── src/                # Express app source code
│   ├── controller/     # Route controllers (auth, notes)
│   ├── utils/          # Utilities (logger, validation, JWT, error handling)
│   └── ...
├── prisma/             # Prisma schema and migrations
├── tests/              # Jest test files
├── Dockerfile          # Multi-stage Docker build
├── docker-compose.yml  # Compose for app + database
├── package.json
├── tsconfig.json
└── .env.example
```

---

## 🧪 Running Tests

You can run tests locally (outside Docker):

```bash
npm install
npm test
```

---

## 🛠️ Useful Commands

- **Build the app:**  
  `docker-compose build`
- **View logs:**  
  `docker-compose logs -f`
- **Access the backend container shell:**  
  `docker-compose exec app sh`
- **Run Prisma migrations:**  
  `docker-compose exec app npx prisma migrate deploy`

---

## ⚡ API Endpoints

- `POST /api/auth/create-user` – Register a new user
- `POST /api/auth/login` – Login
- `POST /api/auth/logout` – Logout
- `GET /api/note/getAll-note?page=2&pageSize=10` – List notes (auth required)
- `POST /api/note/add-note` – Add note (auth required)
- `DELETE /api/note/:id` – Delete note (auth required)
- `PUT /api/note/update-note` – Delete note (auth required)
- `GET /api/note/getNote/:id` – List note(auth required)

---

## 📝 Notes

- The app uses a multi-stage Docker build for small, production-ready images.
- Prisma generates the client both at build and runtime for compatibility.
- Logs are written to the `/app/logs` directory inside the container.

---

## 📄 License

MIT

---

## 🙋‍♂️ Questions?

Open an issue or PR on [GitHub](https://github.com/yourusername/notes-app).
