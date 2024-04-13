import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NametagComponent } from './nametag.component';

describe('NametagComponent', () => {
  let component: NametagComponent;
  let fixture: ComponentFixture<NametagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NametagComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NametagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
