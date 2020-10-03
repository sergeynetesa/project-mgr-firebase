import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { Router, NavigationEnd } from '@angular/router';

import { Observable } from 'rxjs';
import { map, filter, shareReplay, startWith, tap } from 'rxjs/operators';

import { PAGE_ROUTES, PageRoutes, PageRoute } from './pages.routes';

import { User } from 'firebase';
import { AngularFireAuth } from "@angular/fire/auth"; 

import { ScreenService } from './shared/services/screen.service';
import { UserService } from './shared/services/user.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  animations: [
    trigger('growInOut', [
      state('in', style({ opacity: 1 })),
      transition('void => *', [
        style({
          opacity: 0,
          transform: 'scale3d(.3, .3, .3)'
        }),
        animate(`150ms ease-in`)
      ]),
      transition('* => void', [
        animate(
          `150ms ease-out`,
          style({
            opacity: 0,
            transform: 'scale3d(.3, .3, .3)'
          })
        )
      ])
    ])
  ],
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  public pageRoutes = PAGE_ROUTES;
  public routeMap = createTopRouteMap(PAGE_ROUTES);
  public leftRouteArr = createLeftRouteArray(PAGE_ROUTES);

  public header$: Observable<{title: string}>;

  public isSmallScreen$: Observable<{matches: boolean}>;

  public currentUser$: Observable<User|null>;   

  constructor(
    private router: Router,    
    public readonly ngFireAuth: AngularFireAuth,
    public screenSrv: ScreenService,
    public userSrv: UserService
  ) {

  }

  ngOnInit() {
    this.isSmallScreen$ = this.screenSrv.isSmallScreen$
    .pipe(
      tap((m: {matches: boolean}) => {
        // console.log('\tPIPE: AppComponent.ngOnInit().isSmallScreen$ matches: %s', m.matches);
      })
    );

    this.header$ = this.router.events
    .pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: NavigationEnd) => {
        // console.log('\tPIPE: AppComponent.ngOnInit() .header$ e.url: %s \trouteMap: %O', e.url, this.routeMap);

        return getTopTitleByUrl(e.urlAfterRedirects, this.routeMap)
      }),
      shareReplay(1)
    );
    
    this.currentUser$ = this.userSrv.curUser$
    .pipe(
      tap((user: User) => {      
        // console.log('\tPIPE: AppComponent.ngOnInit() user: %s', user ? user.uid : 'NULL');

      })
    );
    
    this.ngFireAuth.setPersistence('local')
    .then(() => {
      // console.log('\tTHEN: AppComponent.ngOnInit().setPersistence(local): OK');
    })
    .catch(error =>  {
      console.log('\tCATCH: AppComponent.ngOnInit().setPersistence(local):ERROR %O', error);
    });

    // ----------------- ngOnInit()
  }

  logout() {
    this.userSrv.logoutUser();
    // this.router.navigateByUrl('/');
  }
}
// --------------------------------------------------------------------------------

export function createTopRouteMap(routes: PageRoutes) {
  const flatCopy = [];
  routes.forEach((item: PageRoute) => item.data.forEach(it => flatCopy.push(it)) );
  const rs = flatCopy.reduce((acc: { [key: string]: string }, route) => {
    return { ...acc, [route.pathRegex]: route.topNavTitle };
  }, {});
  return rs;
}
export function createLeftRouteArray(routes: PageRoutes) {
  const flatCopy1 = [];
  routes.forEach((item: PageRoute) => item.data.forEach(it => {
    if (it.isLeftNav) {
      flatCopy1.push({path: item.path, title: it.leftNavTitle, order_id: it.orderId});
    }
  }));
  return flatCopy1;
}
export function getTopTitleByUrl(url: string, routeMapObject: {[key: string]: string}): {title: string} {
  const routeEntryArr = Object.entries(routeMapObject);
  const foundEntry = routeEntryArr.find((entry: [string, string]) =>
    RegExp(entry[0]).test(url)
  );
  if (foundEntry) {
    return {title: foundEntry[1]};
  } else {
      return {title: 'N/A'};
  }
}
