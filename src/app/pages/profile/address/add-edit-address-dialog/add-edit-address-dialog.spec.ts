import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditAddressDialog } from './add-edit-address-dialog';

describe('AddEditAddressDialog', () => {
  let component: AddEditAddressDialog;
  let fixture: ComponentFixture<AddEditAddressDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditAddressDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditAddressDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
