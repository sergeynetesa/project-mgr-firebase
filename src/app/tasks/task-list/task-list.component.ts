import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

import { Router, ActivatedRoute, Params } from '@angular/router';

import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { tap, map, switchMap, filter, switchMapTo } from 'rxjs/operators';

import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatSnackBar, SimpleSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

import { UserService } from '../../shared/services/user.service';

import { User } from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';

import { ProjectInterface } from 'src/app/shared/model/project.interface';

import { TaskInterface, TaskListFilterType } from 'src/app/shared/model/task.interface';

@Component({
  selector: 'app-tasks',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],                
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListComponent implements OnInit, OnDestroy {
  public currentUser$: Observable<User|null> = null;

  currentProject$: Observable<ProjectInterface> = null;
  currentProject: ProjectInterface = null;
  currentProjectId = '-1';

  curProjectFromRoute$: Observable<ProjectInterface> = null;
  
  curTasksFromRoute$: Observable<TaskInterface[]> = null;
  currentTaskList: TaskInterface[] = null;

  // private onDestroySub$ = new Subject<boolean>();

  filteredTasks$: Observable<TaskInterface[]>;
  taskFilterTypes: TaskListFilterType[] = ['init', 'all', 'open', 'done'];
  private  activeTaskFilterTypeSub$ = new BehaviorSubject<TaskListFilterType>('all');
  activeTaskFilterType$ = this.activeTaskFilterTypeSub$.asObservable();

  // --------------------------------------------------------------
  private simpleSnackBarRef: MatSnackBarRef<SimpleSnackBar> = null;

  // --------------------------------------------------------------
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    protected userSrv: UserService,
    public readonly ngFireStore: AngularFirestore, 
    private snackBarSrv: MatSnackBar

  ) {
    // tasksStateSrv.context = 'TasksComponent';
  }

  ngOnInit() {
    const that = this;

    this.currentUser$ = this.userSrv.curUser$
    .pipe(
      tap((user: User) => {
        // console.log('\tPIPE: TaskListComponent.ngOnInit() user: %s', user ? user.uid : 'NULL');
        if (!user) {
          this.router.navigate(['/login-signup']);
        }
      })
    );
    // --------------------

    if (!this.route.parent) {
      return;       // test ???
    }

    this.curTasksFromRoute$ = this.userSrv.curUser$    
    .pipe(
      filter((user: User) => user != null),
      switchMapTo(this.route.parent.params), 
      map((params: Params) => params.prj_id),
      tap((projectId: string) => {
        this.currentProjectId = projectId;
      }),
      switchMap((projectId: string) => {
        // console.log('\tPIPE: TaskListComponent.ngOnInit().switchMap projectId: %s', projectId);

        if (projectId && projectId.length !== 0 && projectId === '0000000') {
          // this.prjState  = ProjectStateEnum.ADD;
          throw new Error('Route parameter [prj_id] has value 0');

        } else if (projectId && projectId.length !== 0 && projectId != '0000000') {
          // this.prjState = ProjectStateEnum.UPDATE;
          
          const projectDocRef = this.ngFireStore.doc<ProjectInterface>(`projects/${projectId}`);
          const tasksRef = projectDocRef.collection<TaskInterface>('tasks', 
                        ref => ref.orderBy('create_at'));
          const tasks =  tasksRef.valueChanges({idField: 'task_id'});
          return tasks;           
        }
      }),      
      tap((tasks: TaskInterface[]) => {
        // console.log('\tPIPE: TaskListComponent.ngOnInit() TAP Tasks$: %O', tasks);

      })
    );
    // --------------------
    this.filteredTasks$ = combineLatest([this.curTasksFromRoute$, this.activeTaskFilterType$])
      .pipe(
        map(([taskArray, activeTaskFilterType]) => {
          return [taskArray, activeTaskFilterType] as
                      [TaskInterface[], TaskListFilterType];
          }),
        map(([tasks, activeTaskFilterType]) => {
          return tasks.filter((task: TaskInterface) => {
            if (activeTaskFilterType === 'all') {
              return true;
            } else if (activeTaskFilterType === 'open') {
              return !task.done;
            } else {
              return task.done;
            }
          });
        })
    );

    // -----------------------------  ngOnInit()  ------------------------------------------
  }
  activateFilterType(e: MatButtonToggleChange) {
    this.activeTaskFilterTypeSub$.next(e.value);
  }

  addTask(): void {
    const url = `/projects/${this.currentProjectId}/tasks/0000000`;
    this.router.navigateByUrl(url);
  }

  editTask(task: TaskInterface) {
    this.router.navigate(['/projects', this.currentProjectId, 'tasks', task.task_id]);
  }
  // ---------------------------------------------
  ngOnDestroy() {
    // this.taskSrv.emptyTasks();  // ???

    if (this.simpleSnackBarRef != null) {
      this.simpleSnackBarRef.dismiss();
      this.simpleSnackBarRef = null;
    }
  }
}
