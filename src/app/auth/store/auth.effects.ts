import {Actions, Effect, ofType} from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import {catchError, filter, map, switchMap, tap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {of} from 'rxjs';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {User} from '../user.model';
import {AuthService} from '../auth.service';

export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

const handleAuthentication = (resData: AuthResponseData) => {
  const expirationDate = new Date(
    new Date().getTime() + +resData.expiresIn * 1000
  );
  const user = new User(resData.email, resData.localId, resData.idToken, expirationDate);
  localStorage.setItem('userData', JSON.stringify(user));
  return new AuthActions.AuthenticateSuccess({
    email: resData.email,
    userId: resData.localId,
    token: resData.idToken,
    expirationDate,
    redirect: true
  });
};

const handleError = (errorResp: any) => {
  console.log(errorResp);
  let errorMsg = 'An unknown error occurred!';
  if (!errorResp.error || !errorResp.error.error) {
    return of(new AuthActions.AuthenticateFail(errorMsg));
  }
  switch (errorResp.error.error.message) {
    case 'EMAIL_EXISTS':
      errorMsg = 'This email exists!';
      break;
    case 'INVALID_LOGIN_CREDENTIALS':
      errorMsg = 'Invalid login credentials!';
      break;
  }
  return of(new AuthActions.AuthenticateFail(errorMsg));
};

@Injectable()
export class AuthEffects {

  @Effect()
  authSignup = this.actions$.pipe(
    ofType(AuthActions.SIGNUP_START),
    switchMap((signupAction: AuthActions.SignupStart) => {
      return this.http.post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.fireBaseApiKey,
        {
          email: signupAction.payload.email,
          password: signupAction.payload.password,
          returnSecureToken: true
        })
        .pipe(
          tap(respData =>
            this.authService.setLogoutTimer(+respData.expiresIn * 1000)),
          map(handleAuthentication),
          catchError(handleError)
        );
    })
  );

  @Effect()
  authLogin = this.actions$.pipe(
    ofType(AuthActions.LOGIN_START),
    switchMap((authData: AuthActions.LoginStart) => {
      return this.http.post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.fireBaseApiKey,
        {
          email: authData.payload.email,
          password: authData.payload.password,
          returnSecureToken: true
        })
        .pipe(
          tap(respData =>
            this.authService.setLogoutTimer(+respData.expiresIn * 1000)),
          map(handleAuthentication),
          catchError(handleError)
        );
    })
  );

  @Effect()
  autoLogin = this.actions$.pipe(
    ofType(AuthActions.AUTO_LOGIN),
    map(() => {
      const userData: {
        email: string;
        id: string;
        _token: string;
        _tokenExpirationDate: string;
      } = JSON.parse(localStorage.getItem('userData'));
      if (!userData) {
        return {type: 'Do nothing Dummy Action'};
      }
      const expirationDate = new Date(userData._tokenExpirationDate);
      const loadedUser = new User(
        userData.email,
        userData.id,
        userData._token,
        expirationDate
      );

      if (loadedUser.token) {
        const expirationDuration =
          expirationDate.getTime() - new Date().getTime();

        this.authService.setLogoutTimer(expirationDuration);
        return new AuthActions.AuthenticateSuccess({
          email: loadedUser.email,
          userId: loadedUser.id,
          token: loadedUser.token,
          expirationDate: expirationDate,
          redirect: false
        });
      }
      return {type: 'Do nothing Dummy Action'};
    })
  );

  @Effect({dispatch: false})
  authLogout = this.actions$.pipe(
    ofType(AuthActions.LOGOUT),
    tap(() => localStorage.removeItem('userData')),
    tap(() => this.authService.cleanLogoutTimer()),
    tap(() => this.router.navigate(['/']))
  );

  @Effect({dispatch: false})
  authRedirect = this.actions$.pipe(
    ofType(AuthActions.AUTHENTICATE_SUCCESS),
    filter((authSuccessAction: AuthActions.AuthenticateSuccess) => authSuccessAction.payload.redirect),
    tap(() => this.router.navigate(['/']))
  );

  constructor(private actions$: Actions,
              private http: HttpClient,
              private router: Router,
              private authService: AuthService) {
  }
}
