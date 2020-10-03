import { Observable } from 'rxjs';

export interface ProjectInterface {
    project_id?: string;
    user_id: string;
    title: string;
    description: string;
    create_at?: any;
    modify_at?: any;
 }
 export const WrongProject: ProjectInterface = {
  user_id: 'WRONG',
  title: 'WRONG',
  description: 'WRONG'
};
export const WrongProjectArray: ProjectInterface[] = [WrongProject];

export enum ProjectStateEnum {
  NOSET = 'NOSET',
  LOAD = 'LOAD',
  ADD = 'ADD',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  WRONG = 'WRONG'
}
export enum ChangeResultEnum {
  NOSET = 'NOSET',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}
export enum MessageTypeEnum {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}
export interface IsProjectsChangedInterface {
  op: ProjectStateEnum;
  isEnd: boolean;
  opResult: ChangeResultEnum;
  project?: ProjectInterface | ProjectInterface[];
  messageType?: MessageTypeEnum;
  message?: string;
}
export interface ProjectStateInterface {
  context: string;
  isProjectsChanged$: Observable<IsProjectsChangedInterface>;
  isProjectsChangedValue: IsProjectsChangedInterface;

  resetIsProjectsChanged(): void;
  completeIsProjectsChanged(): void;
  nextIsProjectsChanged(state: IsProjectsChangedInterface): void;
}
export interface OpStateInterface {
  op: string;
  isEnd: boolean;
  opResult: string;
}
