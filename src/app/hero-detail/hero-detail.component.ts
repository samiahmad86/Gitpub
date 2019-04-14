import { Component, OnInit, Input } from '@angular/core';
import {Repository, RepositoryContributor} from '../hero';
import {Apollo} from 'apollo-angular';
import gql from 'graphql-tag';
import {isNullOrUndefined, isUndefined} from "util";
import {FormBuilder, FormGroup} from "@angular/forms";


@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css']
})
export class HeroDetailComponent implements OnInit {
  branchForm: FormGroup;
  branches = ['USA', 'Canada', 'Uk']
  repositoryContributor: string[];
  private tempRepositoryContributor = [];
  private name = 'esn_pytorch';
  private owner = 'samiahmad86';
  private allbranch;
  @Input()
  set hero(hero: Repository) {
    if (!isNullOrUndefined(hero)) {
      this.name = hero.name;
      this.owner = hero.owner;
      this.allbranch = [];
      this.tempRepositoryContributor = [];
      this.repositoryContributor = [];
      this.fetchAllBranches();
    }

  }
  constructor(private apollo: Apollo, private fb: FormBuilder) { }

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
      this.branches = this.allbranch;
      this.repositoryContributor = [];
      document.getElementById('loader_div').style.display = 'block';
      this.fetchRepository(this.branches[0], '');
      this.branchForm = this.fb.group({
         branchControl: [this.branches[0]]
       });
    });
  }


  fetchRepository(branchName, startCursor) {
    let variablesQueried;
    let getUsers;
    if (startCursor !== '') {
      getUsers = gql`
              query($ownerName: String!, $name: String!, $branch: String!, $after: String) {
                repository(owner: $ownerName, name:$name) {
                  object(expression: $branch) {
                    ... on Commit {
                      history(first: 100, after: $after){
                        pageInfo {
                          endCursor,
                          startCursor,
                          hasNextPage
                        }
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
      variablesQueried =  {
          ownerName: this.owner,
          name: this.name,
          branch: branchName,
          after: startCursor
        };
    } else {
      getUsers =  gql`
            query($ownerName: String!, $name: String!, $branch: String!) {
              repository(owner: $ownerName, name:$name) {
                object(expression: $branch) {
                  ... on Commit {
                    history(first: 100){
                      pageInfo {
                        endCursor,
                        startCursor,
                        hasNextPage
                      }
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
      variablesQueried =  {
        ownerName: this.owner,
        name: this.name,
        branch: branchName
      };
    }

    let tempNames = [];
    let hasNextPage = true;
    let nextStartCursor = startCursor;
    this.apollo
      .watchQuery<any>({
        query: getUsers,
        variables: variablesQueried
      })
      .valueChanges
      .subscribe((result) => {
        hasNextPage = result.data.repository.object.history.pageInfo.hasNextPage;
        nextStartCursor = result.data.repository.object.history.pageInfo.endCursor;
        tempNames = (result.data.repository.object.history.nodes.map((list) => {
          return list.author.name;
        }));
        this.tempRepositoryContributor = this.tempRepositoryContributor.concat(tempNames);
        this.tempRepositoryContributor = this.tempRepositoryContributor.filter((item, pos) => {
          return this.tempRepositoryContributor.indexOf(item) === pos;
        });
        tempNames = [];
        if (hasNextPage) {
          this.fetchRepository(branchName, nextStartCursor);
        } else {
          this.repositoryContributor = this.tempRepositoryContributor;
          document.getElementById('loader_div').style.display = 'none';
        }
      });
  }

  ngOnInit() {
    this.branchForm = this.fb.group({
   branchControl: ['master']
    });
    }

    onChange(newValue) {
    this.tempRepositoryContributor = [];
    this.repositoryContributor = [];
    document.getElementById('loader_div').style.display = 'block';
    this.fetchRepository(newValue, '');
    }

}
