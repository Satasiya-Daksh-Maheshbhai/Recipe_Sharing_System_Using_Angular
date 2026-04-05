import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';
import { Recipe } from '../models';

@Component({
  selector: 'app-chef-dashboard',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './chef-dashboard.component.html',
})
export class ChefDashboardComponent {
  recipes = () => this.data.recipesList();

  searchTerm = '';
  message = '';

  newRecipe = {
    title: '',
    description: '',
    ingredients: '',
    steps: '',
    imageUrl: '',
  };

  editId: string | null = null;
  editDraft = {
    title: '',
    description: '',
    ingredients: '',
    steps: '',
    imageUrl: '',
  };

  ratingDrafts: Record<string, number> = {};
  commentDrafts: Record<string, string> = {};

  constructor(public auth: AuthService, private data: DataService) {}

  addRecipe(): void {
    this.message = '';
    if (!this.newRecipe.title || !this.newRecipe.description || !this.newRecipe.ingredients || !this.newRecipe.steps) {
      this.message = 'Please fill in all recipe fields.';
      return;
    }

    const chefId = this.auth.currentChefId();
    const chefName = this.auth.currentChefName();
    if (!chefId || !chefName) {
      this.message = 'Please login again to add recipes.';
      return;
    }

    this.data.addRecipe({
      chefId,
      chefName,
      title: this.newRecipe.title.trim(),
      description: this.newRecipe.description.trim(),
      ingredients: this.newRecipe.ingredients.trim(),
      steps: this.newRecipe.steps.trim(),
      imageUrl: this.newRecipe.imageUrl.trim() || undefined,
    });

    this.newRecipe = { title: '', description: '', ingredients: '', steps: '', imageUrl: '' };
    this.message = 'Recipe added successfully.';
  }

  startEdit(recipe: Recipe): void {
    this.editId = recipe.id;
    this.editDraft = {
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      imageUrl: recipe.imageUrl ?? '',
    };
  }

  cancelEdit(): void {
    this.editId = null;
    this.editDraft = { title: '', description: '', ingredients: '', steps: '', imageUrl: '' };
  }

  saveEdit(recipeId: string): void {
    if (!this.editDraft.title || !this.editDraft.description || !this.editDraft.ingredients || !this.editDraft.steps) {
      this.message = 'Please complete all fields before saving.';
      return;
    }
    this.data.updateRecipe(recipeId, {
      title: this.editDraft.title.trim(),
      description: this.editDraft.description.trim(),
      ingredients: this.editDraft.ingredients.trim(),
      steps: this.editDraft.steps.trim(),
      imageUrl: this.editDraft.imageUrl.trim() || undefined,
    });
    this.message = 'Recipe updated successfully.';
    this.cancelEdit();
  }

  averageRating(recipe: Recipe): string {
    if (!recipe.ratings.length) return 'No ratings';
    const avg = recipe.ratings.reduce((sum, entry) => sum + entry.value, 0) / recipe.ratings.length;
    return `${avg.toFixed(1)} / 5`;
  }

  myRating(recipe: Recipe): number | null {
    const chefId = this.auth.currentChefId();
    if (!chefId) return null;
    const entry = recipe.ratings.find((rating) => rating.chefId === chefId);
    return entry ? entry.value : null;
  }

  hasRated(recipe: Recipe): boolean {
    return this.myRating(recipe) !== null;
  }

  submitRating(recipeId: string): void {
    const chefId = this.auth.currentChefId();
    if (!chefId) return;
    const rating = this.ratingDrafts[recipeId];
    if (!rating || rating < 1 || rating > 5) return;
    const added = this.data.addRating(recipeId, chefId, rating);
    if (!added) {
      this.message = 'You have already rated this recipe.';
      return;
    }
    this.message = 'Rating submitted.';
    this.ratingDrafts[recipeId] = 0;
  }

  submitComment(recipeId: string): void {
    const text = this.commentDrafts[recipeId];
    if (!text || !text.trim()) return;
    const chefId = this.auth.currentChefId();
    const chefName = this.auth.currentChefName();
    if (!chefId || !chefName) return;

    this.data.addComment(recipeId, {
      chefId,
      chefName,
      text: text.trim(),
    });
    this.commentDrafts[recipeId] = '';
  }

  myRecipes(): Recipe[] {
    const chefId = this.auth.currentChefId();
    if (!chefId) return [];
    return this.filteredByTitle(this.recipes().filter((recipe) => recipe.chefId === chefId));
  }

  otherRecipes(): Recipe[] {
    const chefId = this.auth.currentChefId();
    return this.filteredByTitle(this.recipes().filter((recipe) => recipe.chefId !== chefId));
  }

  private filteredByTitle(recipes: Recipe[]): Recipe[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return recipes;
    return recipes.filter((recipe) => recipe.title.toLowerCase().includes(term));
  }
}
