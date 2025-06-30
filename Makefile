# ChatBuddy - Modern Real-time Chat Application
# Makefile for development and deployment tasks

.PHONY: help install dev build start stop clean test lint docker

# Default target
help:
	@echo "ChatBuddy Development Commands:"
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make install     - Install all dependencies"
	@echo "  make install-fe  - Install frontend dependencies only"
	@echo "  make install-be  - Install backend dependencies only"
	@echo ""
	@echo "Development:"
	@echo "  make dev         - Start both frontend and backend in development mode"
	@echo "  make dev-fe      - Start frontend development server only"
	@echo "  make dev-be      - Start backend development server only"
	@echo ""
	@echo "Building:"
	@echo "  make build       - Build both frontend and backend for production"
	@echo "  make build-fe    - Build frontend only"
	@echo "  make build-be    - Build backend only"
	@echo ""
	@echo "Testing & Quality:"
	@echo "  make test        - Run all tests"
	@echo "  make lint        - Run linting"
	@echo "  make clean       - Clean build artifacts and node_modules"
	@echo ""
	@echo "Deployment:"
	@echo "  make start       - Start production servers"
	@echo "  make stop        - Stop running servers"
	@echo ""

# Installation commands
install:
	@echo "📦 Installing all dependencies..."
	npm install
	npm install --workspace=frontend
	npm install --workspace=backend
	@echo "✅ All dependencies installed!"

install-fe:
	@echo "📦 Installing frontend dependencies..."
	npm install --workspace=frontend
	@echo "✅ Frontend dependencies installed!"

install-be:
	@echo "📦 Installing backend dependencies..."
	npm install --workspace=backend
	@echo "✅ Backend dependencies installed!"

# Development commands
dev:
	@echo "🚀 Starting ChatBuddy in development mode..."
	@echo "Frontend: http://localhost:5173"
	@echo "Backend: http://localhost:8000"
	@echo "Press Ctrl+C to stop all servers"
	npx concurrently \
		"npm run dev --workspace=backend" \
		"npm run dev --workspace=frontend" \
		--names "backend,frontend" \
		--prefix-colors "blue,green" \
		--kill-others

dev-fe:
	@echo "🎨 Starting frontend development server..."
	npm run dev --workspace=frontend

dev-be:
	@echo "🖥️ Starting backend development server..."
	npm run dev --workspace=backend

# Build commands
build:
	@echo "🏗️ Building ChatBuddy for production..."
	npm run build --workspace=backend
	npm run build --workspace=frontend
	@echo "✅ Build completed!"

build-fe:
	@echo "🏗️ Building frontend..."
	npm run build --workspace=frontend
	@echo "✅ Frontend build completed!"

build-be:
	@echo "🏗️ Building backend..."
	npm run build --workspace=backend
	@echo "✅ Backend build completed!"

# Testing and quality
test:
	@echo "🧪 Running all tests..."
	npm run test --workspace=frontend
	npm run test --workspace=backend
	@echo "✅ All tests completed!"

lint:
	@echo "🔍 Running linter..."
	npm run lint --workspace=frontend
	@echo "✅ Linting completed!"

# Production commands
start:
	@echo "🚀 Starting ChatBuddy in production mode..."
	npx concurrently \
		"npm run start --workspace=backend" \
		"npm run preview --workspace=frontend" \
		--names "backend,frontend" \
		--prefix-colors "blue,green"

# Utility commands
clean:
	@echo "🧹 Cleaning build artifacts and dependencies..."
	rm -rf node_modules
	rm -rf frontend/node_modules
	rm -rf backend/node_modules
	rm -rf frontend/dist
	rm -rf backend/dist
	@echo "✅ Cleanup completed!"

stop:
	@echo "⏹️ Stopping all ChatBuddy processes..."
	pkill -f "node.*chatbuddy" || true
	pkill -f "vite.*dev" || true
	@echo "✅ All processes stopped!"

# Environment setup
setup-env:
	@echo "⚙️ Setting up environment files..."
	@if [ ! -f backend/.env ]; then \
		echo "Creating backend/.env from template..."; \
		cp backend/.env.example backend/.env 2>/dev/null || \
		echo "PORT=8000\nMONGODB_URI=mongodb://localhost:27017/chatbuddy\nJWT_SECRET=your-super-secret-jwt-key\nCLOUDINARY_CLOUD_NAME=your-cloudinary-name\nCLOUDINARY_API_KEY=your-api-key\nCLOUDINARY_API_SECRET=your-api-secret" > backend/.env; \
	fi
	@if [ ! -f frontend/.env ]; then \
		echo "Creating frontend/.env from template..."; \
		cp frontend/.env.example frontend/.env 2>/dev/null || \
		echo "VITE_API_BASE_URL=http://localhost:8000\nVITE_SOCKET_URL=http://localhost:8000" > frontend/.env; \
	fi
	@echo "✅ Environment files created!"

# Quick setup for new developers
quickstart: install setup-env
	@echo ""
	@echo "🎉 ChatBuddy is ready!"
	@echo ""
	@echo "Next steps:"
	@echo "1. Configure your .env files in backend/ and frontend/"
	@echo "2. Make sure MongoDB is running"
	@echo "3. Run 'make dev' to start development"
	@echo ""

# Docker commands (for future use)
docker-build:
	@echo "🐳 Building Docker images..."
	docker-compose build
	@echo "✅ Docker images built!"

docker-up:
	@echo "🐳 Starting ChatBuddy with Docker..."
	docker-compose up -d
	@echo "✅ ChatBuddy is running in Docker!"

docker-down:
	@echo "🐳 Stopping Docker containers..."
	docker-compose down
	@echo "✅ Docker containers stopped!"

# Database commands
db-seed:
	@echo "🌱 Seeding database with sample data..."
	npm run seed --workspace=backend
	@echo "✅ Database seeded!"

db-reset:
	@echo "⚠️ Resetting database..."
	npm run db:reset --workspace=backend
	@echo "✅ Database reset!"

# Version and info
version:
	@echo "ChatBuddy Version Information:"
	@echo "Project: $(shell node -p "require('./package.json').version")"
	@echo "Node.js: $(shell node --version)"
	@echo "npm: $(shell npm --version)"

info:
	@echo "📊 ChatBuddy Project Information:"
	@echo ""
	@echo "Structure:"
	@echo "  Frontend: React + TypeScript + Vite"
	@echo "  Backend: Node.js + Express + TypeScript"
	@echo "  Database: MongoDB"
	@echo "  Real-time: Socket.IO"
	@echo ""
	@echo "Development URLs:"
	@echo "  Frontend: http://localhost:5173"
	@echo "  Backend: http://localhost:8000"
	@echo ""
