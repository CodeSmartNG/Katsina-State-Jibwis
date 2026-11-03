

🕌 Katsina State JIBWIS Portal

A modern, bilingual (English/Hausa), full-stack membership and content management portal built for Jama'atu Izalatil Bid'ah Wa'iqamatis Sunnah (JIBWIS) Katsina State.

🔗 Live Links

· Frontend (Portal): https://katsina-state-jibwis-rho.vercel.app/
· Backend (API): https://katsina-state-jibwis.onrender.com

---

🔑 Default Admin Credentials

(⚠️ Important: Change this password immediately after your first login in production!)

· Email: admin@jibwis.local
· Password: (Whatever you set as ADMIN_SEED_PASSWORD in your Render environment variables)

---

✨ Key Features

1. Role-Based Access Control (RBAC)

The system has a strict 4-tier hierarchy. Users can only manage members below their own rank.

· State Admin: Full access (Can create/delete anyone, edit any rank, manage all content).
· LGA Officer: Can view and manage members within their specific LGA.
· Ward Officer: Can view and manage members within their specific Ward.
· Member: Can log in, view announcements/activities, and edit their own profile.

2. Member Management

· Self-Registration: Members can register and wait for admin approval.
· Admin Creation: Officers can create members directly (auto-approved).
· Rank & Role Separation:
  · System Role: Controls permissions (e.g., wardOfficer).
  · Org Rank: Controls the title (e.g., Chairman, Secretary, Member).
· Promote/Demote: State Admins can easily upgrade or downgrade a user's system role.
· Export to CSV: Download the entire member directory (with search filters applied) into an Excel/CSV file.

3. Content Management

· Announcements: Create, edit, and delete announcements. Supports English and Hausa text simultaneously.
· Activities: Schedule events and programs.
· Leadership Carousel: A dynamic, moving image carousel on the Home page managed by the State Admin.

4. User Experience

· Bilingual UI: Toggle between English and Hausa across the entire application.
· Profile Editing: Users can update their phone number, password, and profile picture.
· Image Uploads: Integrated with Cloudinary for fast, reliable profile and leader image hosting.
· Responsive Design: Works beautifully on mobile phones, tablets, and desktops.

---

🛠️ Tech Stack

· Frontend: React.js (via Vite), React Router DOM, Axios, Vanilla CSS.
· Backend: Node.js, Express.js.
· Database: MongoDB Atlas (Cloud).
· Image Storage: Cloudinary.
· Authentication: JSON Web Tokens (JWT) & Bcryptjs.
· Deployment: Vercel (Frontend), Render (Backend).
· Uptime Monitoring: UptimeRobot (Keeps Render awake 24/7).

---

🚀 Local Development Setup

If you want to run this project on your local machine:

1. Clone the Repository

```bash
git clone https://github.com/CodeSmartNG/Katsina-State-Jibwis.git
cd Katsina-State-Jibwis
```

2. Setup Backend

```bash
cd backend
npm install
```

Create a .env file in the backend folder and add:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
ADMIN_SEED_EMAIL=admin@jibwis.local
ADMIN_SEED_PASSWORD=Admin@12345
CORS_ORIGIN=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=iwqbhxxt
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend:

```bash
npm run dev
```

3. Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create a .env file in the frontend folder and add:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

☁️ Deployment & Maintenance Guide

Environment Variables

If you ever need to rebuild the deployment, here are the environment variables required:

· Vercel: VITE_API_URL (Set to your Render backend URL + /api).
· Render: MONGO_URI, JWT_SECRET, ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD, CORS_ORIGIN, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.
  · Note: Render's Build Command must be npm install --legacy-peer-deps due to NPM dependency conflicts with Cloudinary.

Keeping the Server Awake

Render's free tier puts the server to sleep after 15 minutes of inactivity.

· Solution: We have configured UptimeRobot to ping https://katsina-state-jibwis.onrender.com/api/health every 5 minutes.
· Action: Do not delete the UptimeRobot monitor, or the app will take ~50 seconds to load for users.

Database Backups

MongoDB Atlas automatically backs up data on the free tier (though limited). For manual backups, you can use mongodump or export your collections directly from the Atlas UI.

---

📖 Administrator Guide

How to Approve New Members

1. Log in as an Admin/Officer.
2. Go to the Members tab.
3. Look for members with a ⏳ (Pending) icon.
4. Click the green Approve button.

How to Change a Member's Rank/Title

1. Go to the Members tab.
2. Under the Rank / Role column, click the text that has a pencil icon (e.g., Member ✏️).
3. Type the new title (e.g., State Secretary, Imam, Chairman).
4. Click OK. It saves instantly.

How to Add Leaders to the Home Page

1. Go to the Home page.
2. Scroll to the bottom (State Admin only).
3. Upload a picture, type the leader's name and title, and click Add Leader.
4. They will instantly appear in the moving carousel.

How to Manage Announcements

1. Go to the Announcements tab.
2. Fill out the form at the top to post a new one (provide both English and Hausa text).
3. As a State Admin, you will see Edit and Delete buttons on every card to manage existing posts.

---

Built with ❤️ for Katsina State JIBWIS.
