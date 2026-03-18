# FinSight

**FinSight** is a high-performance Financial Intelligence & Document Analysis platform. It leverages AI to extract actionable insights from PDFs and CSVs, featuring a sleek, glassmorphic dashboard built with vanilla web technologies and a Node.js/SQLite backend.

## ✨ Features
- **AI-Powered Analysis**: Integrated with Google Gemini 2.0 Flash for real-time document intelligence.
- **Secure Sessions**: JWT-based authentication with bcrypt password hashing.
- **Dynamic Dashboard**: Responsive KPI cards, financial metrics charts (Chart.js), and animated stat counters.
- **Modular Architecture**: Clean separation between frontend views, services, and the Express backend.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/AADITYASHARMA0405/finsight.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file based on `.env.example`.
4. Run the development server:
   ```bash
   npm start
   ```
   Open `http://localhost:3000` in your browser.

## 🛠️ Technology Stack
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+), Phosphor Icons, Chart.js.
- **Backend**: Node.js, Express.
- **Database**: SQLite (PostgreSQL migration planned for Phase 3).
- **AI**: Google Gemini 2.0 Flash.

## 📄 License
This project is licensed under the ISC License.
