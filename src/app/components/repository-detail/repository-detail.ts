import { Component, OnInit, Input } from '@angular/core';
import {Apollo} from 'apollo-angular';
import {FormBuilder, FormGroup} from '@angular/forms';
import {GithubService} from '../../services/github.service';
import { Store, select } from '@ngrx/store';


@Component({
  selector: 'app-repository-detail',
  templateUrl: './repository-detail.html',
  styleUrls: ['./repository-detail.css']
})
export class RepositoryDetailComponent implements OnInit {
  branchForm: FormGroup;
  branches = ['master']
  repositoryContributor: string[];
  private name = 'esn_pytorch';
  private owner = 'samiahmad86';
  private allbranch;

  constructor(private apollo: Apollo, private fb: FormBuilder, private githubService: GithubService,
              private store: Store<{ count: number }>) {

  }

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
          this.repositoryContributor.push(list.author.name);
        });
        this.repositoryContributor = this.repositoryContributor.filter((item, pos) => {
          return this.repositoryContributor.indexOf(item) === pos;
        });
        if (hasNextPage) {
          this.fetchRepository(branchName, nextStartCursor);
        } else {
          document.getElementById('loader_div').style.display = 'none';
        }
      });
  }

  ngOnInit() {
    this.branchForm = this.fb.group({
   branchControl: ['master']
    });
    const repository = this.store.pipe(select('repository'));
    repository.subscribe( (result) => {
      if (result.repository !== null) {
        this.name = result.repository.name;
        this.owner = result.repository.owner;
        this.allbranch = [];
        this.repositoryContributor = [];
        this.fetchAllBranches();
      }
     });
    }

    onChange(newValue) {
    this.repositoryContributor = [];
    document.getElementById('loader_div').style.display = 'block';
    this.fetchRepository(newValue, '');
    }

}
