import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { setContext } from 'apollo-link-context';
import { AppComponent } from './app.component';
import { HeroesComponent } from './heroes/heroes.component';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { HeroDetailComponent } from './hero-detail/hero-detail.component';
import { HttpClientModule } from '@angular/common/http';
import { ApolloModule, Apollo } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AppBootstrapModule } from './app-bootstrap.module';


@NgModule({
  declarations: [
    AppComponent,
    HeroesComponent,
    HeroDetailComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    ApolloModule,
    HttpLinkModule,
    InfiniteScrollModule,
    AppBootstrapModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
   constructor(apollo: Apollo, httpLink: HttpLink) {
      const http = httpLink.create({uri: 'https://api.github.com/graphql'});
      const auth = setContext((_, { headers }) => {
        return {
          headers: {Authorization: `Bearer a2ff9e6ed08d3e65c743ff9184ef6c5c9c1e0351`}
        };
    });
      apollo.create({
      link: auth.concat(http),
      cache: new InMemoryCache()
    });
   }
}
