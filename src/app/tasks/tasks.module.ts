import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 

// Form Controls

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

// Navigation
//
import { MatToolbarModule } from '@angular/material/toolbar';

// Layout
//
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

// Buttons & Indicators
//
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Popups & Modals
//
import { MatDialogModule } from '@angular/material/dialog';

import { TaskListComponent } from './task-list/task-list.component';
import { TaskEditComponent } from './task-edit/task-edit.component';

@NgModule({
  declarations: [
    TaskListComponent,
    TaskEditComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,

    FormsModule,
    ReactiveFormsModule,
    
    MatButtonToggleModule,
    MatButtonModule,
    MatCheckboxModule,    
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule, 

    MatCardModule,
    MatListModule,
    MatIconModule,
    
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatDialogModule,
  ]
})
export class TasksModule { }
