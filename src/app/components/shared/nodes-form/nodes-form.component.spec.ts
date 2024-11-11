import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodesFormComponent } from './nodes-form.component';

describe('NodesFormComponent', () => {
  let component: NodesFormComponent;
  let fixture: ComponentFixture<NodesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodesFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NodesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
