export type AttributeType = 'Strength' | 'Intellect' | 'Vitality' | 'Mind';

export type QuestCategory = 
  | 'Coding' 
  | 'Study' 
  | 'Fitness' 
  | 'Reading' 
  | 'Health' 
  | 'Personal' 
  | 'Creativity' 
  | 'Other';

export type QuestDifficulty = 'Easy' | 'Normal' | 'Hard' | 'Epic';

export type VerificationType = 'self_report' | 'focus_session' | 'evidence_submission';

export type VerificationStatus = 
  | 'self_verified' 
  | 'session_verified' 
  | 'evidence_submitted' 
  | 'pending';

export type ItemType = 'avatar' | 'frame' | 'badge' | 'theme' | 'title' | 'artifact';

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  email: string;
  level: number;
  total_xp: number;
  current_level_xp: number;
  next_level_xp: number;
  xp_for_next_level: number;
  progress_percentage: number;
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

export interface CharacterAttributes {
  id?: string;
  user_id?: string;
  strength: number;
  intellect: number;
  vitality: number;
  mind: number;
  updated_at?: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: QuestCategory;
  attribute: AttributeType;
  difficulty: QuestDifficulty;
  xp_reward: number;
  gold_reward: number;
  attribute_points: number;
  verification_type: VerificationType;
  verification_status: VerificationStatus;
  evidence_notes?: string;
  target_duration_minutes?: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

export interface TaskHistory {
  id: string;
  user_id: string;
  task_id: string;
  task_title: string;
  category: QuestCategory;
  xp_earned: number;
  gold_earned: number;
  attribute: AttributeType;
  attribute_points: number;
  verification_status: VerificationStatus;
  completed_at: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  price: number;
  icon: string;
  effect?: string;
  created_at?: string;
}

export interface InventoryItem {
  id: string;
  user_id: string;
  item_id: string;
  equipped: boolean;
  purchased_at: string;
  item?: Item;
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  requirement: string;
  rarity: ItemRarity;
  icon: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface CompleteQuestResult {
  success: boolean;
  xpGained: number;
  goldGained: number;
  attributeGained: number;
  attributeName: AttributeType;
  currentXP: number;
  level: number;
  levelUp: boolean;
  previousLevel?: number;
  currentStreak: number;
  newBadges: Badge[];
  task: Task;
  attributes: CharacterAttributes;
  profile: UserProfile;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
  profile: UserProfile;
  attributes: CharacterAttributes;
}
