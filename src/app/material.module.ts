import { NgModule } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
    imports: [
        MatGridListModule,
        MatCardModule,
        MatTooltipModule,
        MatToolbarModule,
        MatButtonModule,
        MatPaginatorModule
    ],
    exports: [
        MatGridListModule,
        MatCardModule,
        MatTooltipModule,
        MatToolbarModule,
        MatButtonModule,
        MatPaginatorModule
    ]
})
export class MaterialModule {}
