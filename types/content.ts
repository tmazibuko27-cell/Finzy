export type CardType = 'fact' | 'story' | 'person' | 'company' | 'concept' | 'history' | 'quiz' | 'comparison';

export type ExperienceLevel = 'beginner' | 'some_knowledge' | 'professional';
export type UserGoal = 'casual' | 'markets' | 'career' | 'investing';

export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type Collectible = {
  id: string;
  slug: string;
  name: string;
  descriptor?: string;
  portraitUrl?: string | null;
  rarity: CardRarity;
};

export type PackOpenResult = {
  person: {
    id: string;
    name: string;
    slug: string;
    descriptor?: string;
    business?: string;
    education?: string;
    netWorth?: string;
    power?: number;
    portraitUrl?: string | null;
    portraitAsset?: number;
  };
  rarity: CardRarity;
  isDuplicate: boolean;
  bonusXp: number;
  balance: number;
  replay: boolean;
};

export type CollectionEntry = {
  person: Collectible;
  duplicateCount: number;
  firstUnlockedAt: string;
};

export type EntityChip = {
  type: 'person' | 'company' | 'topic';
  slug: string;
  name: string;
};

export type Source = {
  id: string;
  title: string;
  url: string;
  publisher?: string | null;
};

export type QuestionOption = {
  id: string;
  label: string;
};

export type QuizPayload = {
  questionId: string;
  questionVersion: number;
  prompt: string;
  type: 'multiple_choice' | 'true_false' | 'numeric' | 'scenario';
  difficulty: 1 | 2 | 3;
  options?: QuestionOption[];
  numericUnit?: string | null;
  xpReward: number;
};

export type FeedCard = {
  id: string;
  type: CardType;
  eyebrow?: string | null;
  hook: string;
  body: string;
  imageUrl?: string | null;
  difficulty: 1 | 2 | 3;
  estimatedSeconds: number;
  entities: EntityChip[];
  sourceCount: number;
  storySequence?: number | null;
  storyTotal?: number | null;
  isSaved: boolean;
  isFollowingPrimaryTopic: boolean;
  quiz?: QuizPayload | null;
};

export type FeedPage = {
  cards: FeedCard[];
  nextCursor: string | null;
};

export type QuizSubmitResult = {
  correct: boolean;
  explanation: string;
  correctOptionId?: string | null;
  xpAwarded: number;
  totalXp: number;
  level: number;
};

export type ProfileSummary = {
  id: string;
  displayName: string | null;
  username: string | null;
  level: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
};
