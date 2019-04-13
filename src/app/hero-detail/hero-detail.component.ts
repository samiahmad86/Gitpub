import { Component, OnInit, Input } from '@angular/core';
import {Repository, RepositoryContributor} from '../hero';
import {Apollo} from 'apollo-angular';
import gql from 'graphql-tag';
import {isNullOrUndefined, isUndefined} from "util";
import {forEach} from "@angular/router/src/utils/collection";
import {noUndefined} from "@angular/compiler/src/util";
import  {of} from "rxjs/index";
import {distinct} from "rxjs/internal/operators";
import {map} from "rxjs/internal/operators";


@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css']
})
export class HeroDetailComponent implements OnInit {
  repositoryContributor: string [];
  private name = 'esn_pytorch';
  private owner = 'samiahmad86';
  private allbranch;
  @Input()
  set hero(hero: Repository) {
    if (!isNullOrUndefined(hero)) {
      this.name = hero.name;
      this.owner = hero.owner;
      this.allbranch = [];
      this.fetchAllBranches();
    }

  }


  constructor(private apollo: Apollo) { }

  fetchAllBranches() {
    const getBranches =  gql`
      query ($ownerName: String!, $name: String!) {
        repository(owner: $ownerName, name: $name) {
          refs(first: 100, refPrefix: "refs/heads/") {
            totalCount
            edges {
              node {
                name
              }
            }
          }
        }
      }`;
      this.apollo
      .watchQuery<any>({
        query: getBranches,
        variables: {
          ownerName: this.owner,
          name: this.name
        }
      })
        .valueChanges
        .subscribe((result) => {
        this.allbranch = result.data.repository.refs.edges.map( (list) => {
          return list.node.name;
        });
        this.fetchRepository();
      });
  }


  fetchRepository() {
    const getUsers =  gql`
            query($ownerName: String!, $name: String!, $branch: String!) {
              repository(owner: $ownerName, name:$name) {
                object(expression: $branch) {
                  ... on Commit {
                    history{
                      nodes {
                        author {
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          `;

    if (this.allbranch.length !== 0) {
      let tempNames = [];
      this.repositoryContributor = [];
      for (const currentBranch of this.allbranch) {
        this.apollo
          .watchQuery<any>({
            query: getUsers,
            variables: {
              ownerName: this.owner,
              name: this.name,
              branch: currentBranch
            }
          })
          .valueChanges
          .subscribe((result) => {
            // (result.data.repository.object.history.nodes.map((list) => {
            //   tempNames.push(list.author.name);
            // }));
            // this.repositoryContributor.push(...tempNames.filter((item, pos) => {
            //    return tempNames.indexOf(item) === pos;
            // }));
            // tempNames = [];
            tempNames = (result.data.repository.object.history.nodes.map((list) => {
              return list.author.name;
            }));
            this.repositoryContributor = this.repositoryContributor.concat(tempNames);
            this.repositoryContributor = this.repositoryContributor.filter((item, pos) => {
               return this.repositoryContributor.indexOf(item) === pos;
            });
            // this.repositoryContributor.filter((v,i) => this.repositoryContributor.indexOf(v) === i);
            // this.repositoryContributor.push(...tempNames.filter((item, pos) => {
            //    return tempNames.indexOf(item) === pos;
            // }));
            tempNames = [];
          });
      }
    }
  }

  ngOnInit() {
    }

}
