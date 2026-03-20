import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GymLoader } from './gym-loader';

describe('GymLoader', () => {
  let component: GymLoader;
  let fixture: ComponentFixture<GymLoader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GymLoader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GymLoader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
