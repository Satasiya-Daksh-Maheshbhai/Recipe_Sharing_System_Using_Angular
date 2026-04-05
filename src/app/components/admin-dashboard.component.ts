import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent {
  chefs = () => this.data.chefsList();
  recipes = () => this.data.recipesList();

  constructor(private data: DataService) {}

  deleteChef(chefId: string): void {
    const ok = confirm('Delete this chef and all their recipes?');
    if (!ok) return;
    this.data.deleteChef(chefId);
  }

  deleteRecipe(recipeId: string): void {
    const ok = confirm('Delete this recipe?');
    if (!ok) return;
    this.data.deleteRecipe(recipeId);
  }
}
