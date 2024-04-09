import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditDelegateComponent } from './add-edit-delegate.component';

describe('AddEditDelegateComponent', () => {
  let component: AddEditDelegateComponent;
  let fixture: ComponentFixture<AddEditDelegateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditDelegateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddEditDelegateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
