import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  username: string;
  created_at: string;
}

export interface ProfileRecord {
  id: string;
  user_id: string;
  username: string;
  email: string;
  level: number;
  total_xp: number;
  gold: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  avatar: string;
  title: string;
  theme: string;
  frame: string;
  created_at: string;
  updated_at: string;
}

export interface AttributeRecord {
  id: string;
  user_id: string;
  strength: number;
  intellect: number;
  vitality: number;
  mind: number;
  updated_at: string;
}

export interface TaskRecord {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  attribute: 'Strength' | 'Intellect' | 'Vitality' | 'Mind';
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Epic';
  xp_reward: number;
  gold_reward: number;
  attribute_points: number;
  verification_type: 'self_report' | 'focus_session' | 'evidence_submission';
  verification_status: 'self_verified' | 'session_verified' | 'evidence_submitted' | 'pending';
  evidence_notes?: string;
  target_duration_minutes?: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface TaskHistoryRecord {
  id: string;
  user_id: string;
  task_id: string;
  task_title: string;
  category: string;
  xp_earned: number;
  gold_earned: number;
  attribute: 'Strength' | 'Intellect' | 'Vitality' | 'Mind';
  attribute_points: number;
  verification_status: string;
  completed_at: string;
}

export interface ItemRecord {
  id: string;
  name: string;
  description: string;
  type: 'avatar' | 'frame' | 'badge' | 'theme' | 'title' | 'artifact';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  icon: string;
  effect: string;
  created_at: string;
}

export interface InventoryRecord {
  id: string;
  user_id: string;
  item_id: string;
  equipped: boolean;
  purchased_at: string;
}

export interface BadgeRecord {
  id: string;
  code: string;
  name: string;
  description: string;
  requirement: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
}

export interface UserBadgeRecord {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  profiles: ProfileRecord[];
  attributes: AttributeRecord[];
  tasks: TaskRecord[];
  task_history: TaskHistoryRecord[];
  items: ItemRecord[];
  inventory: InventoryRecord[];
  badges: BadgeRecord[];
  user_badges: UserBadgeRecord[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'lifequest.json');

// Helper to calculate XP needed for next level: 100 * level^1.5
export function getXPForNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

// Calculate cumulative XP required to reach a specific level
export function getCumulativeXPForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) {
    total += getXPForNextLevel(l);
  }
  return total;
}

// Derive level from total XP
export function calculateLevelFromTotalXP(totalXP: number): {
  level: number;
  currentLevelXP: number;
  xpForNextLevel: number;
  progressPercentage: number;
} {
  let level = 1;
  let accumulatedXP = 0;

  while (true) {
    const needed = getXPForNextLevel(level);
    if (totalXP < accumulatedXP + needed) {
      const currentLevelXP = totalXP - accumulatedXP;
      const progressPercentage = Math.min(100, Math.max(0, Math.round((currentLevelXP / needed) * 100)));
      return {
        level,
        currentLevelXP,
        xpForNextLevel: needed,
        progressPercentage
      };
    }
    accumulatedXP += needed;
    level++;
  }
}

// Calculate automatic rewards based on difficulty
export function calculateRewards(difficulty: 'Easy' | 'Normal' | 'Hard' | 'Epic') {
  switch (difficulty) {
    case 'Easy':
      return { xp: 20, gold: 10, attributePoints: 1 };
    case 'Normal':
      return { xp: 40, gold: 20, attributePoints: 2 };
    case 'Hard':
      return { xp: 75, gold: 40, attributePoints: 3 };
    case 'Epic':
      return { xp: 150, gold: 100, attributePoints: 5 };
    default:
      return { xp: 30, gold: 15, attributePoints: 1 };
  }
}

const INITIAL_ITEMS: ItemRecord[] = [
  {
    id: 'item-dragon-emblem',
    name: 'Dragon Emblem',
    description: 'Ancient sigil granting steadfast discipline in your daily endeavors.',
    type: 'artifact',
    rarity: 'rare',
    price: 500,
    icon: 'Shield',
    effect: '+5% XP bonus when completing physical or focus quests',
    created_at: new Date().toISOString()
  },
  {
    id: 'item-cosmic-aura',
    name: 'Cosmic Aura',
    description: 'Celestial boundary framing your avatar in shimmering starlight.',
    type: 'frame',
    rarity: 'epic',
    price: 750,
    icon: 'Sparkles',
    effect: 'Emits a subtle cosmic pulse across your character card',
    created_at: new Date().toISOString()
  },
  {
    id: 'item-scholar-badge',
    name: 'Scholar Badge',
    description: 'Mark of the relentless knowledge seeker and academic craftsman.',
    type: 'badge',
    rarity: 'epic',
    price: 1000,
    icon: 'BookOpen',
    effect: 'Adds a glowing tome seal to your dashboard',
    created_at: new Date().toISOString()
  },
  {
    id: 'item-legendary-title',
    name: 'Legendary Title',
    description: 'Unlocks the prestigious "Archmage of Will" cosmetic title.',
    type: 'title',
    rarity: 'legendary',
    price: 2000,
    icon: 'Crown',
    effect: 'Display title: "Archmage of Will" on your profile and HUD',
    created_at: new Date().toISOString()
  },
  {
    id: 'item-phoenix-crest',
    name: 'Phoenix Crest',
    description: 'Symbol of daily renewal and persistent rebirth after obstacles.',
    type: 'avatar',
    rarity: 'rare',
    price: 400,
    icon: 'Flame',
    effect: 'Custom fiery phoenix avatar portrait',
    created_at: new Date().toISOString()
  },
  {
    id: 'item-obsidian-frame',
    name: 'Obsidian Frame',
    description: 'Chiseled dark volcanic glass border with sharp bronze rivets.',
    type: 'frame',
    rarity: 'rare',
    price: 600,
    icon: 'Square',
    effect: 'Rugged dark volcanic border for your portrait',
    created_at: new Date().toISOString()
  },
  {
    id: 'item-ironclad-helm',
    name: 'Ironclad Helm',
    description: 'Forged for resolute adventurers braving foundational habits.',
    type: 'avatar',
    rarity: 'common',
    price: 250,
    icon: 'Compass',
    effect: 'Knightly iron helmet portrait',
    created_at: new Date().toISOString()
  },
  {
    id: 'item-emerald-cloak',
    name: 'Emerald Cloak',
    description: 'Restores mental stamina during grueling multi-task sprints.',
    type: 'artifact',
    rarity: 'common',
    price: 350,
    icon: 'Feather',
    effect: 'Reduces perceived fatigue during deep study rituals',
    created_at: new Date().toISOString()
  }
];

const INITIAL_BADGES: BadgeRecord[] = [
  {
    id: 'badge-first-quest',
    code: 'FIRST_QUEST',
    name: 'First Quest',
    description: 'Complete your first quest in LifeQuest.',
    requirement: 'Complete 1 quest',
    rarity: 'common',
    icon: 'CheckCircle2'
  },
  {
    id: 'badge-week-warrior',
    code: 'WEEK_WARRIOR',
    name: 'Week Warrior',
    description: 'Maintain an uninterrupted 7-day quest streak.',
    requirement: '7-day streak',
    rarity: 'rare',
    icon: 'Flame'
  },
  {
    id: 'badge-level-ten',
    code: 'LEVEL_TEN',
    name: 'Level Ten',
    description: 'Attain Level 10 through relentless discipline.',
    requirement: 'Reach Level 10',
    rarity: 'epic',
    icon: 'Trophy'
  },
  {
    id: 'badge-centurion',
    code: 'CENTURION',
    name: 'Centurion',
    description: 'Forge and complete 100 real-world quests.',
    requirement: 'Complete 100 quests',
    rarity: 'legendary',
    icon: 'Award'
  },
  {
    id: 'badge-quest-master',
    code: 'QUEST_MASTER',
    name: 'Quest Master',
    description: 'Complete 250 quests across all realms of life.',
    requirement: 'Complete 250 quests',
    rarity: 'legendary',
    icon: 'Crown'
  },
  {
    id: 'badge-intellect-master',
    code: 'INTELLECT_MASTER',
    name: 'Grand Sage',
    description: 'Reach 50 Intellect through deep learning and study.',
    requirement: '50 Intellect',
    rarity: 'rare',
    icon: 'Brain'
  },
  {
    id: 'badge-strength-champion',
    code: 'STRENGTH_CHAMPION',
    name: 'Titan of Will',
    description: 'Reach 50 Strength through physical training and grit.',
    requirement: '50 Strength',
    rarity: 'rare',
    icon: 'Dumbbell'
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = {
      users: [],
      profiles: [],
      attributes: [],
      tasks: [],
      task_history: [],
      items: [],
      inventory: [],
      badges: [],
      user_badges: []
    };
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.seedInitial();
        this.save();
      }

      // Ensure catalog items and badges are always fully populated
      this.ensureCatalogItemsAndBadges();
      this.ensureDemoUser();
      this.save();
    } catch (err) {
      console.error('Failed to initialize database file:', err);
      this.seedInitial();
      this.save();
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  private ensureCatalogItemsAndBadges() {
    for (const item of INITIAL_ITEMS) {
      if (!this.data.items.some(i => i.id === item.id)) {
        this.data.items.push(item);
      }
    }
    for (const badge of INITIAL_BADGES) {
      if (!this.data.badges.some(b => b.id === badge.id || b.code === badge.code)) {
        this.data.badges.push(badge);
      }
    }
  }

  private seedInitial() {
    this.data = {
      users: [],
      profiles: [],
      attributes: [],
      tasks: [],
      task_history: [],
      items: [...INITIAL_ITEMS],
      inventory: [],
      badges: [...INITIAL_BADGES],
      user_badges: []
    };
  }

  private ensureDemoUser() {
    const demoEmail = 'demo@lifequest.rpg';
    let demoUser = this.data.users.find(u => u.email === demoEmail);

    if (!demoUser) {
      const demoUserId = 'user-demo-seeker';
      const salt = bcrypt.genSaltSync(10);
      const password_hash = bcrypt.hashSync('demo123', salt);

      demoUser = {
        id: demoUserId,
        email: demoEmail,
        password_hash,
        username: 'Aiden the Seeker',
        created_at: new Date(Date.now() - 14 * 86400000).toISOString()
      };
      this.data.users.push(demoUser);

      // Level 7, 740/1000 XP (Total XP: Level 1-6 cumulative + 740 = 2819 + 740 = 3559 XP), 1240 Gold, 12-day streak
      const level6Cumulative = getCumulativeXPForLevel(7);
      const demoTotalXP = level6Cumulative + 740;

      const demoProfile: ProfileRecord = {
        id: 'profile-demo-seeker',
        user_id: demoUserId,
        username: 'Aiden the Seeker',
        email: demoEmail,
        level: 7,
        total_xp: demoTotalXP,
        gold: 1240,
        current_streak: 12,
        longest_streak: 12,
        last_activity_date: new Date().toISOString().split('T')[0],
        avatar: 'Shield',
        title: 'THE SEEKER',
        theme: 'dark-leather',
        frame: 'Cosmic Aura',
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      };
      this.data.profiles.push(demoProfile);

      // Attributes: Strength 42, Intellect 68, Vitality 51, Mind 39
      const demoAttributes: AttributeRecord = {
        id: 'attr-demo-seeker',
        user_id: demoUserId,
        strength: 42,
        intellect: 68,
        vitality: 51,
        mind: 39,
        updated_at: new Date().toISOString()
      };
      this.data.attributes.push(demoAttributes);

      // Pre-seeded Quests for demo
      const demoQuests: TaskRecord[] = [
        {
          id: 'task-demo-1',
          user_id: demoUserId,
          title: 'Complete 2 DSA Problems',
          description: 'Solve dynamic programming or graph traversal problems on LeetCode with full complexity analysis.',
          category: 'Coding',
          attribute: 'Intellect',
          difficulty: 'Hard',
          xp_reward: 75,
          gold_reward: 40,
          attribute_points: 3,
          verification_type: 'focus_session',
          verification_status: 'pending',
          target_duration_minutes: 45,
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed_at: null
        },
        {
          id: 'task-demo-2',
          user_id: demoUserId,
          title: 'Study Computer Networks',
          description: 'Master TCP/IP handshake, flow control, congestion windows, and DNS resolution paths.',
          category: 'Study',
          attribute: 'Intellect',
          difficulty: 'Normal',
          xp_reward: 40,
          gold_reward: 20,
          attribute_points: 2,
          verification_type: 'self_report',
          verification_status: 'pending',
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed_at: null
        },
        {
          id: 'task-demo-3',
          user_id: demoUserId,
          title: '30 Minute Workout',
          description: 'High intensity calisthenics, push-ups, squats, and core intervals to hone physical resilience.',
          category: 'Fitness',
          attribute: 'Strength',
          difficulty: 'Normal',
          xp_reward: 40,
          gold_reward: 20,
          attribute_points: 2,
          verification_type: 'focus_session',
          verification_status: 'pending',
          target_duration_minutes: 30,
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed_at: null
        },
        {
          id: 'task-demo-4',
          user_id: demoUserId,
          title: 'Read 10 Pages of Systems Architecture',
          description: 'Absorb distributed consensus models and fault tolerance principles.',
          category: 'Reading',
          attribute: 'Mind',
          difficulty: 'Easy',
          xp_reward: 20,
          gold_reward: 10,
          attribute_points: 1,
          verification_type: 'evidence_submission',
          verification_status: 'pending',
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed_at: null
        }
      ];
      this.data.tasks.push(...demoQuests);

      // Pre-seeded Demo inventory (Dragon Emblem, Cosmic Aura)
      this.data.inventory.push(
        {
          id: 'inv-demo-1',
          user_id: demoUserId,
          item_id: 'item-dragon-emblem',
          equipped: true,
          purchased_at: new Date(Date.now() - 5 * 86400000).toISOString()
        },
        {
          id: 'inv-demo-2',
          user_id: demoUserId,
          item_id: 'item-cosmic-aura',
          equipped: true,
          purchased_at: new Date(Date.now() - 2 * 86400000).toISOString()
        }
      );

      // Pre-seeded Demo badges
      this.data.user_badges.push(
        {
          id: 'ub-demo-1',
          user_id: demoUserId,
          badge_id: 'badge-first-quest',
          earned_at: new Date(Date.now() - 14 * 86400000).toISOString()
        },
        {
          id: 'ub-demo-2',
          user_id: demoUserId,
          badge_id: 'badge-week-warrior',
          earned_at: new Date(Date.now() - 7 * 86400000).toISOString()
        },
        {
          id: 'ub-demo-3',
          user_id: demoUserId,
          badge_id: 'badge-intellect-master',
          earned_at: new Date(Date.now() - 2 * 86400000).toISOString()
        }
      );

      // Pre-seeded task history
      this.data.task_history.push(
        {
          id: 'hist-demo-1',
          user_id: demoUserId,
          task_id: 'task-hist-01',
          task_title: 'Implement Binary Search Tree in TypeScript',
          category: 'Coding',
          xp_earned: 75,
          gold_earned: 40,
          attribute: 'Intellect',
          attribute_points: 3,
          verification_status: 'session_verified',
          completed_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'hist-demo-2',
          user_id: demoUserId,
          task_id: 'task-hist-02',
          task_title: '5km Morning Road Run',
          category: 'Fitness',
          xp_earned: 75,
          gold_earned: 40,
          attribute: 'Strength',
          attribute_points: 3,
          verification_status: 'self_verified',
          completed_at: new Date(Date.now() - 2 * 86400000).toISOString()
        }
      );
    }
  }

  // --- Users & Auth ---
  public findUserByEmail(email: string): UserRecord | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): UserRecord | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(email: string, passwordHash: string, username: string): {
    user: UserRecord;
    profile: ProfileRecord;
    attributes: AttributeRecord;
  } {
    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const user: UserRecord = {
      id: userId,
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      username: username.trim(),
      created_at: now
    };
    this.data.users.push(user);

    // Initial character: Level 1, XP 0, Gold 100
    const profile: ProfileRecord = {
      id: `profile-${userId}`,
      user_id: userId,
      username: username.trim(),
      email: email.toLowerCase().trim(),
      level: 1,
      total_xp: 0,
      gold: 100,
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: null,
      avatar: 'Compass',
      title: 'THE NOVICE',
      theme: 'dark-leather',
      frame: 'Standard',
      created_at: now,
      updated_at: now
    };
    this.data.profiles.push(profile);

    // Initial attributes: Strength 10, Intellect 10, Vitality 10, Mind 10
    const attributes: AttributeRecord = {
      id: `attr-${userId}`,
      user_id: userId,
      strength: 10,
      intellect: 10,
      vitality: 10,
      mind: 10,
      updated_at: now
    };
    this.data.attributes.push(attributes);

    // Default starter quests to get going immediately
    const starterQuests: TaskRecord[] = [
      {
        id: `task-${Date.now()}-1`,
        user_id: userId,
        title: 'Drink 500ml Water & Stretch',
        description: 'Awaken your physical vessel with hydration and spinal mobility.',
        category: 'Health',
        attribute: 'Vitality',
        difficulty: 'Easy',
        xp_reward: 20,
        gold_reward: 10,
        attribute_points: 1,
        verification_type: 'self_report',
        verification_status: 'pending',
        completed: false,
        created_at: now,
        updated_at: now,
        completed_at: null
      },
      {
        id: `task-${Date.now()}-2`,
        user_id: userId,
        title: '25-Minute Deep Focus Session',
        description: 'Undivided focus on your primary study topic or coding assignment.',
        category: 'Study',
        attribute: 'Intellect',
        difficulty: 'Normal',
        xp_reward: 40,
        gold_reward: 20,
        attribute_points: 2,
        verification_type: 'focus_session',
        verification_status: 'pending',
        target_duration_minutes: 25,
        completed: false,
        created_at: now,
        updated_at: now,
        completed_at: null
      },
      {
        id: `task-${Date.now()}-3`,
        user_id: userId,
        title: '10 Minutes Mindful Meditation',
        description: 'Observe breath and release cognitive tension.',
        category: 'Personal',
        attribute: 'Mind',
        difficulty: 'Easy',
        xp_reward: 20,
        gold_reward: 10,
        attribute_points: 1,
        verification_type: 'focus_session',
        verification_status: 'pending',
        target_duration_minutes: 10,
        completed: false,
        created_at: now,
        updated_at: now,
        completed_at: null
      }
    ];
    this.data.tasks.push(...starterQuests);

    this.save();
    return { user, profile, attributes };
  }

  // --- Profile & Attributes ---
  public getProfileByUserId(userId: string): ProfileRecord | undefined {
    return this.data.profiles.find(p => p.user_id === userId);
  }

  public updateProfile(userId: string, updates: Partial<ProfileRecord>): ProfileRecord | undefined {
    const profile = this.data.profiles.find(p => p.user_id === userId);
    if (!profile) return undefined;
    Object.assign(profile, updates, { updated_at: new Date().toISOString() });
    this.save();
    return profile;
  }

  public getAttributesByUserId(userId: string): AttributeRecord {
    let attr = this.data.attributes.find(a => a.user_id === userId);
    if (!attr) {
      attr = {
        id: `attr-${userId}`,
        user_id: userId,
        strength: 10,
        intellect: 10,
        vitality: 10,
        mind: 10,
        updated_at: new Date().toISOString()
      };
      this.data.attributes.push(attr);
      this.save();
    }
    return attr;
  }

  public updateAttributes(userId: string, updates: Partial<AttributeRecord>): AttributeRecord {
    const attr = this.getAttributesByUserId(userId);
    Object.assign(attr, updates, { updated_at: new Date().toISOString() });
    this.save();
    return attr;
  }

  // --- Tasks (Quests) CRUD ---
  public getTasksByUserId(userId: string): TaskRecord[] {
    return this.data.tasks.filter(t => t.user_id === userId);
  }

  public getTaskById(taskId: string, userId: string): TaskRecord | undefined {
    return this.data.tasks.find(t => t.id === taskId && t.user_id === userId);
  }

  public createTask(userId: string, input: {
    title: string;
    description: string;
    category: string;
    attribute: 'Strength' | 'Intellect' | 'Vitality' | 'Mind';
    difficulty: 'Easy' | 'Normal' | 'Hard' | 'Epic';
    verification_type: 'self_report' | 'focus_session' | 'evidence_submission';
    target_duration_minutes?: number;
  }): TaskRecord {
    const rewards = calculateRewards(input.difficulty);
    const now = new Date().toISOString();

    const task: TaskRecord = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      attribute: input.attribute,
      difficulty: input.difficulty,
      xp_reward: rewards.xp,
      gold_reward: rewards.gold,
      attribute_points: rewards.attributePoints,
      verification_type: input.verification_type,
      verification_status: 'pending',
      target_duration_minutes: input.target_duration_minutes || 0,
      completed: false,
      created_at: now,
      updated_at: now,
      completed_at: null
    };

    this.data.tasks.unshift(task);
    this.save();
    return task;
  }

  public updateTask(taskId: string, userId: string, updates: Partial<TaskRecord>): TaskRecord | undefined {
    const task = this.getTaskById(taskId, userId);
    if (!task) return undefined;

    // Recalculate rewards if difficulty changed
    if (updates.difficulty && updates.difficulty !== task.difficulty) {
      const rewards = calculateRewards(updates.difficulty);
      updates.xp_reward = rewards.xp;
      updates.gold_reward = rewards.gold;
      updates.attribute_points = rewards.attributePoints;
    }

    Object.assign(task, updates, { updated_at: new Date().toISOString() });
    this.save();
    return task;
  }

  public deleteTask(taskId: string, userId: string): boolean {
    const initialLen = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter(t => !(t.id === taskId && t.user_id === userId));
    const deleted = this.data.tasks.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  // --- Authoritative Quest Completion Engine ---
  public completeQuest(taskId: string, userId: string, verificationData?: {
    evidence_notes?: string;
    verified_status?: 'self_verified' | 'session_verified' | 'evidence_submitted';
  }): {
    success: boolean;
    xpGained: number;
    goldGained: number;
    attributeGained: number;
    attributeName: 'Strength' | 'Intellect' | 'Vitality' | 'Mind';
    currentXP: number;
    level: number;
    levelUp: boolean;
    previousLevel: number;
    currentStreak: number;
    newBadges: BadgeRecord[];
    task: TaskRecord;
    attributes: AttributeRecord;
    profile: ProfileRecord;
  } {
    const task = this.getTaskById(taskId, userId);
    if (!task) {
      throw new Error('Quest not found or does not belong to you');
    }
    if (task.completed) {
      throw new Error('This quest has already been completed');
    }

    const profile = this.getProfileByUserId(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    const attributes = this.getAttributesByUserId(userId);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // 1. Mark task as completed
    const vStatus = verificationData?.verified_status || 
      (task.verification_type === 'focus_session' ? 'session_verified' :
       task.verification_type === 'evidence_submission' ? 'evidence_submitted' : 'self_verified');

    task.completed = true;
    task.verification_status = vStatus;
    if (verificationData?.evidence_notes) {
      task.evidence_notes = verificationData.evidence_notes;
    }
    task.completed_at = now.toISOString();
    task.updated_at = now.toISOString();

    // 2. Rewards calculation (backend authoritative)
    const xpGained = task.xp_reward;
    const goldGained = task.gold_reward;
    const attrGained = task.attribute_points;
    const attrName = task.attribute;

    // 3. Update character attributes
    switch (attrName) {
      case 'Strength':
        attributes.strength += attrGained;
        break;
      case 'Intellect':
        attributes.intellect += attrGained;
        break;
      case 'Vitality':
        attributes.vitality += attrGained;
        break;
      case 'Mind':
        attributes.mind += attrGained;
        break;
    }
    attributes.updated_at = now.toISOString();

    // 4. Update XP and check Level progression
    const previousLevel = profile.level;
    const previousTotalXP = profile.total_xp;
    const newTotalXP = previousTotalXP + xpGained;

    const levelStats = calculateLevelFromTotalXP(newTotalXP);
    const levelUp = levelStats.level > previousLevel;

    // 5. Update Gold
    profile.gold += goldGained;
    profile.total_xp = newTotalXP;
    profile.level = levelStats.level;

    // Level-up rewards if level increased
    if (levelUp) {
      const levelDiff = levelStats.level - previousLevel;
      // Bonus 50 gold per level attained
      profile.gold += levelDiff * 50;
      // Attribute point boost
      attributes.strength += levelDiff;
      attributes.intellect += levelDiff;
      attributes.vitality += levelDiff;
      attributes.mind += levelDiff;
    }

    // 6. Update Streak
    const lastDateStr = profile.last_activity_date;
    if (!lastDateStr) {
      profile.current_streak = 1;
      profile.longest_streak = Math.max(profile.longest_streak, 1);
    } else if (lastDateStr === todayStr) {
      // Activity already counted today, streak remains unchanged
    } else {
      const lastDate = new Date(lastDateStr);
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDateStr === yesterdayStr) {
        profile.current_streak += 1;
        if (profile.current_streak > profile.longest_streak) {
          profile.longest_streak = profile.current_streak;
        }
      } else {
        // Gap of more than 1 day
        profile.current_streak = 1;
      }
    }
    profile.last_activity_date = todayStr;
    profile.updated_at = now.toISOString();

    // 7. Record Task History
    const historyItem: TaskHistoryRecord = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      task_id: task.id,
      task_title: task.title,
      category: task.category,
      xp_earned: xpGained,
      gold_earned: goldGained,
      attribute: attrName,
      attribute_points: attrGained,
      verification_status: vStatus,
      completed_at: now.toISOString()
    };
    this.data.task_history.unshift(historyItem);

    // 8. Check and grant Badges / Achievements
    const newBadges: BadgeRecord[] = [];
    const totalCompletedQuests = this.data.task_history.filter(h => h.user_id === userId).length;

    const grantBadge = (badgeCode: string) => {
      const badgeDef = this.data.badges.find(b => b.code === badgeCode);
      if (!badgeDef) return;
      const alreadyHas = this.data.user_badges.some(ub => ub.user_id === userId && ub.badge_id === badgeDef.id);
      if (!alreadyHas) {
        this.data.user_badges.push({
          id: `ub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          user_id: userId,
          badge_id: badgeDef.id,
          earned_at: now.toISOString()
        });
        newBadges.push(badgeDef);
      }
    };

    // First quest
    if (totalCompletedQuests >= 1) grantBadge('FIRST_QUEST');
    // Week warrior
    if (profile.current_streak >= 7) grantBadge('WEEK_WARRIOR');
    // Centurion
    if (totalCompletedQuests >= 100) grantBadge('CENTURION');
    // Level 10
    if (profile.level >= 10) grantBadge('LEVEL_TEN');
    // Quest Master
    if (totalCompletedQuests >= 250) grantBadge('QUEST_MASTER');
    // Attribute badges
    if (attributes.intellect >= 50) grantBadge('INTELLECT_MASTER');
    if (attributes.strength >= 50) grantBadge('STRENGTH_CHAMPION');

    this.save();

    return {
      success: true,
      xpGained,
      goldGained,
      attributeGained: attrGained,
      attributeName: attrName,
      currentXP: profile.total_xp,
      level: profile.level,
      levelUp,
      previousLevel,
      currentStreak: profile.current_streak,
      newBadges,
      task,
      attributes,
      profile
    };
  }

  // --- Task History (Journey) ---
  public getTaskHistoryByUserId(userId: string): TaskHistoryRecord[] {
    return this.data.task_history.filter(h => h.user_id === userId);
  }

  // --- Reward Forge & Inventory ---
  public getItems(): ItemRecord[] {
    return this.data.items;
  }

  public getItemById(itemId: string): ItemRecord | undefined {
    return this.data.items.find(i => i.id === itemId);
  }

  public getInventoryByUserId(userId: string): (InventoryRecord & { item?: ItemRecord })[] {
    const userInventory = this.data.inventory.filter(inv => inv.user_id === userId);
    return userInventory.map(inv => ({
      ...inv,
      item: this.data.items.find(i => i.id === inv.item_id)
    }));
  }

  public purchaseItem(userId: string, itemId: string): {
    success: boolean;
    item: ItemRecord;
    profile: ProfileRecord;
    inventoryItem: InventoryRecord;
  } {
    const item = this.getItemById(itemId);
    if (!item) {
      throw new Error('Item does not exist in Reward Forge');
    }

    const profile = this.getProfileByUserId(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    // Check if user already owns non-stackable item
    const alreadyOwns = this.data.inventory.some(inv => inv.user_id === userId && inv.item_id === itemId);
    if (alreadyOwns) {
      throw new Error('You already possess this artifact in your inventory');
    }

    // Check Gold
    if (profile.gold < item.price) {
      throw new Error(`Not enough Gold to acquire this artifact. Needed: ${item.price} Gold, Available: ${profile.gold} Gold.`);
    }

    // Deduct Gold and add to inventory
    profile.gold -= item.price;
    profile.updated_at = new Date().toISOString();

    const inventoryItem: InventoryRecord = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      item_id: itemId,
      equipped: false,
      purchased_at: new Date().toISOString()
    };
    this.data.inventory.push(inventoryItem);

    this.save();

    return {
      success: true,
      item,
      profile,
      inventoryItem
    };
  }

  public equipItem(userId: string, inventoryId: string): {
    success: boolean;
    equippedItem: ItemRecord;
    profile: ProfileRecord;
  } {
    const inv = this.data.inventory.find(i => i.id === inventoryId && i.user_id === userId);
    if (!inv) {
      throw new Error('Inventory item not found');
    }

    const item = this.getItemById(inv.item_id);
    if (!item) {
      throw new Error('Item data not found');
    }

    const profile = this.getProfileByUserId(userId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Unequip any item of the same type
    const sameTypeInventory = this.data.inventory.filter(i => {
      if (i.user_id !== userId) return false;
      const otherItem = this.getItemById(i.item_id);
      return otherItem && otherItem.type === item.type;
    });

    for (const other of sameTypeInventory) {
      other.equipped = false;
    }

    inv.equipped = true;

    // Apply cosmetic effect to profile
    if (item.type === 'avatar') {
      profile.avatar = item.icon;
    } else if (item.type === 'frame') {
      profile.frame = item.name;
    } else if (item.type === 'title') {
      profile.title = item.name.toUpperCase();
    } else if (item.type === 'theme') {
      profile.theme = item.name.toLowerCase().replace(/\s+/g, '-');
    }

    profile.updated_at = new Date().toISOString();
    this.save();

    return {
      success: true,
      equippedItem: item,
      profile
    };
  }

  // --- Badges & Achievements ---
  public getBadges(): BadgeRecord[] {
    return this.data.badges;
  }

  public getUserBadges(userId: string): (UserBadgeRecord & { badge?: BadgeRecord })[] {
    const userBadges = this.data.user_badges.filter(ub => ub.user_id === userId);
    return userBadges.map(ub => ({
      ...ub,
      badge: this.data.badges.find(b => b.id === ub.badge_id)
    }));
  }
}

export const db = new Database();
