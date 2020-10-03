import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { UserStateInterface, IsUserChangedInterface, UserStateEnum, ChangeResultEnum
          } from '../model/user.interface';


@Injectable()
export class UserStateService implements UserStateInterface {
  private isUserChangedInit: IsUserChangedInterface = {
    op: UserStateEnum.NOSET,
    isEnd: false,
    opResult: ChangeResultEnum.NOSET,
    
  };
  private isUserChangedSub$ =
    new BehaviorSubject<IsUserChangedInterface>(this.isUserChangedInit);
  public isUserChanged$ = this.isUserChangedSub$.asObservable();
  public isUserChangedValue = this.isUserChangedSub$.value;
  public context = 'N/A';

  constructor() {
  }

  public reset() {
      this.isUserChangedSub$.next(this.isUserChangedInit);
  }
  public complete() {
    this.isUserChangedSub$.complete();
  }
  public next(userChangedState: IsUserChangedInterface) {
    if (userChangedState) {
      this.isUserChangedSub$.next(userChangedState);
    } else {
        this.isUserChangedSub$.next(this.isUserChangedInit);
    }
  }
}
