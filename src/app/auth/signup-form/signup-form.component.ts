import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { MatSnackBar, MatSnackBarRef, SimpleSnackBar, MatSnackBarDismiss } 
        from '@angular/material/snack-bar';

import { User } from 'firebase';

import { IsUserChangedInterface, UserStateEnum } from '../../shared/model/user.interface';

import { UserService } from '../../shared/services/user.service';

import { CustomValidators } from '../custom-validators';
import { ChangeResultEnum } from 'src/app/shared/model/user.interface';
import { UserStateService } from 'src/app/shared/services/user-state.service';

@Component({
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss'],
  providers: [
    UserStateService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupFormComponent implements OnInit, OnDestroy {
  returnUrl: string;
  loginFG: FormGroup;
  userFG: FormGroup;
  // --------------------------------------------------------------
  private simpleSnackBarRef: MatSnackBarRef<SimpleSnackBar> = null;
  // --------------------------------------------------------------

  currentUser$: Observable<User|null>;

  public isUserChanged$: Observable<IsUserChangedInterface> = null;
  // Accessors
  get login_name() { return this.loginFG.get('login_name'); }
  get isLoginNameInvalid() {
    const c = this.loginFG.get('login_name');
    return  c && c.errors && (c.dirty || c.touched);
  }
  get login_email() { return this.loginFG.get('login_email'); }

  get signup_name() { return this.userFG.get('signup_name'); }
  get signup_email() { return this.userFG.get('signup_email'); }


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    public userSrv: UserService,
    protected userStateSrv: UserStateService,
    private snackBarSrv: MatSnackBar
  ) {

  }

  ngOnInit() {
    const that = this;
    this.returnUrl = '/projects';

    this.loginFG = this.fb.group({
      login_name: ['', {
        validators: [
        Validators.required,
        CustomValidators.userNameValidator()
        ], updateOn: 'change' }
      ],
      login_email: ['', {
      validators: [
        Validators.required,
        Validators.email
        ], updateOn: 'change' }
      ]
    });
    this.userFG = this.fb.group({
      signup_name: ['', {
        validators: [
          Validators.required,
          CustomValidators.userNameValidator()
        ],
        updateOn: 'change' }
      ],
      signup_email: ['', {
        validators: [
          Validators.required,
          Validators.email
        ],
        updateOn: 'change' }
      ]
    });

    this.currentUser$ = this.userSrv.curUser$
      .pipe(
        tap((user: User) => {
          if (!user) {
            const loginNameFC = this.loginFG.get('login_name') as FormControl;
            // loginNameFC.reset(null, {onlySelf: true, emitEvent: false}); // ~
            if (loginNameFC) {
              loginNameFC.reset();
              loginNameFC.setErrors(null);
            }
            const loginEmailFC = this.loginFG.get('login_email') as FormControl;
            if (loginEmailFC) {
              loginEmailFC.reset();
              loginEmailFC.setErrors(null);
            }
            const signupNameFC = this.userFG.get('signup_name') as FormControl;
            if (signupNameFC) {
              signupNameFC.reset();
              signupNameFC.setErrors(null);
            }
            const signupEmailFC = this.userFG.get('signup_email') as FormControl;
            if (signupEmailFC) {
              signupEmailFC.reset();
              signupEmailFC.setErrors(null);
            }
          }
        })
      );

    this.isUserChanged$ = this.userStateSrv.isUserChanged$
    .pipe(
      tap((r: IsUserChangedInterface) => {
        if (r.op === UserStateEnum.SIGNUP) {
          if (!r.isEnd && r.opResult === ChangeResultEnum.NOSET) {
            if (this.simpleSnackBarRef != null) {
              this.simpleSnackBarRef.dismiss();
              this.simpleSnackBarRef = null;
            }
          } else if (r.isEnd && r.opResult === ChangeResultEnum.ERROR) { // Error
            this.simpleSnackBarRef = this.snackBarSrv.open(`ERROR: ${r.message}`,
              'X', {
              duration: 0,
              panelClass: 'mat-snack-bar-container_err'
            });
          } else if (r.isEnd && r.opResult === ChangeResultEnum.SUCCESS) {
            this.simpleSnackBarRef =
              this.snackBarSrv.open(`User with [ ${r.user_email} ] has been created`,
              '', {
              duration: 1500,
              panelClass: 'mat-snack-bar-container_info'
            });
            this.simpleSnackBarRef.afterDismissed()
            .subscribe(
              (res: MatSnackBarDismiss) => {
                this.router.navigateByUrl(this.returnUrl);
              }
            );
          }
        } else if (r.op === UserStateEnum.LOGIN) {
          if (!r.isEnd && r.opResult === ChangeResultEnum.NOSET) {
            if (that.simpleSnackBarRef != null) {
              that.simpleSnackBarRef.dismiss();
              that.simpleSnackBarRef = null;
            }
          } else if (r.isEnd && r.opResult === ChangeResultEnum.ERROR) { // Error
              that.simpleSnackBarRef = that.snackBarSrv.open(`ERROR: ${r.message}`,
                'X', {
                duration: 0,
                panelClass: 'mat-snack-bar-container_err'
                });
          } else if (r.isEnd && r.opResult === ChangeResultEnum.SUCCESS) {
            that.simpleSnackBarRef =
              that.snackBarSrv.open(`User with [ ${r.user_email} ] is logged in`,
              '', {
              duration: 1500,
              panelClass: 'mat-snack-bar-container_info'
            });
            that.simpleSnackBarRef.afterDismissed()
            .subscribe(
              (res: MatSnackBarDismiss) => {
                // console.log('\tPIPE: SignupFormComponent.ngOnInit().tap returnUrl: %s', that.returnUrl);
                that.router.navigateByUrl(that.returnUrl);
              }
            );
          }
        }
      })
    );
  }
  onLoginSubmit({ value, valid }: { value: any, valid: boolean }) {
    if (valid) {
        this.userSrv.loginUser(value.login_email, value.login_name, this.userStateSrv);
    }
  }
  onSignupSubmit({ value, valid }: { value: any, valid: boolean }) {
    if (valid) {      
      this.userSrv.signupUser(value.signup_email, value.signup_name, this.userStateSrv);
    }
  }
  ngOnDestroy() {
    if (this.simpleSnackBarRef != null) {
      this.simpleSnackBarRef.dismiss();
      this.simpleSnackBarRef = null;
    }
  }
}
