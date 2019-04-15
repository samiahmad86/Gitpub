export interface Repository {
  owner: string;
  name: string;
  forkCount: number;
  starCount: number;
}

export interface RepositoryContributor {
  contributors: string;
}
