import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { Observable, of } from 'rxjs';
import { map, tap, switchMap, filter, switchMapTo } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, SimpleSnackBar, MatSnackBarRef,
          MatSnackBarDismiss} from '@angular/material/snack-bar';

import { UserService } from '../../shared/services/user.service';

import * as firebase from "firebase/app";
import { User } from 'firebase';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';

import { ProjectInterface, ProjectStateEnum } from '../../shared/model/project.interface';


import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-project-edit',
  templateUrl: './project-edit.component.html',
  styleUrls: ['./project-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectEditComponent implements OnInit, OnDestroy {
  projectFG: FormGroup;
  prjState = ProjectStateEnum.NOSET;
  // Accessors
  get form_title(): string {
    if (this.prjState === ProjectStateEnum.ADD) {
      return 'Add New Project Information';
    } else if (this.prjState === ProjectStateEnum.UPDATE) {
      return 'Edit Project Information';
    } else if (this.prjState === ProjectStateEnum.NOSET) {
      return 'N/A Project Information';
    }
  }
  get form_btn_title(): string {
    if (this.prjState === ProjectStateEnum.ADD) {
      return 'ADD PROJECT';
    } else if (this.prjState === ProjectStateEnum.UPDATE) {
      return 'UPDATE PROJECT';
    } else if (this.prjState === ProjectStateEnum.DELETE) {
      return 'UPDATE PROJECT';
    } else if (this.prjState === ProjectStateEnum.NOSET) {
      return 'N/A';
    }
  }
  get project_title() { return this.projectFG.get('project_title'); }
  get project_desc() { return this.projectFG.get('project_desc'); }
  
  get project_state() { return this.prjState.toString(); }
  // --------------------------------------------------------------
  private simpleSnackBarRef: MatSnackBarRef<SimpleSnackBar> = null;
  // --------------------------------------------------------------
  public currentUser$: Observable<User|null> = null;
  
  private projectDocRef: AngularFirestoreDocument<ProjectInterface>;
  curProjectFromRoute$: Observable<ProjectInterface> = null;
  curProject: ProjectInterface = null;
  curProjectId = '-1';

  // public isProjectsChanged$: Observable<IsProjectsChangedInterface> = null;

// --------------------------------------------------------------
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public readonly ngFireStore: AngularFirestore, 
    protected userSrv: UserService,
    private snackBarSrv: MatSnackBar
  ) {

  }

// --------------------------------------------------------------
  ngOnInit() {
    this.projectFG = this.fb.group({
      project_title: ['', {
        validators: [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(64)
        ], updateOn: 'change' }
      ],
      project_desc: ['', {
      validators: [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(256)
        ], updateOn: 'change' }
      ]
    });
    // -----------------------------

    this.currentUser$ = this.userSrv.curUser$
    .pipe(
      tap((user: User) => {
        // console.log('\tPIPE: ProjectEditComponent.ngOnInit() this.currentUser$: %s', user ? user.uid : 'NULL');
        if (!user) {
          this.router.navigate(['/login-signup']);
        }
      })
    );
    // -----------------------------

    this.curProjectFromRoute$ = this.userSrv.curUser$   
    .pipe(
      filter((user: User) => user != null),
      switchMapTo(this.route.paramMap),
      map((params: ParamMap) => params.get('prj_id')),
      switchMap((projectId: string) => {
        // console.log('\tPIPE: ProjectEditComponent.ngOnInit().switchMap this.curProjectFromRoute$: %s', projectId);

        if (projectId && projectId.length !== 0 && projectId === '0000000') {
          this.prjState  = ProjectStateEnum.ADD;
          this.curProjectId = '';

          return of<ProjectInterface>({user_id: this.userSrv.getCurUserId(), title: '', description: ''});

        } else if (projectId && projectId.length !== 0 && projectId != '0000000') {
          this.prjState = ProjectStateEnum.UPDATE;
          this.curProjectId = projectId;

          this.projectDocRef = this.ngFireStore.doc<ProjectInterface>(`projects/${projectId}`);
          return this.projectDocRef.valueChanges();          
        }
      }),
      tap((p: ProjectInterface) => {
        // console.log('\tPIPE: ProjectEditComponent.ngOnInit().TAP this.curProjectFromRoute$: %O', p);
  
        this.curProject = p;
        if(this.curProject) {
          this.projectFG.patchValue({
            project_desc: p.description,
            project_title: p.title
          });
        }
      })
    );
      
    // --------------------- eof ngOnInit() -------------------------
  }

  onProjectSubmit({ value, valid }: { value: any, valid: boolean }) {
    if (valid) {      
      const user = this.userSrv.curUser;
      if (!user) {
        throw new Error('User is null');          
      }      
      const that = this;
      const ts = firebase.firestore.FieldValue.serverTimestamp();

      this.curProject.title = value.project_title;
      this.curProject.description = value.project_desc;    
    
      if (this.prjState === ProjectStateEnum.ADD) {        
        this.curProject.create_at = ts;
        this.curProject.modify_at = ts;
  
        this.ngFireStore.collection("projects").add(this.curProject)
        .then( docRef => {
          // console.log("\tTHEN: Project Document written with ID: ", docRef.id);

          that.simpleSnackBarRef =
            that.snackBarSrv.open(`OK: Project has been created!`,
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
              that.router.navigateByUrl('/projects');
            }
          );
        })
        .catch(error => {
          // console.error("\tCATCH: Error adding Project document: ", error);

          that.simpleSnackBarRef = that.snackBarSrv.open(`ERROR:  adding Project document`,
            'X', {
            duration: 0,
            panelClass: 'mat-snack-bar-container_err'
            });
        });

      } else if (this.prjState === ProjectStateEnum.UPDATE) {
        this.curProject.modify_at = ts;

        this.projectDocRef.update(this.curProject)
        .then(_ => {
          // console.log('\tTHEN: Project has been updated');

          that.simpleSnackBarRef =
            that.snackBarSrv.open(`OK: Project has been updated!`,
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
              that.router.navigateByUrl('/projects');
            }
          );
        })
        .catch(error =>  {
          // console.error("\tCATCH: Error updating Project %O", error);

          that.simpleSnackBarRef = that.snackBarSrv.open(`ERROR: updating Project document`,
            'X', {
            duration: 0,
            panelClass: 'mat-snack-bar-container_err'
            });
        });
      }
    }
  }

  private alertMessageOutput(project: ProjectInterface, taskNumber: number) {
    const alertDialogData = {
      title: 'Project has Tasks',
      content: 'The Project has Tasks! Project deleting is prohibited.',
      cancel: '',
      ok: 'OK'
    };
    const alertRef = this.dialog.open(ConfirmDialogComponent, {
      data: alertDialogData,
      disableClose: true,
    });
    alertRef.afterClosed()
    .subscribe(
      (r: boolean) => {
          return;
      }
    );
  }
  
  deleteProjectWithConfirm(project = this.curProject): void {
    const qs = `projects/${this.curProjectId}/tasks`;
    // console.log('ENTER ProjectEditComponent.deleteProjectWithConfirm curProject: %O query: %s', project, qs);

    const that = this;
    this.ngFireStore.firestore.collection(qs).get()
    .then(querySnap => {
      const querySnapSize = querySnap.size; 
      // console.log('\tTHEN: ProjectEditComponent.deleteProjectWithConfirm querySnapSize: %s', querySnapSize);

      if(querySnapSize > 0) {
        that.alertMessageOutput(project, querySnap.size);
        return false;
      } else if (querySnapSize === 0) {
        return true;
      }
    })
    .then((isDelete: boolean) => {
      if (isDelete) {
      const confirmDialogData = {
          title: 'Confirm Delete Project',
          content: `Are you sure to delete '${project.title}' Project?`,
          cancel: 'CANCEL',
          ok: 'DELETE'
        };
      const dialogRef = that.dialog.open(ConfirmDialogComponent, {
        data: confirmDialogData,
        disableClose: true,
      });
      dialogRef.afterClosed()
      .subscribe(
        (r: boolean) => {
            if (r) {
              that.deleteProject(project);
          }
        });
      }
    })
    .catch(error =>  {
      // console.error("\tCATCH: Error #1 deleting Project %O", error);

      that.simpleSnackBarRef = that.snackBarSrv.open(`ERROR: deleting Project document`,
        'X', {
        duration: 0,
        panelClass: 'mat-snack-bar-container_err'
        });
    });
  }

  deleteProject(project: ProjectInterface) {
   
    const that = this;
    this.projectDocRef.delete()
    .then(_ => {
      // console.log('\tTHEN: Project has been deleted');

      that.simpleSnackBarRef =
        that.snackBarSrv.open(`OK: Project has been deleted!`,
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
          that.router.navigateByUrl('/projects');
        }
      );
    })
    .catch(error =>  {
      // console.error("\tCATCH: Error #2 deleting Project %O", error);

      that.simpleSnackBarRef = that.snackBarSrv.open(`ERROR: deleting Project document`,
        'X', {
        duration: 0,
        panelClass: 'mat-snack-bar-container_err'
        });
    });

  }

  ngOnDestroy() {
    if (this.simpleSnackBarRef != null) {
      this.simpleSnackBarRef.dismiss();
      this.simpleSnackBarRef = null;
    }
  }
}
