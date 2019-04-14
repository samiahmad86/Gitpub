import { Component, OnInit } from '@angular/core';
import {Repository} from '../hero';
import {Apollo} from 'apollo-angular';
import gql from 'graphql-tag';


@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css']
})
export class HeroesComponent implements OnInit {

  heroes: Repository[];
  selectedHero: Repository;
  private nextCursor = '';
  private hasNextPage = false;
  private firstQuery = gql `{
  search(query: "is:public", type: REPOSITORY, first: 20) {
    pageInfo {
      endCursor
      startCursor
      hasNextPage
    }
    edges {
      node {
        ... on Repository {
          name
          forkCount
          owner {
            login
          }
          stargazers(first: 1) {
            totalCount
          }
        }
      }
    }
  }
}
`;
    private paginationQuery = gql `
          query ($after: String!) {
              search(query: "is:public", type: REPOSITORY, first: 20, after: $after) {
                pageInfo {
                  endCursor
                  startCursor
                  hasNextPage
                }
                edges {
                  node {
                    ... on Repository {
                      name
                      forkCount
                      owner {
                        login
                      }
                      stargazers (first:1) {
                        totalCount
                      }
                    }
                  }
                }
              }
            }
          `;
  constructor(private apollo: Apollo) { }

  ngOnInit() {
    this.apollo
        .watchQuery<any>({
          query: this.firstQuery
        })
      .valueChanges
      .subscribe((result) => {
      this.hasNextPage = result.data.search.pageInfo.hasNextPage;
      this.nextCursor = result.data.search.pageInfo.endCursor;
      this.heroes = result.data.search.edges.map( (edge) => {
          return {
            name: edge.node.name,
            owner: edge.node.owner.login,
            forkCount: edge.node.forkCount,
            starCount: edge.node.stargazers.totalCount
          };
        } );
      });
  }

  onSelect(hero: Repository): void {
    this.selectedHero = hero;
  }

  onScroll() {
    if (this.hasNextPage) {
      this.apollo
        .watchQuery<any>({
          query: this.paginationQuery,
          variables: {
            after: this.nextCursor
          }
        })
        .valueChanges
        .subscribe((result) => {
          this.hasNextPage = result.data.search.pageInfo.hasNextPage;
          this.nextCursor = result.data.search.pageInfo.endCursor;
          const temp = result.data.search.edges.map((edge) => {
            return {
              name: edge.node.name,
              owner: edge.node.owner.login,
              forkCount: edge.node.forkCount,
              starCount: edge.node.stargazers.totalCount
            };
          });
          this.heroes = this.heroes.concat(temp);
        });
    }
  }
}
