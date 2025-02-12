import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoreComponent } from './score/score.component';

@NgModule({
  declarations: [ScoreComponent],
  imports: [CommonModule],
  exports: [ScoreComponent]
})
export class ComponentsModule {}
