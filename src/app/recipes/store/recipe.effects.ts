import {Actions, Effect, ofType} from '@ngrx/effects';
import * as RecipesActions from './recipe.actions';
import {map, switchMap, withLatestFrom} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {Recipe} from '../recipe.model';
import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import * as fromAmm from '../../store/app.reducer';


@Injectable()
export class RecipeEffects {

  @Effect()
  fetchRecipe = this.actions$.pipe(
    ofType(RecipesActions.FETCH_RECIPES),
    switchMap(fetchAction => this.http.get<Recipe[]>(
      'https://recipes-pet-project-79e8c-default-rtdb.europe-west1.firebasedatabase.app/recipe.json')
    ),
    map(recipes => recipes.map(recipe => ({
        ...recipe,
        ingredients: recipe.ingredients ? recipe.ingredients : []
      }))
    ),
    map(recipes => new RecipesActions.SetRecipes(recipes))
  );

  @Effect({dispatch: false})
  storeRecipe = this.actions$.pipe(
    ofType(RecipesActions.STORE_RECIPES),
    withLatestFrom(this.store.select('recipes')),
    switchMap(([action, recipesState]) => this.http.put(
        'https://recipes-pet-project-79e8c-default-rtdb.europe-west1.firebasedatabase.app/recipe.json',
        recipesState.recipes
      )
    )
  );

  constructor(private actions$: Actions,
              private http: HttpClient,
              private store: Store<fromAmm.AppState>) {
  }
}
