import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    // ...existing code...
  ],
  imports: [
    // ...existing code...
    MarkdownModule.forRoot(),
  ],
  providers: [],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {}
