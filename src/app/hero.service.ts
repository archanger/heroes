import { privateKey, publicKey } from './../environments/.keys';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Md5 } from 'ts-md5/dist/md5';

import { MessageService } from './message.service';
import { Hero } from './hero.model';
import { environment } from '../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


const apiParams = new HttpParams()
  .append('ts', environment.marvel.ts)
  .append('apikey', publicKey)
  .append('hash', new Md5()
    .appendStr(environment.marvel.ts)
    .appendStr(privateKey)
    .appendStr(publicKey)
    .end().toString()
  );

interface HeroData {
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

@Injectable({
  providedIn: 'root'
})
export class HeroService {
  private heroesUrl = environment.marvel.domain + '/v1/public/characters';

  constructor(
    private messageService: MessageService,
    private httpClient: HttpClient
  ) { }

  getHeroes(): Observable<Hero[]> {
    return this.httpClient.get<HeroesResponse>(this.heroesUrl, { params: apiParams })
      .pipe(
        tap(_ => this.log('fetched heroes')),
        map((response: HeroesResponse) => response.data.results),
        catchError(this.handleError('getHeroes', [])),
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

  updateHero(hero: Hero): Observable<any> {
    return this.httpClient.put<Hero>(this.heroesUrl, hero, httpOptions)
      .pipe(
        tap(her => this.log(`updated hero id=${her.id}`)),
        catchError(this.handleError('updateHero'))
      );
  }

  createHero(hero: Hero): Observable<Hero> {
    return this.httpClient.post<Hero>(this.heroesUrl, hero, httpOptions)
      .pipe(
        tap(her => this.log(`added hero w/ id=${her.id}`)),
        catchError(this.handleError<Hero>('createHero'))
      );
  }

  deleteHero(hero: Hero | number): Observable<any> {
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.httpClient.delete<Hero>(url, httpOptions)
      .pipe(
        tap(_ => this.log(`deleted hero id=${id}`)),
        catchError(this.handleError<Hero>('deleteHero'))
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
