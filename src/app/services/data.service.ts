import { Injectable, computed, signal } from '@angular/core';
import { Chef, Comment, Rating, Recipe } from '../models';

const CHEFS_KEY = 'rs_chefs';
const RECIPES_KEY = 'rs_recipes';

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeRecipes(recipes: Recipe[]): Recipe[] {
  return recipes.map((recipe) => {
    const rawRatings = recipe.ratings ?? [];
    const ratings =
      rawRatings.length > 0 && typeof rawRatings[0] === 'number'
        ? (rawRatings as unknown as number[]).map((value, index) => ({
            chefId: `legacy-${index}`,
            value,
          }))
        : rawRatings;
    return { ...recipe, ratings };
  });
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private chefs = signal<Chef[]>([]);
  private recipes = signal<Recipe[]>([]);

  readonly chefsList = computed(() => this.chefs());
  readonly recipesList = computed(() => this.recipes());

  constructor() {
    const storedChefs = safeParse<Chef[]>(localStorage.getItem(CHEFS_KEY), []);
    const storedRecipes = normalizeRecipes(
      safeParse<Recipe[]>(localStorage.getItem(RECIPES_KEY), []),
    );

    this.chefs.set(storedChefs);
    this.recipes.set(storedRecipes);

    this.seedIfEmpty();
  }

  private persist(): void {
    localStorage.setItem(CHEFS_KEY, JSON.stringify(this.chefs()));
    localStorage.setItem(RECIPES_KEY, JSON.stringify(this.recipes()));
  }

  private seedIfEmpty(): void {
    if (this.chefs().length > 0 || this.recipes().length > 0) return;

    const demoChef: Chef = {
      id: makeId(),
      name: 'Demo Chef',
      email: 'chef@demo.com',
      password: 'chef123',
      createdAt: new Date().toISOString(),
    };

    const demoRecipe: Recipe = {
      id: makeId(),
      chefId: demoChef.id,
      chefName: demoChef.name,
      title: 'Citrus Herb Pasta',
      description: 'Light pasta with lemon, herbs, and olive oil.',
      ingredients: '200g pasta\n1 lemon\n2 tbsp olive oil\nFresh herbs\nSalt, pepper',
      steps: 'Cook pasta.\nMix oil, lemon, herbs.\nToss and season.',
      imageUrl:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
      createdAt: new Date().toISOString(),
      ratings: [
        { chefId: demoChef.id, value: 5 },
        { chefId: 'seed-chef-2', value: 4 },
      ],
      comments: [],
    };

    this.chefs.set([demoChef]);
    this.recipes.set([demoRecipe]);
    this.persist();
  }

  getChefs(): Chef[] {
    return this.chefs();
  }

  getChefByEmail(email: string): Chef | undefined {
    return this.chefs().find((chef) => chef.email.toLowerCase() === email.toLowerCase());
  }

  addChef(name: string, email: string, password: string): { ok: boolean; error?: string; chef?: Chef } {
    if (this.getChefByEmail(email)) {
      return { ok: false, error: 'Email already registered.' };
    }

    const chef: Chef = {
      id: makeId(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      createdAt: new Date().toISOString(),
    };

    this.chefs.set([chef, ...this.chefs()]);
    this.persist();

    return { ok: true, chef };
  }

  deleteChef(chefId: string): void {
    this.chefs.set(this.chefs().filter((chef) => chef.id !== chefId));
    this.recipes.set(this.recipes().filter((recipe) => recipe.chefId !== chefId));
    this.persist();
  }

  getRecipes(): Recipe[] {
    return this.recipes();
  }

  getRecipeById(recipeId: string): Recipe | undefined {
    return this.recipes().find((recipe) => recipe.id === recipeId);
  }

  addRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'ratings' | 'comments'>): Recipe {
    const newRecipe: Recipe = {
      ...recipe,
      id: makeId(),
      createdAt: new Date().toISOString(),
      ratings: [],
      comments: [],
    };

    this.recipes.set([newRecipe, ...this.recipes()]);
    this.persist();

    return newRecipe;
  }

  updateRecipe(
    recipeId: string,
    updates: Pick<Recipe, 'title' | 'description' | 'ingredients' | 'steps' | 'imageUrl'>,
  ): void {
    const updated = this.recipes().map((recipe) => {
      if (recipe.id !== recipeId) return recipe;
      return { ...recipe, ...updates };
    });
    this.recipes.set(updated);
    this.persist();
  }

  deleteRecipe(recipeId: string): void {
    this.recipes.set(this.recipes().filter((recipe) => recipe.id !== recipeId));
    this.persist();
  }

  addRating(recipeId: string, chefId: string, rating: number): boolean {
    let added = false;
    const updated = this.recipes().map((recipe) => {
      if (recipe.id !== recipeId) return recipe;
      const alreadyRated = recipe.ratings.some((entry) => entry.chefId === chefId);
      if (alreadyRated) return recipe;
      const next: Rating = { chefId, value: rating };
      added = true;
      return { ...recipe, ratings: [...recipe.ratings, next] };
    });

    this.recipes.set(updated);
    this.persist();
    return added;
  }

  addComment(recipeId: string, comment: Omit<Comment, 'id' | 'createdAt'>): void {
    const updated = this.recipes().map((recipe) => {
      if (recipe.id !== recipeId) return recipe;
      const nextComment: Comment = {
        ...comment,
        id: makeId(),
        createdAt: new Date().toISOString(),
      };
      return { ...recipe, comments: [nextComment, ...recipe.comments] };
    });

    this.recipes.set(updated);
    this.persist();
  }
}
