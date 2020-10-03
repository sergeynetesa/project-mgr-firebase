import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 

// Form Controls

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

//
// Navigation
//
import { MatToolbarModule } from '@angular/material/toolbar';

//
// Layout
//
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

//
// Buttons & Indicators
//
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

//
// Popups & Modals
//
import { MatDialogModule } from '@angular/material/dialog';


import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectEditComponent } from './project-edit/project-edit.component';
import { ConfirmDialogComponent }  from '../dialogs/confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [
    ProjectListComponent,
    ProjectEditComponent,
    ConfirmDialogComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    
    FormsModule,
    ReactiveFormsModule, 
    
    MatCheckboxModule,    
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule, 

    MatCardModule,
    MatListModule,
    MatIconModule,
    
    MatButtonModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatDialogModule,

  ]
})
export class ProjectsModule {}
