import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { User } from 'firebase';
// import { AngularFireAuth } from "@angular/fire/auth";
import { UserService } from '../services/user.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    
  constructor(
        private router: Router,
        // public readonly ngFireAuth: AngularFireAuth,
        private userSrv: UserService
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
       
  const curUser: User = this.userSrv.curUser;
/* // WRONG
    let curUser: User = null;
    const subs = this.ngFireAuth.authState
      .subscribe((user: User) => {
        // console.log('\tSUBSCRIBE: AuthGuard.canActivate() user: %s', user ? user.uid : 'NULL');

        curUser = user;
      });
    subs.unsubscribe() ;
*/
    // console.log('AuthGuard.canActivate() user: %s route: %s', 
    //   curUser ? curUser.uid : 'NULL', state.url);    
    
    if (curUser) {
        // authorised so return true
        return true;
    }
    this.router.navigateByUrl('/login-signup');
    return false;
  }
}
