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
  constructor(private apollo: Apollo) { }

  ngOnInit() {
    this.apollo
        .watchQuery<any>({
          query: gql`
            {
              search(query: "is:public", type: REPOSITORY, first: 50) {
                pageInfo {
                  endCursor
                  startCursor
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
          `,
        })
      .valueChanges
      .subscribe((result) => {
        this.heroes = result.data.search.edges.map( (edge) => {
          return {
            name: edge.node.name,
            owner: edge.node.owner.login
          };
        } );
      });
  }

  onSelect(hero: Repository): void {
    this.selectedHero = hero;
  }

}
