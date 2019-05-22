import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { setContext } from 'apollo-link-context';
import { AppComponent } from './app.component';
import { RepositoriesComponent } from './components/repositories/repositories.component';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { RepositoryDetailComponent } from './components/repository-detail/repository-detail';
import { HttpClientModule } from '@angular/common/http';
import { ApolloModule, Apollo } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AppBootstrapModule } from './components/bootstrap/app-bootstrap.module';
import { StoreModule } from '@ngrx/store';
import { repositoryReducer } from './store/reducers/repository.reducers';
import {environment} from '../environments/environment';


@NgModule({
  declarations: [
    AppComponent,
    RepositoriesComponent,
    RepositoryDetailComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    ApolloModule,
    HttpLinkModule,
    InfiniteScrollModule,
    AppBootstrapModule,
    StoreModule.forRoot({ repository: repositoryReducer })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
   constructor(apollo: Apollo, httpLink: HttpLink) {
      const http = httpLink.create({uri: environment.url});
      const auth = setContext((_, { headers }) => {
        return {
          headers: {Authorization: environment.token}
        };
    });
      apollo.create({
      link: auth.concat(http),
      cache: new InMemoryCache()
    });
   }
}
