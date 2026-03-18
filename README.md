# FinSight

FinSight is a high-performance Financial Intelligence & Document Analysis platform. It leverages AI to extract actionable insights from PDFs and CSVs, featuring a sleek, glassmorphic dashboard built with vanilla web technologies and a Node.js/SQLite backend.

## Project Architecture

The application is structured to provide a clean separation of concerns, enabling scalability and easy maintenance:

- Frontend Client: A single-page application (SPA) built using vanilla HTML5, CSS3, and JavaScript (ES6+). It utilizes a custom hash-based routing system (`app.js`) to dynamically load views without full page reloads.
- Backend Server: A robust Node.js and Express server (`server.js`) that handles API requests, authentication, file uploads, and Database interactions.
- Database Layer: A unified database module (`db/database.js`) that operates on SQLite for local development and can seamlessly switch to PostgreSQL for production environments.
- AI Integration: The application interfaces with the Google Gemini 2.0 Flash API to process uploaded financial documents, extracting key metrics, anomalies, and answering user queries.

## Key Features

- AI-Powered Analysis: Integrated with Google Gemini 2.0 Flash for real-time document intelligence. Handles document parsing, summarization, and interactive Q&A.
- Secure Sessions: JSON Web Token (JWT) based authentication with bcrypt password hashing for secure user access control.
- Dynamic Dashboard: Responsive KPI cards, financial metrics charts driven by Chart.js, and dynamic data tables.
- Modular Architecture: Clean separation between frontend views (`/views`), services (`/services`), and the Express backend.
- UI Design System: A minimalist, high-contrast aesthetic utilizing solid colors and subtle glassmorphism, completely devoid of heavy gradients and complex borders for a premium feel.

## Technology Stack

- Frontend: HTML5, CSS3, JavaScript (Vanilla), Phosphor Icons, Chart.js
- Backend: Node.js, Express, Multer (for file uploads)
- Database: SQLite3, pg (PostgreSQL support)
- AI Model: Google Gemini 2.0 Flash
- CI/CD: GitHub Actions (Node.js CI workflow)

## Setup and Installation

### Prerequisites
- Node.js (v18 or higher)
- npm (Node Package Manager)
- A Google Gemini API Key

### Installation Steps

1. Clone the repository and navigate into the project directory.

2. Install backend dependencies:
   npm install

3. Configure Environment Variables:
   Create a `.env` file in the root directory and add the following keys:
   PORT=3000
   JWT_SECRET=your_secure_jwt_secret_here
   GEMINI_API_KEY=your_gemini_api_key_here
   DATABASE_URL= (Leave blank for local SQLite, or provide a postgres connection string)

4. Start the Application:
   npm start

5. Access the Platform:
   Open a web browser and navigate to `http://localhost:3000`. 
   Use the default test credentials: `admin@finsight.io` / `admin123`.

## API Endpoints Overview

- POST `/api/auth/login`: Authenticate user and return JWT.
- GET `/api/dashboard`: Retrieve aggregated financial metrics and UI data.
- GET `/api/documents`: Fetch a list of processed documents.
- POST `/api/documents/upload`: Upload and process a new PDF/CSV document.
- GET `/api/documents/:id/status`: Poll for the current analysis status of a specific document.
- POST `/api/ai/query`: Chat with the AI regarding a specific document.

## License

This project is licensed under the ISC License.
