import { Action } from '@ngrx/store';
import {Repository} from '../../models/repository';

export enum ActionTypes {
  GetRepository = '[Repository] Get Repository',
  SetRepository = '[Repository] Set Repository',
}

export class GetRepository implements Action {
  public readonly type = ActionTypes.GetRepository;
}

export class SetRepository implements Action {
  public readonly type = ActionTypes.SetRepository;
  constructor(public payload: Repository ) {}
}


export type UserActions = GetRepository | SetRepository;
