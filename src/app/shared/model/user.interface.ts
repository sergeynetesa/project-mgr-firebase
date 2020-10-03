import { Observable } from 'rxjs';

export interface UserInterface {
    name: string;
    email: string;
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
  
export enum UserStateEnum {
    NOSET = 'NOSET',
    // ADD = 'ADD',
    // UPDATE = 'UPDATE',
    // DELETE = 'DELETE',
    SIGNUP = 'SIGNUP',
    LOGIN = 'LOGIN'
}
export interface IsUserChangedInterface {
    op: UserStateEnum;
    isEnd: boolean;
    opResult: ChangeResultEnum;
    messageType?: MessageTypeEnum;
    message?: string;
    user_email?: string,
}
export interface UserStateInterface {
    context: string;
    isUserChanged$: Observable<IsUserChangedInterface>;
    isUserChangedValue: IsUserChangedInterface;
    reset(): void;
    complete(): void;
    next(state: IsUserChangedInterface): void;
  }
