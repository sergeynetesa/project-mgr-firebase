import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router, NavigationEnd, RouterEvent } from '@angular/router';

import { Observable } from 'rxjs';
import { tap, map, filter, switchMap } from 'rxjs/operators';

import { MatSnackBar, SimpleSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

import { User } from 'firebase';

import {AngularFirestore, AngularFirestoreCollection, DocumentChangeAction} 
          from "@angular/fire/firestore"; 

import { UserService } from '../../shared/services/user.service';

import { ProjectInterface, IsProjectsChangedInterface,
  ProjectStateEnum, ChangeResultEnum, OpStateInterface } from 'src/app/shared/model/project.interface';

@Component({
  selector: 'app-projects',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectListComponent implements OnInit, OnDestroy {
  public routerEvents$: Observable<RouterEvent> = null; 

  public currentUser$: Observable<User|null> = null;
  public currentProjects$: Observable<ProjectInterface[]> = null;

  // --------------------------------------------------------------
  private simpleSnackBarRef: MatSnackBarRef<SimpleSnackBar> = null;
  // --------------------------------------------------------------
  

  JSON_safeStringify(obj, indent = 2) {
    let cache = [];
    const retVal = JSON.stringify(
      obj,
      (key, value) =>
        typeof value === "object" && value !== null
          ? cache.includes(value)
            ? undefined // Duplicate reference found, discard key
            : cache.push(value) && value // Store value in our collection
          : value,
      indent
    );
    cache = null;
    return retVal;
  }; 

  constructor(
    private router: Router,
    public readonly ngFireStore: AngularFirestore, 
    protected userSrv: UserService,
    private snackBarSrv: MatSnackBar
  ) {

  }

  ngOnInit() {
    const that = this;
    
    this.routerEvents$ = this.router.events
    .pipe(
      filter(e => e instanceof NavigationEnd),
      tap((e: NavigationEnd) => {
        // console.log('\tPIPE: ProjectListComponent.ngOnInit().routerEvents$: %O ', e);
        
      }),
      // shareReplay(1)
    );
    
    this.currentUser$ = this.userSrv.curUser$
    .pipe(
      tap((user: User) => {
        // console.log('\tPIPE: ProjectListComponent.ngOnInit() User$: %s', user ? user.uid : 'NULL');
        if (!user) {          
          this.router.navigate(['/login-signup']);
        }
      })
    );
    
   this.currentProjects$ = this.userSrv.curUser$
   .pipe(
     filter((user: User) => user != null),
     switchMap((user: User) => {
      const projectsRef = this.ngFireStore.collection<ProjectInterface>('projects', 
                ref => ref.where('user_id', '==', user.uid).orderBy('create_at'));
      return projectsRef.valueChanges({idField: 'project_id'}) 
     }),
     tap((projects: ProjectInterface[]) => {
      // console.log('\tPIPE: ProjectListComponent.ngOnInit() Projects$: %O', projects);

    })
   );

   // -------------------- ngOnInit() --------------------------------------------
  }
  // reloadPage() {
  //   this.router.navigate([`/projects`]);
  // }
  addProject() {
    this.router.navigate([`/projects`, '0000000']);
  }
  editProject(project: ProjectInterface): void {
    this.router.navigate([`/projects`, project.project_id, 'tasks']);
  }

  ngOnDestroy() {
    if (this.simpleSnackBarRef != null) {
      this.simpleSnackBarRef.dismiss();
      this.simpleSnackBarRef = null;
    }
  }
}
