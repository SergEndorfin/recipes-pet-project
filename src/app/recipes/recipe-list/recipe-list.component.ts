import {Component, OnDestroy, OnInit} from '@angular/core';
import {Recipe} from '../recipe.model';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit, OnDestroy {

  recipes: Recipe[];
  subscription: Subscription;

  constructor(private router: Router,
              private aRoute: ActivatedRoute,
              private store: Store<fromApp.AppState>) {
  }

  ngOnInit(): void {
    this.subscription = this.store.select('recipes')
      .pipe(map(recipesState => recipesState.recipes))
      .subscribe(recipes => this.recipes = recipes);
  }

  onNewRecipe() {
    this.router.navigate(['new'],
      {relativeTo: this.aRoute});
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
