import { ProjectInterface, WrongProject } from './project.interface';
export interface TaskInterface {
    task_id?: string;
    project_id?: string;
    title: string;
    description: string;
    done: boolean;
    create_at?: any;
    modify_at?: any;

 }
export const WrongTask: TaskInterface = {
    task_id: '00000000-0000-0000-0000-000000000000',    
    title: 'WRONG',
    description: 'WRONG',
    done: false
  };

export const WrongTaskArray: TaskInterface[] = [WrongTask];

export interface TaskArrayByProjectInterface {
  project: ProjectInterface;
  tasks: TaskInterface[];
}
export const WrongTaskArrayByProject: TaskArrayByProjectInterface = {
  project: WrongProject,
  tasks: WrongTaskArray
};

export type TaskListFilterType = 'init' | 'all' | 'open' | 'done';

