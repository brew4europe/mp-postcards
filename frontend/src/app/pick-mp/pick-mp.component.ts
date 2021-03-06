import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { Mp } from '../models/mp';
import { PostcardApiService } from '../services/postcard-api.service';
import { PostcardStoreService } from '../state/postcard-store.service';

@Component({
  selector: 'app-pick-mp',
  templateUrl: './pick-mp.component.html',
  styleUrls: ['./pick-mp.component.scss']
})
export class PickMpComponent implements OnInit {

  searching: boolean = false;
  postcode: string;
  results: Mp[] =  [];
  postcardImage: string;

  query$ = new Subject<string>();

  constructor(private postcardApi: PostcardApiService, private postcardStore: PostcardStoreService, private router: Router) {
    this.search(this.query$)
      .subscribe(results => {
        this.searching = false;
        this.results = results.mps;
      });
  }

  ngOnInit() {
    this.postcardStore.postcard
      .subscribe(postcardData => {
        if (postcardData.mp) {
          this.results = [ postcardData.mp ];
        }
        if (postcardData.topic) {
          this.postcardImage = postcardData.topic.image;
        }
      });
  }

  search(query: Observable<string>) {
    return query.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        this.searching = true;
        return this.postcardApi.lookupMps(query)
      }));
  }

  onSelect(mp: Mp): void {
    this.postcardStore.addMp(mp, this.postcode);

    this.router.navigateByUrl('/write-card');
  }
}
