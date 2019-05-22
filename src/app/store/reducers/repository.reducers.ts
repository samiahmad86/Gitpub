import {ActionTypes} from '../actions/repository.action';
import {Repository} from '../../models/repository';
import {UserActions} from '../actions/repository.action';

export interface State {
  repository: Repository;
}

export const initialState: State = {
  repository: null,
};

export function repositoryReducer(state = initialState, action: UserActions) {
  switch (action.type) {
    case ActionTypes.SetRepository:
      return {
        ...state,
        repository: action.payload,
      };
    case ActionTypes.GetRepository :
      return state;
    default:
      return state;
  }
}
