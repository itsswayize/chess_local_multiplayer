import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveFeedbackComponent } from './move-feedback.component';

describe('MoveFeedbackComponent', () => {
  let component: MoveFeedbackComponent;
  let fixture: ComponentFixture<MoveFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoveFeedbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoveFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
