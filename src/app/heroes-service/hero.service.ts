import { privateKey, publicKey } from '../../environments/.keys';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Md5 } from 'ts-md5/dist/md5';

import { MessageService } from '../message.service';
import { Hero } from '../hero.model';
import { environment } from '../../environments/environment';

const apiParams = new HttpParams()
  .append('ts', environment.marvel.ts)
  .append('apikey', publicKey)
  .append('hash', new Md5()
    .appendStr(environment.marvel.ts)
    .appendStr(privateKey)
    .appendStr(publicKey)
    .end().toString()
  );

export interface HeroData {
  offset: number;
  limit: number;
  total: number;
  results: Hero[];
}

interface HeroesResponse {
  code: number;
  status: string;
  data: HeroData;
}

export interface GetHeroesRequest {
  limit: number;
  offset: number;
  nameStartsWith?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HeroService {
  private heroesUrl = environment.marvel.domain + '/v1/public/characters';

  constructor(
    private messageService: MessageService,
    private httpClient: HttpClient
  ) { }

  getHeroes(request: GetHeroesRequest = { limit: 10, offset: 0 } ): Observable<HeroData> {
    const getParams = apiParams
      .append('limit', request.limit.toString())
      .append('offset', request.offset.toString());
    if (request.nameStartsWith) {
      apiParams.append('nameStartsWith', request.nameStartsWith);
    }

    return this.httpClient.get<HeroesResponse>(this.heroesUrl, { params: getParams })
      .pipe(
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError('getHeroes', [])),
        map((response: HeroesResponse) => response.data),
      );
  }

  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.httpClient.get<HeroesResponse>(url, { params: apiParams })
      .pipe(
        tap(_ => this.log(`fetched hero id=${id}`)),
        map((response: HeroesResponse) => response.data.results[0]),
        catchError(this.handleError<Hero>(`getHero id=${id}`))
      );
  }

  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim) { return of([]); }

    return this.httpClient.get<Hero[]>(`${this.heroesUrl}/?name=${term}`)
      .pipe(
        tap(_ => this.log('found heroes matching "${term"')),
        catchError(this.handleError<Hero[]>('searchHeroes', []))
      );
  }

  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log('error :', error);
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
