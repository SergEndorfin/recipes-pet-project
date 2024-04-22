import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {LogingService} from './loging.service';
import {Store} from '@ngrx/store';
import * as fromApp from './store/app.reducer';
import * as AuthActions from './auth/store/auth.actions';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private loginService: LogingService,
              private store: Store<fromApp.AppState>,
              @Inject(PLATFORM_ID) private platformId) {
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.store.dispatch(new AuthActions.AutoLogin());
    }
    this.loginService.printLog('just a test');
  }
}
