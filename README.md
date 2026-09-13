# ⚔️ LifeQuest — Turn Your Real Life Into an RPG

> **Transform everyday goals into quests. Complete them. Earn XP. Build your character. Level up your life.**

LifeQuest is a gamified productivity and personal-growth platform that transforms real-world activities into RPG-style quests.

Instead of treating productivity as a boring checklist, LifeQuest turns every completed activity into character progression — rewarding users with **XP, Gold, Attributes, Streaks, Achievements, and virtual rewards**.

---

## 🌟 Why LifeQuest?

Traditional productivity applications often follow:

```text
Task → Checkbox → Done
```

LifeQuest changes the experience to:

```text
Real-Life Goal
      ↓
     Quest
      ↓
   Take Action
      ↓
  Verification
      ↓
 XP + Gold + Attribute
      ↓
    Level Up
      ↓
   Rewards
      ↓
 Character Growth
```

The goal is to make productivity feel like **progression in a game rather than a list of responsibilities**.

---

# 🎮 Core Features

## 🔐 Secure Authentication

Users can:

* Create an account
* Log in securely
* Log out
* Maintain authenticated sessions
* Access only their own data
* Manage their own quests and character

Authentication and authorization are handled securely, with user data isolated between accounts.

---

## ⚔️ Quest Management

Users can create and manage real-life quests.

### Quest categories

* 💻 Coding
* 📚 Study
* 🏋️ Fitness
* 📖 Reading
* ❤️ Health
* 🎨 Creativity
* 🧠 Personal Growth
* ⚡ Other

Users can:

* Create quests
* View quests
* Edit quests
* Delete quests
* Complete quests
* Track quest history

---

# 🧙 RPG Character System

Every user has a persistent RPG character.

Example:

```text
LEVEL 07
THE SEEKER

740 / 1000 XP

STR 42
INT 68
VIT 51
MIND 39
```

Real-life activities directly contribute to character development.

### Attribute mapping

| Activity       | Character Attribute |
| -------------- | ------------------- |
| Coding         | Intellect           |
| Studying       | Intellect           |
| Gym            | Strength            |
| Running        | Strength            |
| Healthy habits | Vitality            |
| Meditation     | Mind                |
| Reading        | Intellect           |

This creates a meaningful connection between **real-world improvement and virtual character growth**.

---

# 📈 Non-Linear XP & Leveling

LifeQuest uses a non-linear progression system.

Each subsequent level requires more XP than the previous one.

Conceptually:

```text
Level 1 → Level 2
      ↓
Requires more XP
      ↓
Level 2 → Level 3
      ↓
Requires even more XP
      ↓
Level 3 → Level 4
```

This prevents the progression system from becoming repetitive and creates a long-term sense of advancement.

The RPG engine handles:

* XP calculation
* Level thresholds
* Multiple level-ups
* Attribute progression
* Reward calculation

---

# 🔥 Streak System

Consistency matters.

LifeQuest tracks consecutive days of meaningful activity.

Example:

```text
🔥 12 DAY STREAK

MON  ✓
TUE  ✓
WED  ✓
THU  ✓
FRI  ✓
SAT  ✓
SUN  ○
```

The system maintains:

* Current streak
* Longest streak
* Last activity date
* Streak milestones

Milestone rewards can be unlocked at:

```text
7 Days
14 Days
30 Days
60 Days
100 Days
```

---

# 💰 Rewards & Economy

Completing quests earns **Gold**.

Gold can be spent in the:

## 🏰 Reward Forge

Users can purchase virtual items such as:

* Avatars
* Profile frames
* Themes
* Badges
* Titles
* Cosmetic artifacts

Example:

```text
DRAGON EMBLEM

RARE

500 GOLD
```

The economy creates an additional reason for users to continue completing quests.

---

# 🎒 Inventory

Purchased items are stored in the user's inventory.

Users can:

* View owned items
* Filter items
* Equip cosmetics
* View rarity
* View item descriptions

Inventory data persists between sessions.

---

# 🏆 Achievements & Badges

Users unlock achievements based on their progress.

Examples:

### FIRST QUEST

Complete your first quest.

### WEEK WARRIOR

Maintain a 7-day streak.

### LEVEL TEN

Reach Level 10.

### CENTURION

Complete 100 quests.

### QUEST MASTER

Complete 250 quests.

Achievements provide long-term goals beyond daily tasks.

---

# 🔎 Quest Verification

LifeQuest recognizes an important limitation:

> A web application cannot perfectly prove that a user physically completed every real-world activity.

Instead of falsely claiming absolute verification, LifeQuest supports multiple verification modes.

### ⚡ Self Report

The user reports that they completed the activity.

Status:

```text
SELF-VERIFIED
```

### ⏱ Focus Session

Suitable for:

* Studying
* Coding
* Reading
* Meditation

The user starts a tracked session and completes the required duration.

Status:

```text
SESSION-VERIFIED
```

### 📸 Evidence Submission

Users can optionally submit contextual evidence.

Status:

```text
EVIDENCE SUBMITTED
```

The system does not claim that an uploaded screenshot is absolute proof.

Instead, verification is treated as a **confidence and accountability mechanism**.

---

# 🎯 Quest Completion Experience

Completing a quest is designed to feel like an RPG action rather than checking a checkbox.

```text
COMPLETE QUEST
      ↓
Quest Ritual
      ↓
Completion Animation
      ↓
+ XP
      ↓
+ GOLD
      ↓
+ ATTRIBUTE
      ↓
STREAK UPDATE
      ↓
LEVEL CHECK
      ↓
LEVEL UP
```

If the user reaches a new level, a dedicated **Level Up experience** is displayed.

---

# 🗺️ Journey

The Journey section records the user's progression over time.

Users can see:

* Completed quests
* XP earned
* Gold earned
* Attributes gained
* Achievements
* Major progression events

This turns productivity history into a personal RPG journey.

---

# 🎨 Design Philosophy

LifeQuest intentionally avoids the appearance of a generic productivity dashboard.

The visual language combines:

**Modern productivity UI + Premium RPG HUD**

### Design characteristics

* Dark interface
* Deep charcoal and espresso tones
* Warm beige and bronze accents
* Antique-gold highlights
* Layered cards
* Subtle textures
* Depth and shadows
* RPG-inspired terminology
* Purposeful animations
* Responsive layouts

The goal is to create an interface that feels like a **personal command center for real-life progression**.

---

# 📱 Responsive & Accessible

LifeQuest is designed for:

* 💻 Desktop
* 💻 Laptop
* 📱 Mobile
* 📲 Tablet

### Accessibility

The application aims to support:

* Keyboard navigation
* Tab navigation
* Enter / Space interactions
* Escape for dialogs
* Semantic HTML
* Accessible labels
* ARIA attributes where required
* Visible focus states
* Screen-reader-friendly structure
* Reduced-motion preferences
* Sufficient color contrast

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │       USER          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      FRONTEND       │
                    │     React + Vite    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      REST API       │
                    │   Node + Express    │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
       Authentication      RPG Engine        Task System
             │                 │                 │
             │          ┌──────┼──────┐          │
             │          │      │      │          │
             ▼          ▼      ▼      ▼          ▼
          Users        XP    Gold  Streak       CRUD
             │
             └─────────────────┬─────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │    PostgreSQL       │
                    │      Database       │
                    └─────────────────────┘
```

---

# 🗄️ Database Structure

Core entities include:

```text
Users
  │
  ├── Profile
  │
  ├── Attributes
  │
  ├── Tasks
  │      └── Task History
  │
  ├── Inventory
  │
  ├── Badges
  │
  └── Progression
```

### Core tables

```text
profiles
tasks
task_history
attributes
items
inventory
badges
user_badges
```

The database stores persistent progression rather than relying on browser-only storage.

---

# 🛠️ Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Lucide React
* Motion / animation libraries

## Backend

* Node.js
* Express
* REST APIs

## Database

* PostgreSQL
* Supabase

## Authentication

* Supabase Authentication

## Deployment

* Vercel — Frontend
* Render / equivalent — Backend
* Supabase — Database & Authentication

---

# 📂 Project Structure

```text
LifeQuest/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── LandingPage
│   │   ├── AuthModal
│   │   ├── DashboardView
│   │   ├── CharacterView
│   │   ├── RewardForgeView
│   │   ├── InventoryView
│   │   ├── StreakView
│   │   ├── JourneyView
│   │   ├── LevelUpOverlay
│   │   └── ...
│   │
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   └── ...
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   └── ...
│
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env.example
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Install:

* Node.js 18+
* npm
* Git

---

## Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/lifequest.git
```

```bash
cd lifequest
```

---

## Install dependencies

```bash
npm install
```

---

## Environment Variables

Create a `.env` file based on `.env.example`.

Example:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

DATABASE_URL=your_database_url
```

Never commit `.env` files or private credentials.

---

## Run the frontend

```bash
npm run dev
```

The application will be available locally at:

```text
http://localhost:3000
```

---

## Run the backend

From the backend directory:

```bash
npm install
npm run dev
```

---

# 🧪 Testing Checklist

Before deployment, verify:

### Authentication

* [ ] Signup works
* [ ] Login works
* [ ] Logout works
* [ ] Invalid credentials are handled
* [ ] Duplicate accounts are handled
* [ ] Sessions persist

### Security

* [ ] Users can only access their own data
* [ ] Protected routes work
* [ ] Backend authorization is enforced
* [ ] Secrets are not exposed

### Tasks

* [ ] Create task
* [ ] Read task
* [ ] Update task
* [ ] Delete task
* [ ] Complete task
* [ ] Duplicate completion prevented

### RPG

* [ ] XP awarded
* [ ] Gold awarded
* [ ] Attributes updated
* [ ] Level progression works
* [ ] Level-up animation works
* [ ] Streak updates correctly

### Rewards

* [ ] Reward shop loads
* [ ] Gold is deducted correctly
* [ ] Insufficient Gold is handled
* [ ] Purchased items enter inventory
* [ ] Items can be equipped

### UI

* [ ] Desktop responsive
* [ ] Tablet responsive
* [ ] Mobile responsive
* [ ] Keyboard navigation
* [ ] Focus states
* [ ] Screen-reader-friendly labels

---

# 🛡️ Important Design Principle

LifeQuest does not attempt to falsely guarantee that every real-world action occurred.

Instead, it focuses on:

```text
ACCOUNTABILITY
      +
CONSISTENCY
      +
PROGRESSION
      +
REWARD
```

The system makes real-life progress **visible, measurable and motivating** while keeping verification transparent.

---

# 🚧 Future Scope

Possible future improvements include:

* AI-powered quest recommendations
* Adaptive difficulty
* Calendar integration
* Wearable integrations
* Health/activity APIs
* GitHub activity integration
* Learning platform integrations
* Smarter achievement recommendations
* Personalized progression paths
* Social guilds
* Friends and cooperative quests
* Leaderboards
* Team challenges
* Advanced evidence analysis
* AI-generated personalized quests

---

# 🏆 Hackathon Vision

LifeQuest is more than a task manager.

It is a **gamified personal progression system** designed around one simple idea:

> **Your real life is the game.**

Every study session becomes XP.

Every workout becomes Strength.

Every coding problem becomes Intellect.

Every consistent day builds your Streak.

Every milestone unlocks a new reward.

And every completed quest moves your character — and yourself — forward.

---

## 👥 Team

Built for the **IIT Bhubaneswar 24-Hour Web Hackathon**.

### Team Members

D. Yasaswini

L.Sanajana Reddy

P. Charmitha

G. Hema Vardhan

---

## 📜 License

This project is developed for educational and hackathon purposes.

---

# ⭐ LifeQuest

### **Don't just complete tasks. Build your character.**
