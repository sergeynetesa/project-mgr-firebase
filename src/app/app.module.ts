import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FormsModule } from '@angular/forms';

import {AngularFireModule} from "@angular/fire";
import {AngularFireAuthModule} from "@angular/fire/auth";
import {AngularFirestoreModule, SETTINGS} from "@angular/fire/firestore"; 

import { NgMaterialModule } from './shared/ng-material.module';

import { AuthModule } from './auth/auth.module';
import { ProjectsModule }  from './projects/projects.module';
import { TasksModule }  from './tasks/tasks.module';

import {environment} from '../environments/environment'; 
  
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AppDetailsComponent } from './home-pages/app-details/app-details.component';
import { PageNotFoundComponent } from './home-pages/page-not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    AppDetailsComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,

    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    NgMaterialModule,
    
    AppRoutingModule,
    AuthModule,
    ProjectsModule,
    TasksModule,
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
