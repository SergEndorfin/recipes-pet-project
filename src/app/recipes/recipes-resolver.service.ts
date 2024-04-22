import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Recipe} from './recipe.model';
import {map, switchMap, take} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {Store} from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as RecipesActions from '../recipes/store/recipe.actions';
import {Actions, ofType} from '@ngrx/effects';

@Injectable({providedIn: 'root'})
export class RecipesResolverService implements Resolve<Recipe[]> {

  constructor(private store: Store<fromApp.AppState>,
              private actions$: Actions) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Recipe[]> | Promise<Recipe[]> | Recipe[] {
    return this.store.select('recipes').pipe(
      take(1),
      map(recipesState => recipesState.recipes),
      switchMap(recipes => {
          if (recipes.length === 0) {
            this.store.dispatch(new RecipesActions.FetchRecipes());
            return this.actions$.pipe(
              ofType(RecipesActions.SET_RECIPES),
              take(1)
            );
          } else {
            return of(recipes);
          }
        }
      )
    );
  }
}
