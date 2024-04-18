import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { ionCalendar } from '@ng-icons/ionicons';
import moment from 'moment';
import { map, Subject, take, takeUntil } from 'rxjs';
import { Config } from '../../interface/config.interface';
import { Delegate } from '../../interface/delegate.interface';
import { Meal } from '../../interface/meal.interface';
import { AuthService } from '../auth/service/auth.service';
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
      ionCalendar,
    }),
  ],
})
export class NametagComponent implements OnDestroy {
  title: string = '';
  name: string = '';
  localOrganisation: string = '';
  id: string | null = null;

  isLoading = true;
  isGettingMeal = false;
  config!: Config;
  isLoggedIn = this.authService.isLoggedIn();
  todayDate = moment().format('YYYY-MM-DD');
  isMealServed = false;
  unsubscriber$ = new Subject<void>();
  constructor(
    private activatedRoute: ActivatedRoute,
    private listService: ListService,
    private authService: AuthService,
    private _snackBar: MatSnackBar
  ) {
    this.activatedRoute.paramMap.pipe(take(1)).subscribe((params: ParamMap) => {
      this.id = params.get('id');
      if (this.id) {
        if (this.isLoggedIn) this.getConfig();
        this.isLoading = true;
        this.listService
          .getUserNameTag(this.id)
          .pipe(
            take(1),
            map((res: any) => res.data)
          )
          .subscribe((delegate: Delegate) => {
            this.title = delegate.membershipType;
            this.name = `${delegate.firstName} ${delegate.lastName}`;
            this.localOrganisation = delegate.localOrganisation;
            this.isLoading = false;
          });
      }
    });
  }

  getConfig(): void {
    this.isGettingMeal = true;
    this.listService
      .getConfig()
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.config = res.data;
        },
        error: (err) => {
          this.isGettingMeal = false;
        },
        complete: () => {
          if (this.config.isServingMeal) {
            this.getDelegateMeal();
          } else {
            this.isGettingMeal = false;
          }
        },
      });
  }

  markMealDone(): void {
    this.isGettingMeal = true;
    this.listService
      .createMeal(this.todayDate, this.id)
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe({
        next: (res: any) => {
          this.openSnackBar(res.message, '🍛');
          this.isMealServed = true;
        },
        error: (err: any) => {
          this.openSnackBar(err.error.message);
          this.isGettingMeal = false;
        },
      });
  }

  openSnackBar(message: string, action = '') {
    this._snackBar.open(message, action, {
      horizontalPosition: 'right',
      verticalPosition: 'top',
      duration: 4000,
    });
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  getDelegateMeal(): void {
    this.isGettingMeal = true;
    this.listService
      .getDelegateMeal(this.id, this.todayDate)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          const meal: Meal = res.data[0];
          if (meal?.breakfast && this.config.mealType === 'breakfast') {
            this.isMealServed = true;
          } else if (meal?.lunch && this.config.mealType === 'lunch') {
            this.isMealServed = true;
          } else if (meal?.dinner && this.config.mealType === 'dinner') {
            this.isMealServed = true;
          }

          this.isGettingMeal = false;
        },
        error: (err) => {
          this.isGettingMeal = false;
          this.openSnackBar(err.error.message);
        },
      });
  }
}
