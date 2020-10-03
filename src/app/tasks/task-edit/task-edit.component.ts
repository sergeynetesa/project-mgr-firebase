import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { Observable, Subject, of } from 'rxjs';
import { map, tap, switchMap, filter, switchMapTo } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, SimpleSnackBar, MatSnackBarRef, MatSnackBarDismiss } 
          from '@angular/material/snack-bar';

import * as firebase from "firebase/app";
import { User } from 'firebase';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';

import { UserService } from '../../shared/services/user.service';

import { ProjectInterface, ProjectStateEnum, 
        IsProjectsChangedInterface, WrongProject, ChangeResultEnum, OpStateInterface } 
        from '../../shared/model/project.interface';
// import { ProjectService } from '../../shared/services/project.service';

// import { ProjectStateService } from 'src/app/shared/services/project-state.service';

import { TaskInterface, WrongTask } from 'src/app/shared/model/task.interface';
// import { TaskService } from 'src/app/shared/services/task.service';

import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.scss'],
  // providers: [
  //   ProjectStateService
  // ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskEditComponent implements OnInit, OnDestroy {
  taskFG: FormGroup;
  taskState = ProjectStateEnum.NOSET;

  get form_title(): string {
    if (this.taskState === ProjectStateEnum.ADD) {
      return 'Add New Task Information';
    } else if (this.taskState === ProjectStateEnum.UPDATE) {
      return 'Edit Task Information';
    } else if (this.taskState === ProjectStateEnum.NOSET) {
      return 'N/A';
    }
  }
  get form_btn_title(): string {
    if (this.taskState === ProjectStateEnum.ADD) {
      return 'ADD TASK';
    } else if (this.taskState === ProjectStateEnum.UPDATE) {
      return 'UPDATE TASK';
    } else if (this.taskState === ProjectStateEnum.DELETE) {
      return 'UPDATE TASK';
    } else if (this.taskState === ProjectStateEnum.NOSET) {
      return 'N/A';
    }
  }
  get task_title() { return this.taskFG.get('task_title'); }
  get task_desc() { return this.taskFG.get('task_desc'); }
  get task_done() { return this.taskFG.get('task_done'); }

  get task_state() { return this.taskState.toString(); }
  // --------------------------------------------------------------
  public currentUser$: Observable<User|null> = null;

  currentProject$: Observable<ProjectInterface> = null;
  currentProject: ProjectInterface = null;
  currentProjectId = '-1';

  formSubtitle = 'Project: N/A';

  curProjectFromRoute$: Observable<ProjectInterface> = null;
  // ---------------------------------------
  currentTasks$: Observable<TaskInterface[]> = null;

  curTaskFromRoute$: Observable<TaskInterface> = null;
  currentTask: TaskInterface = null;
  currentTaskId = '-1';

  isProjectTaskSubscribe = false;
  // --------------------------------------------------------------
  // public isTaskChanged$: Observable<OpStateInterface> = null;
  private onDestroySub$ = new Subject<boolean>();
  private simpleSnackBarRef: MatSnackBarRef<SimpleSnackBar> = null;

  constructor(  // ---------- constructor() ----------------------
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public readonly ngFireStore: AngularFirestore,
    protected userSrv: UserService,
    // protected projectSrv: ProjectService,
    // protected taskSrv: TaskService,
    // protected taskStateSrv: ProjectStateService,
    private snackBarSrv: MatSnackBar
  ) {
    // taskStateSrv.context = 'TaskEditComponent';
  }

  ngOnInit() {  // ---------- ngOnInit() ----------------------
    this.taskFG = this.fb.group({
      task_title: ['', {
        validators: [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(64)
        ], updateOn: 'change' }
      ],
      task_desc: ['', {
      validators: [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(256)
        ], updateOn: 'change' }
      ],
      task_done: ['', {
        validators: [
          Validators.required
          ], updateOn: 'change' }
        ]
    });
    // --------------------------------
    this.currentUser$ = this.userSrv.curUser$
    .pipe(
      tap((user: User) => {
        // console.log('\tPIPE: TaskEditComponent.ngOnInit() this.currentUser$: %s', user ? user.uid : 'NULL');
        if (!user) {
          this.router.navigate(['/login-signup']);
        }
      })
    );
    // --------------------------------
    this.isProjectTaskSubscribe = true;
    const that = this;

    this.curProjectFromRoute$ = this.userSrv.curUser$
    .pipe(
      filter((user: User) => user != null),
      switchMapTo(this.route.paramMap),
      map((params: ParamMap) => params.get('prj_id')),
      switchMap((projectId: string) => {
        // console.log('\tPIPE: TAskEditComponent.ngOnInit().switchMap projectId: %s', projectId);

        if (projectId && projectId.length !== 0 && projectId === '0000000') {
          throw new Error('Route parameter [prj_id] has value 0000000');

        } else if (projectId && projectId.length !== 0 && projectId != '0000000') {

         that.currentProjectId = projectId;

         const projectDocRef = this.ngFireStore.doc<ProjectInterface>(`projects/${projectId}`);
         return projectDocRef.valueChanges();
        }
      }),
      tap((project: ProjectInterface) => {
        if(project) {          
          that.currentProject = project;
          that.formSubtitle = `Project: ${project.title}`;
        } else {

        }
      })
    );
    // --------------------------------
    this.curTaskFromRoute$ = this.userSrv.curUser$
    .pipe(
      filter((user: User) => user != null),
      switchMapTo(this.route.paramMap),
      map((params: ParamMap) => params.get('task_id')),
      switchMap((taskId: string) => {
        // console.log('\tPIPE: TAskEditComponent.ngOnInit().switchMap taskId: %s', taskId);

        if (taskId && taskId.length !== 0 && taskId === '0000000') {
          this.taskState  = ProjectStateEnum.ADD;
          this.currentTaskId = '0000000';
          return of<TaskInterface>({
            project_id: this.currentProjectId,
            title: '',
            description: '',
            done: false
          });
        } 
        this.taskState = ProjectStateEnum.UPDATE;
        this.currentTaskId = taskId;
        
        const taskDocRef = 
          this.ngFireStore.doc<TaskInterface>(`projects/${that.currentProjectId}/tasks/${taskId}`);        

        return taskDocRef.valueChanges();
      }),
      tap((curTask: TaskInterface) => {
        if(curTask) {
          this.currentTask = curTask;
    
          this.taskFG.patchValue({
            task_desc: curTask.description,
            task_title: curTask.title,
            task_done: curTask.done
          });
                    
        } else {
          this.taskState = ProjectStateEnum.WRONG;            
        }
      })
    );

    // --------------------eof ngOnInit()  -----------------------------
  }
  // --------------------------------------------------------------
  onTaskSubmit({ value, valid }: { value: any, valid: boolean }) {
    if (valid) {
      const that = this;
      let t: TaskInterface = null;
      if (this.taskState === ProjectStateEnum.ADD) {
        const ts = firebase.firestore.FieldValue.serverTimestamp();

        this.ngFireStore.collection(`projects/${that.currentProjectId}/tasks`).add({
          title: value.task_title,
          description: value.task_desc,
          done: value.task_done,
          create_at: ts,
          modify_at: ts
        })
        .then( docRef => {
          // console.log("\tTHEN: Task document written with ID: ", docRef.id);

          that.simpleSnackBarRef =
            that.snackBarSrv.open(`OK: Task has been created!`,
            '', {
            duration: 1500,
            panelClass: 'mat-snack-bar-container_info'
          });
          that.simpleSnackBarRef.afterDismissed()
          .subscribe(
          (res: MatSnackBarDismiss) => {
              // if (res.dismissedByAction) {
              //   this.router.navigate(['projects/']);
              // }
              that.router.navigateByUrl(`/projects/${that.currentProjectId}/tasks`);
            }
          );
        })
        .catch(error => {
          // console.error("\tCATCH: Error adding Task document: ", error);

          that.simpleSnackBarRef = that.snackBarSrv.open(`ERROR:  adding Task document`,
            'X', {
            duration: 0,
            panelClass: 'mat-snack-bar-container_err'
            });
        });
      } else if (this.taskState === ProjectStateEnum.UPDATE) {
        const ts = firebase.firestore.FieldValue.serverTimestamp();
        const taskDocRef = 
          this.ngFireStore.doc<TaskInterface>(`projects/${that.currentProjectId}/tasks/${that.currentTaskId}`);
        t = {
          title: value.task_title,
          description: value.task_desc,
          done: value.task_done,
          modify_at: ts
        };
        taskDocRef.update(t)
        .then(_ => {
          // console.log('\tTHEN: Task has been updated');

          that.simpleSnackBarRef =
            that.snackBarSrv.open(`OK: Task has been updated!`,
            '', {
            duration: 1500,
            panelClass: 'mat-snack-bar-container_info'
          });
          that.simpleSnackBarRef.afterDismissed()
          .subscribe(
          (res: MatSnackBarDismiss) => {
              // if (res.dismissedByAction) {
              //   this.router.navigate(['projects/']);
              // }
              that.router.navigateByUrl(`/projects/${that.currentProjectId}/tasks`);
            }
          );
        })
        .catch(error =>  {
          console.error("\tCATCH: Error updating Task %O", error);

          that.simpleSnackBarRef = that.snackBarSrv.open(`ERROR: updating Task document`,
            'X', {
            duration: 0,
            panelClass: 'mat-snack-bar-container_err'
            });
        });
      }
    }
  }
  deleteTaskWithConfirm(task = this.currentTask) {
    this.taskState = ProjectStateEnum.DELETE;

    // console.log('TaskEditComponent.deleteTaskWithConfirm() form_title: %s', this.form_title);

    const confirmDialogData = {
      title: 'Confirm Delete Task',
      content: `Are you sure to delete '${task.title}' Task?`,
      cancel: 'Cancel',
      ok: 'Delete'
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: confirmDialogData,
      disableClose: true,
    });
    dialogRef.afterClosed()
    .subscribe(
      (r: boolean) => {
          if (r) {
            // console.log('INNER: TaskEditComponent.deleteTaskWithConfirm() form_title: %s', this.form_title);
            this.isProjectTaskSubscribe = false;
            this.deleteTask(task);
        }
      }
    );
  }
  deleteTask(task: TaskInterface) {

    const qPath = `projects/${this.currentProjectId}/tasks/${this.currentTaskId}`;
    const taskDocRef = this.ngFireStore.doc<TaskInterface>(qPath);
    
    // console.log('INNER #1: TaskEditComponent.deleteTask() form_title: %s', this.form_title);

    const that = this;
    taskDocRef.delete()
    .then(_ => {
      // console.log('\tTHEN: Task has been deleted');
      // console.log('INNER #2: TaskEditComponent.deleteTask() form_title: %s', that.form_title);

      that.simpleSnackBarRef =
        that.snackBarSrv.open(`OK: Task has been deleted!`,
        '', {
        duration: 1500,
        panelClass: 'mat-snack-bar-container_info'
      });
      that.simpleSnackBarRef.afterDismissed()
      .subscribe(
      (res: MatSnackBarDismiss) => {
          // if (res.dismissedByAction) {
          //   this.router.navigate(['projects/']);
          // }
          that.router.navigateByUrl(`/projects/${that.currentProjectId}/tasks`);
        }
      );
    })
    .catch(error =>  {
      // console.error("\tCATCH: Error #2 deleting Task %O", error);

      that.simpleSnackBarRef = that.snackBarSrv.open(`ERROR: deleting Task document`,
        'X', {
        duration: 0,
        panelClass: 'mat-snack-bar-container_err'
        });
    });    
  }
  // --------------------------------------------------------------------------
  ngOnDestroy() {
    // this.taskSrv.emptyTasks();   // ???

    if (this.simpleSnackBarRef != null) {
      this.simpleSnackBarRef.dismiss();
      this.simpleSnackBarRef = null;
    }
  }
  // ------------------------------------------------------------
}
