import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  ionCalendar,
} from '@ng-icons/ionicons';
import { map, take } from 'rxjs';
import { Delegate } from '../../interface/delegate.interface';
import { ListService } from '../delegates/service/list.service';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-nametag',
  standalone: true,
  imports: [NgIconComponent, CommonModule, LoaderComponent],
  templateUrl: './nametag.component.html',
  styleUrl: './nametag.component.scss',
  providers: [
    provideIcons({
      ionCalendar
    }),
  ],
})
export class NametagComponent {
  title: string = '';
  name: string = '';
  localOrganisation: string = '';
  id: string | null = null;

  isLoading = true;
  constructor(private activatedRoute: ActivatedRoute, private listService: ListService) {
    this.activatedRoute.paramMap.pipe(take(1)).subscribe((params: ParamMap) => {
      this.id = params.get('id');
      if (this.id) {
        this.isLoading = true;
        this.listService.getUserNameTag(this.id).pipe(take(1), map((res: any) => res.data)).subscribe((delegate: Delegate) => {
          this.title = delegate.membershipType;
          this.name = `${delegate.firstName} ${delegate.lastName}`;
          this.localOrganisation = delegate.localOrganisation;
          this.isLoading = false;
        })
      }
    })
  }
}
