import express, { Request, Response } from 'express';
import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db, calculateLevelFromTotalXP } from './server/db.js';
import { requireAuth, generateToken, AuthenticatedRequest } from './server/auth.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to format profile with computed level progress
function formatProfileResponse(profile: any) {
  const levelStats = calculateLevelFromTotalXP(profile.total_xp);
  return {
    ...profile,
    level: levelStats.level,
    current_level_xp: levelStats.currentLevelXP,
    next_level_xp: levelStats.xpForNextLevel,
    xp_for_next_level: levelStats.xpForNextLevel,
    progress_percentage: levelStats.progressPercentage
  };
}

// ==========================================
// 1. HEALTH CHECK
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    game: 'LifeQuest RPG Engine',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 2. AUTHENTICATION ROUTES
// ==========================================
app.post('/api/auth/signup', (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Validation Error', message: 'Adventurer email is required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Validation Error', message: 'Please provide a valid scroll address (email).' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Validation Error', message: 'Password must be at least 6 characters in length to safeguard your realm.' });
    }

    const cleanUsername = (username && typeof username === 'string' && username.trim().length > 0)
      ? username.trim()
      : email.split('@')[0];

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Conflict', message: 'An adventurer with this email is already registered. Please log in instead.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const { user, profile, attributes } = db.createUser(email, passwordHash, cleanUsername);
    const token = generateToken(user);

    return res.status(201).json({
      message: 'Character forged successfully!',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      profile: formatProfileResponse(profile),
      attributes
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Server Error', message: err.message || 'Could not forge account. Please try again.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Validation Error', message: 'Email and password are required to enter the gates.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials. No adventurer found matching this scroll.' });
    }

    const passwordValid = bcrypt.compareSync(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials. Password verification failed.' });
    }

    const profile = db.getProfileByUserId(user.id);
    const attributes = db.getAttributesByUserId(user.id);
    const token = generateToken(user);

    return res.json({
      message: 'Welcome back, Adventurer!',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      profile: profile ? formatProfileResponse(profile) : null,
      attributes
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server Error', message: 'Authentication failed. Please try again.' });
  }
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = db.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User record not found.' });
    }

    const profile = db.getProfileByUserId(userId);
    const attributes = db.getAttributesByUserId(userId);

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      profile: profile ? formatProfileResponse(profile) : null,
      attributes
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve character profile.' });
  }
});

// ==========================================
// 3. CHARACTER & ATTRIBUTES
// ==========================================
app.get('/api/character', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const profile = db.getProfileByUserId(userId);
  const attributes = db.getAttributesByUserId(userId);

  if (!profile) {
    return res.status(404).json({ error: 'Not Found', message: 'Character profile missing.' });
  }

  return res.json({
    profile: formatProfileResponse(profile),
    attributes
  });
});

app.put('/api/character', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { username, avatar, title, theme, frame } = req.body;

  const updates: any = {};
  if (username && typeof username === 'string' && username.trim().length > 0) updates.username = username.trim();
  if (avatar && typeof avatar === 'string') updates.avatar = avatar;
  if (title && typeof title === 'string') updates.title = title.toUpperCase();
  if (theme && typeof theme === 'string') updates.theme = theme;
  if (frame && typeof frame === 'string') updates.frame = frame;

  const updatedProfile = db.updateProfile(userId, updates);
  if (!updatedProfile) {
    return res.status(404).json({ error: 'Not Found', message: 'Profile not found.' });
  }

  return res.json({
    message: 'Character identity updated.',
    profile: formatProfileResponse(updatedProfile)
  });
});

app.get('/api/attributes', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const attributes = db.getAttributesByUserId(userId);
  return res.json(attributes);
});

// ==========================================
// 4. STREAK & CALENDAR
// ==========================================
app.get('/api/streak', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const profile = db.getProfileByUserId(userId);
  const history = db.getTaskHistoryByUserId(userId);

  if (!profile) {
    return res.status(404).json({ error: 'Not Found', message: 'Profile not found.' });
  }

  // Calculate activity in the last 7 days for the calendar view
  const days: { day: string; date: string; active: boolean }[] = [];
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = dayNames[d.getDay()];

    const hasCompletedTask = history.some(h => h.completed_at.startsWith(dateStr));
    const isTodayActive = profile.last_activity_date === dateStr;

    days.push({
      day: dayName,
      date: dateStr,
      active: hasCompletedTask || isTodayActive
    });
  }

  return res.json({
    current_streak: profile.current_streak,
    longest_streak: profile.longest_streak,
    last_activity_date: profile.last_activity_date,
    recent_days: days
  });
});

// ==========================================
// 5. TASK / QUEST CRUD
// ==========================================
app.get('/api/tasks', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const tasks = db.getTasksByUserId(userId);
  return res.json(tasks);
});

app.post('/api/tasks', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, description, category, attribute, difficulty, verification_type, target_duration_minutes } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Validation Error', message: 'Quest name is required to forge a quest.' });
    }

    const validCategories = ['Coding', 'Study', 'Fitness', 'Reading', 'Health', 'Personal', 'Creativity', 'Other'];
    const validAttributes = ['Strength', 'Intellect', 'Vitality', 'Mind'];
    const validDifficulties = ['Easy', 'Normal', 'Hard', 'Epic'];
    const validVerifications = ['self_report', 'focus_session', 'evidence_submission'];

    const chosenCategory = validCategories.includes(category) ? category : 'Other';
    const chosenAttribute = validAttributes.includes(attribute) ? attribute : 'Intellect';
    const chosenDifficulty = validDifficulties.includes(difficulty) ? difficulty : 'Normal';
    const chosenVerification = validVerifications.includes(verification_type) ? verification_type : 'self_report';

    const newTask = db.createTask(userId, {
      title: title.trim(),
      description: description?.trim() || '',
      category: chosenCategory,
      attribute: chosenAttribute as any,
      difficulty: chosenDifficulty as any,
      verification_type: chosenVerification as any,
      target_duration_minutes: Number(target_duration_minutes) || 0
    });

    return res.status(201).json({
      message: 'Quest forged and added to your quest log!',
      task: newTask
    });
  } catch (err: any) {
    console.error('Create quest error:', err);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to forge quest.' });
  }
});

app.get('/api/tasks/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const taskId = req.params.id;
  const task = db.getTaskById(taskId, userId);

  if (!task) {
    return res.status(404).json({ error: 'Not Found', message: 'Quest not found or does not belong to your realm.' });
  }

  return res.json(task);
});

app.put('/api/tasks/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const taskId = req.params.id;

  const existing = db.getTaskById(taskId, userId);
  if (!existing) {
    return res.status(404).json({ error: 'Not Found', message: 'Quest not found.' });
  }
  if (existing.completed) {
    return res.status(400).json({ error: 'Bad Request', message: 'Completed quests cannot be modified.' });
  }

  const { title, description, category, attribute, difficulty, verification_type, target_duration_minutes } = req.body;
  const updates: any = {};

  if (title && typeof title === 'string') updates.title = title.trim();
  if (description !== undefined) updates.description = String(description).trim();
  if (category) updates.category = category;
  if (attribute) updates.attribute = attribute;
  if (difficulty) updates.difficulty = difficulty;
  if (verification_type) updates.verification_type = verification_type;
  if (target_duration_minutes !== undefined) updates.target_duration_minutes = Number(target_duration_minutes);

  const updated = db.updateTask(taskId, userId, updates);
  return res.json({
    message: 'Quest details updated.',
    task: updated
  });
});

app.delete('/api/tasks/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const taskId = req.params.id;

  const deleted = db.deleteTask(taskId, userId);
  if (!deleted) {
    return res.status(404).json({ error: 'Not Found', message: 'Quest not found or could not be removed.' });
  }

  return res.json({ message: 'Quest banished from your quest log.' });
});

// ==========================================
// 6. AUTHORITATIVE QUEST COMPLETION
// ==========================================
app.post('/api/tasks/:id/complete', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const taskId = req.params.id;
    const { evidence_notes, verified_status } = req.body;

    const result = db.completeQuest(taskId, userId, { evidence_notes, verified_status });

    return res.json({
      ...result,
      profile: formatProfileResponse(result.profile)
    });
  } catch (err: any) {
    console.error('Complete quest error:', err);
    return res.status(400).json({
      error: 'Quest Completion Failed',
      message: err.message || 'Quest completion could not be saved. Your rewards were not granted.'
    });
  }
});

// ==========================================
// 7. JOURNEY / TASK HISTORY
// ==========================================
app.get('/api/journey', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const history = db.getTaskHistoryByUserId(userId);
  return res.json(history);
});

// ==========================================
// 8. REWARD FORGE (SHOP)
// ==========================================
app.get('/api/rewards', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const allItems = db.getItems();
  const userInventory = db.getInventoryByUserId(userId);

  const itemsWithOwnership = allItems.map(item => {
    const ownedEntry = userInventory.find(inv => inv.item_id === item.id);
    return {
      ...item,
      owned: !!ownedEntry,
      equipped: ownedEntry?.equipped || false,
      inventory_id: ownedEntry?.id || null
    };
  });

  return res.json(itemsWithOwnership);
});

app.post('/api/rewards/:id/purchase', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const itemId = req.params.id;

    const result = db.purchaseItem(userId, itemId);

    return res.json({
      message: `Artifact acquired: ${result.item.name}!`,
      item: result.item,
      profile: formatProfileResponse(result.profile),
      inventoryItem: result.inventoryItem
    });
  } catch (err: any) {
    return res.status(400).json({
      error: 'Purchase Failed',
      message: err.message || 'Artifact could not be acquired.'
    });
  }
});

// ==========================================
// 9. INVENTORY & COSMETICS
// ==========================================
app.get('/api/inventory', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const inventory = db.getInventoryByUserId(userId);
  return res.json(inventory);
});

app.post('/api/inventory/:id/equip', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const inventoryId = req.params.id;

    const result = db.equipItem(userId, inventoryId);

    return res.json({
      message: `${result.equippedItem.name} equipped.`,
      equippedItem: result.equippedItem,
      profile: formatProfileResponse(result.profile)
    });
  } catch (err: any) {
    return res.status(400).json({
      error: 'Equip Failed',
      message: err.message || 'Could not equip item.'
    });
  }
});

// ==========================================
// 10. ACHIEVEMENTS / BADGES
// ==========================================
app.get('/api/achievements', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const allBadges = db.getBadges();
  const userBadges = db.getUserBadges(userId);

  const achievements = allBadges.map(badge => {
    const userBadge = userBadges.find(ub => ub.badge_id === badge.id);
    return {
      ...badge,
      unlocked: !!userBadge,
      earned_at: userBadge?.earned_at || null
    };
  });

  return res.json(achievements);
});

// ==========================================
// 11. FOCUS SESSION TRACKING
// ==========================================
app.post('/api/sessions/start', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { taskId, durationMinutes } = req.body;
  return res.json({
    session_id: `sess-${Date.now()}`,
    taskId,
    durationMinutes: durationMinutes || 25,
    started_at: new Date().toISOString(),
    status: 'active'
  });
});

app.post('/api/sessions/:id/complete', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { taskId } = req.body;
  const userId = req.user!.id;

  if (!taskId) {
    return res.status(400).json({ error: 'Validation Error', message: 'TaskId is required to complete focus session.' });
  }

  try {
    const result = db.completeQuest(taskId, userId, {
      verified_status: 'session_verified'
    });

    return res.json({
      message: 'Focus session completed and quest verified!',
      ...result,
      profile: formatProfileResponse(result.profile)
    });
  } catch (err: any) {
    return res.status(400).json({ error: 'Session Complete Failed', message: err.message });
  }
});

// ==========================================
// VITE MIDDLEWARE & SPA SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LifeQuest Engine] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
