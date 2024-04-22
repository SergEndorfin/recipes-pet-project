import {Component, OnInit} from '@angular/core';
import {Recipe} from '../recipe.model';
import {ActivatedRoute, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {map, switchMap, tap} from 'rxjs/operators';
import * as fromApp from '../../store/app.reducer';
import * as RecipesActions from '../store/recipe.actions';
import * as ShoppingListActions from '../../shopping-list/store/shopping-list.actions';


@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit {

  recipe: Recipe;
  recipeId: number;

  constructor(
    private aRoute: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.AppState>) {
  }

  ngOnInit(): void {
    this.aRoute.params
      .pipe(
        map(params => +params['id']),
        tap(recipeId => this.recipeId = recipeId),
        switchMap(recipeId => this.store.select('recipes')),
        map(recipeState => recipeState.recipes),
        map(recipes => recipes.find(
          (recipe, index) => index === this.recipeId)
        )
      )
      .subscribe(recipe => this.recipe = recipe);
  }

  onAddToShoppingList() {
    this.store.dispatch(
      new ShoppingListActions.AddIngredients(this.recipe.ingredients)
    );
  }

  onEditRecipe() {
    this.router.navigate(['edit'], {relativeTo: this.aRoute});
    // this.router.navigate(['../', this.recipeId, 'edit'], {relativeTo: this.aRoute});
  }

  onDeleteRecipe() {
    this.store.dispatch(
      new RecipesActions.DeleteRecipe(this.recipeId));
    this.router.navigate(['recipes']);
  }
}
