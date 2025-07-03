# Trading Journal Web Application

## English Documentation

### Overview  
Trading Journal is a full-stack web application for tracking and analyzing your stock trades. Users can log individual trades or import CSV files from their broker, filter and search their entries, manage custom tags, and visualize performance with interactive charts.

### Features  
- **User Authentication**  
  - Email/password registration & login  
  - JWT-based authorization  
- **Trade Logging (CRUD)**  
  - Create, read, update, delete individual journal entries  
  - Fields: date, symbol, entry/exit price, quantity, PnL, tags, notes  
- **Filtering & Search**  
  - Filter by symbol, date range, tags  
- **CSV Import**  
  - Upload broker CSV, parse with **multer** & **csv-parse**, bulk-insert trades  
- **Tag Management**  
  - Fetch distinct tags from your entries  
  - Autocomplete + free-form tag selector  
- **Analytics & Charts**  
  - Cumulative PnL time series (Line Chart)  
  - Win/Loss breakdown (Pie Chart)  
  - Win rate, average win/loss, risk-reward ratio  
- **Global UX**  
  - Responsive navbar & layout with **Tailwind CSS** + **DaisyUI**  
  - App-level loading and error boundaries  
- **Monorepo**  
  - Single repository with `client/` (Next.js) and `server/` (Express) workspaces  

### Technology Stack  
- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, DaisyUI, React Hook Form  
- **Backend**: Express.js, TypeScript, Mongoose (MongoDB), JWT, multer, csv-parse  
- **Charts**: Chart.js via react-chartjs-2  
- **Deployment**: Environment-based `.env` configs, Vercel/Heroku ready  

### Project Structure  
trading-journal/
├─ package.json # Root (npm workspaces)
├─ client/ # Next.js App Router
│ ├─ src/
│ │ ├─ app/ # Pages & layouts
│ │ ├─ components/ # Reusable UI (Navbar, TagSelector…)
│ │ ├─ context/ # AuthContext
│ │ ├─ lib/ # API helper
│ │ └─ styles/ # globals.css
│ └─ tailwind.config.js
└─ server/ # Express API
├─ src/
│ ├─ routes/ # auth, journals
│ ├─ models/ # User, JournalEntry
│ ├─ middleware/ # auth, validate
│ ├─ schemas.ts # Zod schemas (if used)
│ └─ index.ts # Server setup
└─ tsconfig.json

### Installation & Setup

1. **Clone the repository**  
   ```bash
   git clone https://github.com/your-username/trading-journal.git
   cd trading-journal
2. **Install dependencies**  
   ```bash
   npm install
   cd client && npm install && cd ../server && npm install
3. **Environment Variables**
    server/.env
    ```env
    MONGODB_URI=your_mongo_uri
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRES_IN=1d
    PORT=5000
    CORS_ORIGIN=http://localhost:3000
    ```
    client/.env.local
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5000/api
    ```
4. **Run in Development**
   ```bash
   # From project root
    npm run dev
    # This runs both:
    # - client: http://localhost:3000  
    # - server: http://localhost:5000
   ```
5. **Build & Deploy**
   Client: 
   ```bash
   npm --workspace client run build
   ```
   Server:
   ```bash
   npm --workspace server run build
   ```
   Configure your hosting (Vercel for client, Heroku/Railway for server) to point at respective build outputs and set environment variables.
