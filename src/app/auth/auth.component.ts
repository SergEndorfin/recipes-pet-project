import {Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Subscription} from 'rxjs';
import {AlertComponent} from '../shared/alert/alert.component';
import {PlaceholderDirective} from '../shared/placeholder/placeholder.directive';
import {Store} from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';

@Component({
  selector: 'app-auth',
  templateUrl: 'auth.component.html'
})
export class AuthComponent implements OnInit, OnDestroy {
  private closeSub: Subscription;
  private storeSub: Subscription;
  @ViewChild(PlaceholderDirective) alertHost: PlaceholderDirective;

  isLoginMode = true;
  isLoading = false;
  error: string = null;

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private store: Store<fromApp.AppState>) {
  }

  ngOnInit(): void {
    this.storeSub = this.store.select('auth')
      .subscribe(
        authState => {
          this.isLoading = authState.loading;
          this.error = authState.authError;
          if (this.error) {
            this.showErrorAlert(this.error);
          }
        });
  }

  ngOnDestroy(): void {
    this.closeSub?.unsubscribe();
    this.storeSub.unsubscribe();
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm) {
    console.log(form.value);
    if (form.invalid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;

    this.isLoading = true;

    if (this.isLoginMode) {
      this.store.dispatch(new AuthActions.LoginStart({email, password}));
    } else {
      this.store.dispatch(new AuthActions.SignupStart({email, password}));
    }

    form.reset();
  }

  private showErrorAlert(errorMsg: string) {
    const alertComponentFactory =
      this.componentFactoryResolver.resolveComponentFactory(AlertComponent);

    const hostViewContainerRef = this.alertHost.viewContainerRef;
    hostViewContainerRef.clear();

    const componentRef = hostViewContainerRef.createComponent(alertComponentFactory);

    componentRef.instance.message = errorMsg;
    this.closeSub = componentRef.instance.close.subscribe(() => {
      this.closeSub.unsubscribe();
      hostViewContainerRef.clear();
    });
  }

  // onHandleError() {
  //   this.store.dispatch(new AuthActions.ClearError());
  // }
}
