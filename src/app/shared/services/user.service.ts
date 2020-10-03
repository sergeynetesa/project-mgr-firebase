import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { User, auth } from 'firebase/app'; 
import { AngularFireAuth } from "@angular/fire/auth"; 

import { UserStateEnum, IsUserChangedInterface, ChangeResultEnum, MessageTypeEnum
        } from '../model/user.interface';


import { UserStateService } from './user-state.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
 public curUser$: Observable<User|null>;   
 public curUser: User;
 
  constructor(    
    private readonly ngFireAuth: AngularFireAuth
  ) {
    this.curUser$ = ngFireAuth.authState
      .pipe(
        tap((user: User) => {
          this.curUser = user;
          // console.log('UserService: constuctor() user: %s', JSON.stringify(user, null, 2))
          // console.log('\t***PIPE: UserService: constuctor() user: %s', user ? user.uid : 'NULL');
        })
      );
      // this.curUser$.subscribe();
  }

  getCurUserId(): string {
    if (this.curUser) {
      return this.curUser.uid;
    } else {
      return null;
    }
  }

  public loginUser(email: string, password: string, stateService: UserStateService): void  {
    if (stateService) {
      const isUserChangedEnter: IsUserChangedInterface = {
        op: UserStateEnum.LOGIN,
        isEnd: false,
        opResult: ChangeResultEnum.NOSET,
      };
      stateService.next(isUserChangedEnter);
    }

    this.ngFireAuth.signInWithEmailAndPassword(email, password)
    .then((uc: auth.UserCredential) => {
      // console.log('\tTHEN: UserService: loginUser() user: %s', JSON.stringify(uc.user, null, 2));
      // console.log('\tTHEN: UserService: loginUser() user: %s', uc.user ? uc.user.uid : 'NULL');

      if (stateService) {
        const isUserChangedExit: IsUserChangedInterface = {
          op: UserStateEnum.LOGIN,
          isEnd: true,
          opResult: ChangeResultEnum.SUCCESS,
          user_email: uc.user.email,
        };
        stateService.next(isUserChangedExit);
      }
    })
    .catch( error => {
      const errorCode = error.code;
      let errorMessage = error.message;
      switch(errorCode) {
        case 'auth/invalid-email':
          errorMessage = 'Email address is not valid';
        break;        
        case 'auth/user-disabled':
          errorMessage = 'User corresponding to the given Email has been disabled';
        break;
        case 'auth/user-not-found':
          errorMessage = 'User corresponding to the given Email has not found';        
        break;
        case 'auth/wrong-password':
          errorMessage = 'Password is invalid for the given Email';        
        break;        
        default: // If all else fails...
          errorMessage = error.message;
        break; // stop here
        }
      if (stateService) {
       const isUserChangedError: IsUserChangedInterface = {
          op: UserStateEnum.LOGIN,
          isEnd: true,
          opResult: ChangeResultEnum.ERROR,
          messageType: MessageTypeEnum.ERROR,
          message: errorMessage,
        };
        stateService.next(isUserChangedError);
      }
    });
  }

  public signupUser(email: string, password: string, stateService: UserStateService): void  {
    if (stateService) {
      const isUserChangedEnter: IsUserChangedInterface = {
        op: UserStateEnum.SIGNUP,
        isEnd: false,
        opResult: ChangeResultEnum.NOSET,
      };
      stateService.next(isUserChangedEnter);
    }

    this.ngFireAuth.createUserWithEmailAndPassword(email, password)
    .then((uc: auth.UserCredential) => {
      // console.log('\tTHEN: UserService: signupUser() user: %s', JSON.stringify(uc.user, null, 2));

      if (stateService) {
        const isUserChangedExit: IsUserChangedInterface = {
          op: UserStateEnum.SIGNUP,
          isEnd: true,
          opResult: ChangeResultEnum.SUCCESS,
          user_email: uc.user.email,
        };
        stateService.next(isUserChangedExit);
      }
    })
    .catch( error => {
      const errorCode = error.code;
      let errorMessage = error.message;
      switch(errorCode) {
        case 'auth/email-already-in-use':
          errorMessage = 'Account with the given Email already exists';
        break;
        case 'auth/invalid-email':
          errorMessage = 'Email address is not valid';
        break;        
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
        break;
        // case 'auth/user-not-found':
        //   errorMessage = 'User corresponding to the given Email has not found';        
        // break;
        case 'auth/weak-password':
          errorMessage = 'Password is not strong enough';        
        break;        
        default: // If all else fails...
          errorMessage = error.message;
        break; // stop here
        }
      if (stateService) {
       const isUserChangedError: IsUserChangedInterface = {
          op: UserStateEnum.LOGIN,
          isEnd: true,
          opResult: ChangeResultEnum.ERROR,
          messageType: MessageTypeEnum.ERROR,
          message: errorMessage,
        };
        stateService.next(isUserChangedError);
      }
    });
  }

  logoutUser(): void {
    this.ngFireAuth.signOut();
  }

  // eof user.service
}
