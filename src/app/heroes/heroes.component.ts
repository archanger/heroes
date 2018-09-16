import { GetHeroesRequest } from './../heroes-service/hero.service';
import { Observable, Subject } from 'rxjs';
import { HeroService } from '../heroes-service/hero.service';
import { Hero } from './../hero.model';
import { Component, OnInit } from '@angular/core';
import { ObservableMedia } from '@angular/flex-layout';
import { map, startWith, distinctUntilChanged, debounceTime, switchMap } from 'rxjs/operators';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css']
})
export class HeroesComponent implements OnInit {
  cols: Observable<number>;
  totalItems = 0;
  itemsPerPage = 20;

  heroes: Hero[];

  private page = new Subject<number>();

  constructor(
    private heroService: HeroService,
    private observablemedia: ObservableMedia
  ) { }

  ngOnInit() {

    const grid = new Map([
      ['xs', 1],
      ['sm', 2],
      ['md', 3],
      ['lg', 4],
      ['xl', 4]
    ]);

    let start: number;
    grid.forEach((cols, mqAlias) => {
      if (this.observablemedia.isActive(mqAlias)) {
        start = cols;
      }
    });

    this.cols = this.observablemedia.asObservable()
      .pipe(
        map(change => {
          return grid.get(change.mqAlias);
        }),
        startWith(start)
      );

    this.page.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(page => {
        const request: GetHeroesRequest = {
          limit: this.itemsPerPage,
          offset: this.itemsPerPage * page
        };
        return this.heroService.getHeroes(request);
      })
    )
    .subscribe(data => {
      this.heroes = data.results;
      this.totalItems = data.total;
      this.itemsPerPage = data.limit;
    });

    this.page.next(0);
  }

  getHeroes(pageIndex: number = 0) {

    const request: GetHeroesRequest = {
      limit: this.itemsPerPage,
      offset: this.itemsPerPage * pageIndex
    };

    this.heroService.getHeroes(request)
      .subscribe(data => {
        this.heroes = data.results;
        this.totalItems = data.total;
        this.itemsPerPage = data.limit;
      });
  }

  pageChanged(pageEvent: PageEvent) {
    console.log('pageEvent :', pageEvent);
    this.page.next(pageEvent.pageIndex);
  }
}
