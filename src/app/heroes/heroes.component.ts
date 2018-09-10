import { Hero } from './../hero.model';
import { Component, OnInit } from '@angular/core';
import { HEROES } from '../heroes.mock';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css']
})
export class HeroesComponent implements OnInit {

  heroes = HEROES;
  selectedHero: Hero;

  constructor() { }

  ngOnInit() {
  }

  select(hero: Hero) {
    this.selectedHero = hero;
  }
}
