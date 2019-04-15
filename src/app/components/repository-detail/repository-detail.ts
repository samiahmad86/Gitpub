import { Component, OnInit, Input } from '@angular/core';
import {Repository, RepositoryContributor} from '../../models/repository';
import {Apollo} from 'apollo-angular';
import gql from 'graphql-tag';
import {isNullOrUndefined, isUndefined} from "util";
import {FormBuilder, FormGroup} from "@angular/forms";
import {GithubService} from "../../services/github.service";


@Component({
  selector: 'app-repository-detail',
  templateUrl: './repository-detail.html',
  styleUrls: ['./repository-detail.css']
})
export class RepositoryDetailComponent implements OnInit {
  branchForm: FormGroup;
  branches = ['USA', 'Canada', 'Uk']
  repositoryContributor: string[];
  private tempRepositoryContributor = [];
  private name = 'esn_pytorch';
  private owner = 'samiahmad86';
  private allbranch;
  @Input()
  set repository(repository: Repository) {
    if (!isNullOrUndefined(repository)) {
      this.name = repository.name;
      this.owner = repository.owner;
      this.allbranch = [];
      this.tempRepositoryContributor = [];
      this.repositoryContributor = [];
      this.fetchAllBranches();
    }

  }
  constructor(private apollo: Apollo, private fb: FormBuilder, private githubService: GithubService) { }

  fetchAllBranches() {
    this.githubService.getAllBranches(this.name, this.owner)
      .subscribe((result) => {
      this.branches = result.data.repository.refs.edges.map( (list) => {
        return list.node.name;
      });
      this.repositoryContributor = [];
      document.getElementById('loader_div').style.display = 'block';
      this.fetchRepository(this.branches[0], '');
      this.branchForm = this.fb.group({
         branchControl: [this.branches[0]]
       });
    });
  }


  fetchRepository(branchName, startCursor) {
    let hasNextPage = true;
    let nextStartCursor = startCursor;
    this.githubService.getAllRepositories(this.owner, this.name, branchName, startCursor)
      .subscribe((result) => {
        hasNextPage = result.data.repository.object.history.pageInfo.hasNextPage;
        nextStartCursor = result.data.repository.object.history.pageInfo.endCursor;
        result.data.repository.object.history.nodes.map((list) => {
          this.tempRepositoryContributor.push(list.author.name);
        });
        this.tempRepositoryContributor = this.tempRepositoryContributor.filter((item, pos) => {
          return this.tempRepositoryContributor.indexOf(item) === pos;
        });
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
