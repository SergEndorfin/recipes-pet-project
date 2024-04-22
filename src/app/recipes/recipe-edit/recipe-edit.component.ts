import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {Store} from '@ngrx/store';
import {map} from 'rxjs/operators';
import * as fromApp from '../../store/app.reducer';
import * as RecipesActions from '../store/recipe.actions';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css']
})
export class RecipeEditComponent implements OnInit, OnDestroy {
  id: number;

  editMode = false;
  recipeForm: FormGroup;
  private storeSub: Subscription;

  constructor(private aRoute: ActivatedRoute,
              private router: Router,
              private store: Store<fromApp.AppState>) {
  }

  get ingredients() {
    return (<FormArray>this.recipeForm.get('ingredients')).controls;
  }

  ngOnInit(): void {
    this.aRoute.params.subscribe(params => {
        this.id = +params['id'];
        this.editMode = params['id'] != null;
        console.log('editMode:', this.editMode);
        this.initForm();
      }
    );
  }

  ngOnDestroy(): void {
    this.storeSub?.unsubscribe();
  }

  private initForm() {
    let recipeName = '';
    let recipeImagePath = '';
    let recipeDescription = '';
    const recipeIngredients = new FormArray([]);

    if (this.editMode) {
      // const recipe = this.rs.getRecipeById(this.id);
      this.storeSub = this.store.select('recipes')
        .pipe(
          map(recipeStore => recipeStore.recipes),
          map(recipes => recipes.find((recipe, i) => i === this.id))
        )
        .subscribe(recipe => {
          recipeName = recipe.name;
          recipeImagePath = recipe.imageUrl;
          recipeDescription = recipe.description;
          if (recipe['ingredients']) {
            recipe.ingredients.forEach(ingredient =>
              recipeIngredients.push(
                new FormGroup({
                  'name': new FormControl(ingredient.name, Validators.required),
                  'amount': new FormControl(ingredient.amount, [
                    Validators.required,
                    Validators.pattern(/^[1-9]+[0-9]*$/)
                  ])
                })));
          }
        });
    }

    this.recipeForm = new FormGroup({
      'name': new FormControl(recipeName, Validators.required),
      'imageUrl': new FormControl(recipeImagePath, Validators.required),
      'description': new FormControl(recipeDescription, Validators.required),
      'ingredients': recipeIngredients
    });
  }

  onSubmit() {
    if (this.editMode) {
      this.store.dispatch(
        new RecipesActions.UpdateRecipe({
          index: this.id,
          recipe: this.recipeForm.value
        })
      );
    } else {
      this.store.dispatch(new RecipesActions.AddRecipe(this.recipeForm.value));
    }
    this.onCancel();
  }

  onAddIngredient() {
    (this.recipeForm.get('ingredients') as FormArray).push(
      new FormGroup({
        'name': new FormControl(null, Validators.required),
        'amount': new FormControl(null, [
          Validators.required,
          Validators.pattern(/^[1-9]+[0-9]*$/)
        ])
      })
    );
  }

  onCancel() {
    this.router.navigate(['../'], {relativeTo: this.aRoute});
  }

  onDeleteIngredient(index: number) {
    (<FormArray>this.recipeForm.get('ingredients')).removeAt(index);
  }
}
