import { Injectable } from '@angular/core';
import {Apollo} from 'apollo-angular';
import gql from 'graphql-tag';


@Injectable({
  providedIn: 'root'
})
export class GithubService {
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
    private getBranches =  gql`
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
  constructor(private apollo: Apollo) { }

  getFirstQuery() {
    return this.apollo.subscribe({
      query: this.firstQuery
    });
  }

  getNextQuery(nextCursor) {
    return this.apollo.subscribe({
      query: this.paginationQuery,
      variables: {
        after: nextCursor
      }
    });
  }

  getAllBranches(repoName, owner) {
    return this.apollo
      .subscribe({
      query: this.getBranches,
      variables: {
        name: repoName,
        ownerName: owner
      }
    });
  }

  getAllRepositories(owner, repName, branchName, startCursor) {
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
          ownerName: owner,
          name: repName,
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
        ownerName: owner,
        name: repName,
        branch: branchName
      };
    }
    return this.apollo
      .subscribe({
        query: getUsers,
        variables: variablesQueried
    });
  }
}
