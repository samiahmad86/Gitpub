import { Component, OnInit } from '@angular/core';
import {Repository} from '../../models/repository';
import {Apollo} from 'apollo-angular';
import {GithubService} from '../../services/github.service';


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

  constructor(private apollo: Apollo, private  githubService: GithubService) { }

  ngOnInit() {
   this.githubService.getFirstQuery()
     .subscribe((result) => {
      this.hasNextPage = result.data.search.pageInfo.hasNextPage;
      this.nextCursor = result.data.search.pageInfo.endCursor;
      this.repositories = result.data.search.edges.map( (edge) => {
          return {
            name: edge.node.name,
            owner: edge.node.owner.login,
            forkCount: edge.node.forkCount,
            starCount: edge.node.stargazers.totalCount
          };
        } );
      });
  }

  onSelect(repository: Repository): void {
    this.selectedRepository = repository;
  }

  onScroll() {
    if (this.hasNextPage) {
      this.githubService.getNextQuery(this.nextCursor)
        .subscribe((result) => {
        this.hasNextPage = result.data.search.pageInfo.hasNextPage;
        this.nextCursor = result.data.search.pageInfo.endCursor;
        this.repositories = this.repositories.concat(result.data.search.edges.map((edge) => {
            return {
              name: edge.node.name,
              owner: edge.node.owner.login,
              forkCount: edge.node.forkCount,
              starCount: edge.node.stargazers.totalCount
            };
          }));
        });
    }
  }
}
