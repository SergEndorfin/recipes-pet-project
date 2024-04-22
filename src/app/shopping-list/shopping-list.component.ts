import {Component, OnDestroy, OnInit} from '@angular/core';
import {Ingredient} from '../shared/ingredient.model';
import {Observable, Subscription} from 'rxjs';
import {LogingService} from '../loging.service';
import {Store} from '@ngrx/store';
import * as ShoppingListActions from './store/shopping-list.actions';
import * as fromApp from '../store/app.reducer';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent implements OnInit, OnDestroy {

  private idChangeSub: Subscription;
  ingredients: Observable<{ ingredients: Ingredient[] }>;

  constructor(private ls: LogingService,
              private store: Store<fromApp.AppState>
  ) {
  }

  ngOnInit(): void {
    this.ingredients = this.store.select('shoppingList');
    this.ls.printLog('from SLC');
  }

  ngOnDestroy(): void {
    this.idChangeSub?.unsubscribe();
  }

  onEditItem(index: number) {
    // this.sls.$startedEdit.next(index);
    this.store.dispatch(new ShoppingListActions.StartEdit(index));
  }
}
