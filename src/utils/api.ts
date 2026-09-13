import {
  UserProfile,
  CharacterAttributes,
  Task,
  TaskHistory,
  Item,
  InventoryItem,
  Badge,
  CompleteQuestResult,
  AuthResponse
} from '../types';

const TOKEN_KEY = 'lifequest_token';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(TOKEN_KEY);
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Session expired or unauthorized
      this.setToken(null);
      if (endpoint !== '/api/auth/me') {
        window.dispatchEvent(new CustomEvent('lifequest_unauthorized'));
      }
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const msg = data.message || data.error || `Error ${response.status}: Request failed`;
      throw new Error(msg);
    }

    return data as T;
  }

  // --- Auth ---
  public async signup(email: string, password: string, username?: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, username })
    });
    this.setToken(res.token);
    return res;
  }

  public async login(email: string, password: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(res.token);
    return res;
  }

  public async getMe(): Promise<{ user: any; profile: UserProfile; attributes: CharacterAttributes }> {
    return this.request('/api/auth/me');
  }

  public logout() {
    this.setToken(null);
  }

  // --- Character & Attributes ---
  public async getCharacter(): Promise<{ profile: UserProfile; attributes: CharacterAttributes }> {
    return this.request('/api/character');
  }

  public async updateCharacter(data: { username?: string; avatar?: string; title?: string; theme?: string; frame?: string }): Promise<{ profile: UserProfile }> {
    return this.request('/api/character', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  public async getAttributes(): Promise<CharacterAttributes> {
    return this.request('/api/attributes');
  }

  public async getStreak(): Promise<{
    current_streak: number;
    longest_streak: number;
    last_activity_date: string | null;
    recent_days: { day: string; date: string; active: boolean }[];
  }> {
    return this.request('/api/streak');
  }

  // --- Tasks (Quests) ---
  public async getTasks(): Promise<Task[]> {
    return this.request('/api/tasks');
  }

  public async createTask(task: {
    title: string;
    description?: string;
    category: string;
    attribute: string;
    difficulty: string;
    verification_type: string;
    target_duration_minutes?: number;
  }): Promise<{ message: string; task: Task }> {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task)
    });
  }

  public async updateTask(id: string, updates: Partial<Task>): Promise<{ message: string; task: Task }> {
    return this.request(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  public async deleteTask(id: string): Promise<{ message: string }> {
    return this.request(`/api/tasks/${id}`, {
      method: 'DELETE'
    });
  }

  public async completeQuest(id: string, data?: { evidence_notes?: string; verified_status?: string }): Promise<CompleteQuestResult> {
    return this.request(`/api/tasks/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(data || {})
    });
  }

  // --- Journey ---
  public async getJourney(): Promise<TaskHistory[]> {
    return this.request('/api/journey');
  }

  // --- Reward Forge (Shop) ---
  public async getRewards(): Promise<(Item & { owned: boolean; equipped: boolean; inventory_id?: string })[]> {
    return this.request('/api/rewards');
  }

  public async purchaseReward(itemId: string): Promise<{
    message: string;
    item: Item;
    profile: UserProfile;
    inventoryItem: InventoryItem;
  }> {
    return this.request(`/api/rewards/${itemId}/purchase`, {
      method: 'POST'
    });
  }

  // --- Inventory ---
  public async getInventory(): Promise<InventoryItem[]> {
    return this.request('/api/inventory');
  }

  public async equipItem(inventoryId: string): Promise<{
    message: string;
    equippedItem: Item;
    profile: UserProfile;
  }> {
    return this.request(`/api/inventory/${inventoryId}/equip`, {
      method: 'POST'
    });
  }

  // --- Achievements / Badges ---
  public async getAchievements(): Promise<(Badge & { unlocked: boolean; earned_at?: string })[]> {
    return this.request('/api/achievements');
  }
}

export const api = new ApiClient();
