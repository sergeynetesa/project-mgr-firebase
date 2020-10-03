import { Route } from '@angular/router';

import { AuthGuard } from './shared/guard/auth.guard';

import { SignupFormComponent } from './auth/signup-form/signup-form.component';
import { ProjectListComponent } from './projects/project-list/project-list.component';
import { ProjectEditComponent } from './projects/project-edit/project-edit.component';

import { TaskListComponent } from './tasks/task-list/task-list.component';
import { TaskEditComponent } from './tasks/task-edit/task-edit.component';

// import { AboutComponent } from './home-pages/about/about.component';

import { PageNotFoundComponent } from './home-pages/page-not-found.component';
import { AppDetailsComponent } from './home-pages/app-details/app-details.component';

export interface PageRoute extends Route {
  data: {
    readonly pathRegex: string;
    readonly leftNavTitle: string;
    readonly topNavTitle: string;
    readonly isLeftNav: boolean;
    readonly orderId: number;
  }[];
}

export type PageRoutes = PageRoute[];

export const PAGE_ROUTES: PageRoutes = [
  {
    path: 'about',
    component: AppDetailsComponent,
    data: [{
      pathRegex: '^\/about$',
      leftNavTitle: 'About',
      topNavTitle: 'About Application',
      isLeftNav: true,
      orderId: 0
    }],
    // canActivate: [AuthGuard]
  }
  , {
    path: 'projects',
    component: ProjectListComponent,
    pathMatch: 'full',
    data: [{
      pathRegex: '^\/projects$',
      leftNavTitle: 'Projects',
      topNavTitle: 'Projects',
      isLeftNav: true,
      orderId: 1
    }],
    // canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always'     
  }
  , {
    path: 'projects/:prj_id',
    component: ProjectEditComponent,
    // pathMatch: 'full', // not used with children: []
    data: [{
      pathRegex: '^\/projects\/0{7}$',
      leftNavTitle: 'Add New Project',
      topNavTitle: 'Add Project',
      isLeftNav: false,
      orderId: 2
    }, {
      pathRegex: '^\/projects\/[^/]{1,1500}\/tasks$',
      leftNavTitle: 'Project Edit',
      topNavTitle: 'Edit Project',
      isLeftNav: false,
      orderId: 2
      }
    ],
    // canActivate: [AuthGuard],
    children: [
      {
        path: 'tasks',
        component: TaskListComponent
      },
    ]
  }
  , {
    path: 'projects/:prj_id/tasks/:task_id',
    component: TaskEditComponent,
    // pathMatch: 'full',
    data: [{
      pathRegex: '^\/projects\/[^/]{1,1500}\/tasks\/0{7}$',
      leftNavTitle: 'Add New Task',
      topNavTitle: 'Add Task',
      isLeftNav: false,
      orderId: 3
    }, {
      pathRegex: '^\/projects\/[^/]{1,1500}\/tasks\/[^/]{1,1500}$',
      leftNavTitle: 'Task Edit',
      topNavTitle: 'Edit Task',
      isLeftNav: false,
      orderId: 3
      }
    ],
    // canActivate: [AuthGuard]
  }
  , {
    path: 'login-signup',
    component: SignupFormComponent,
    data: [{
      pathRegex: '^\/login-signup$',
      leftNavTitle: 'Login / Signup',
      topNavTitle: 'Login / Signup',
      isLeftNav: true,
      orderId: 6
    }]
  }  
  // , {
  //   path: 'help',
  //   component: AboutComponent,
  //   data: [{
  //     pathRegex: '^\/help$',
  //     leftNavTitle: 'Help',
  //     topNavTitle: 'Help',
  //     isLeftNav: true,
  //     orderId: 7
  //   }]
  // }
  ,  { path: '',   redirectTo: '/about', pathMatch: 'full', data: [] }
  ,  { path: '**',   component: PageNotFoundComponent, data: [] },
];
1