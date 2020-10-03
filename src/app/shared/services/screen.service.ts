import { Injectable, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { shareReplay, startWith, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScreenService {
  public isSmallScreen$: Observable<{matches: boolean}>;
  public isHandset$: Observable<BreakpointState>;

  constructor(
    private bpObserver: BreakpointObserver
  ) {
    // console.log('ENTER ScreenService.constructor()');

    this.isSmallScreen$ = this.bpObserver
    // .observe([Breakpoints.Handset, Breakpoints.Tablet])
    .observe([Breakpoints.HandsetPortrait])
      .pipe(
        // tap((m: {matches: boolean}) => console.log('\tScreenService.PIPE matches:', m.matches)),
        startWith({matches: false}),
        shareReplay(1)
      );


    }

}
