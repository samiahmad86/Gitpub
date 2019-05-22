import { Component, OnInit } from '@angular/core';
import {Repository} from '../../models/repository';
import {Apollo} from 'apollo-angular';
import {GithubService} from '../../services/github.service';
import {Observable} from 'rxjs/index';
import { Store, select } from '@ngrx/store';
import {GetRepository, SetRepository} from '../../store/actions/repository.action';


@Component({
  selector: 'app-heroes',
  templateUrl: './repositories.component.html',
  styleUrls: ['./repositories.component.css']
})
export class RepositoriesComponent implements OnInit {

  repositories: Repository[];
  selectedRepository: Repository;
  private nextCursor = '';
  private hasNextPage = true;

  constructor(private apollo: Apollo, private  githubService: GithubService, private store: Store<{ count: number }>) {
    this.repositories = null;
  }

  ngOnInit() {
   this.githubService.getFirstQuery()
     .subscribe((result) => {
      this.hasNextPage = result.data.search.pageInfo.hasNextPage;
      this.nextCursor = result.data.search.pageInfo.endCursor;
      this.repositories = this._extractRepository(result.data.search.edges);
      });
  }
  private _extractRepository(result) {
   return result.map( (edge) => {
          return {
            name: edge.node.name,
            owner: edge.node.owner.login,
            forkCount: edge.node.forkCount,
            starCount: edge.node.stargazers.totalCount
          };
        } );
  }

  onSelect(repository: Repository): void {
    this.store.dispatch(new SetRepository(repository));
    this.selectedRepository = repository;
  }

  onScroll() {
    if (this.hasNextPage) {
      this.githubService.getNextQuery(this.nextCursor)
        .subscribe((result) => {
        this.hasNextPage = result.data.search.pageInfo.hasNextPage;
        this.nextCursor = result.data.search.pageInfo.endCursor;
        this.repositories = this.repositories.concat(this._extractRepository(result.data.search.edges));
        });
    }
  }
}
