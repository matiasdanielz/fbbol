import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { PageDefaultComponent } from './defaultComponents/page-default/page-default.component';
import { InvoicesComponent } from './portal/pages/invoices/invoices.component';
import { BuyOrdersComponent } from './portal/pages/buy-orders/buy-orders.component';
import { BillItemsComponent } from './portal/pages/bill-items/bill-items.component';
import { CommercialBillsComponent } from './portal/pages/commercial-bills/commercial-bills.component';
import { CardDefaultComponent } from './defaultComponents/card-default/card-default.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BadgeModule } from 'primeng/badge';
import { LoadingOverlayDefaultComponent } from './defaultComponents/loading-overlay-default/loading-overlay-default.component';
import { SidebarComponent } from './portal/sidebar/sidebar.component';

@NgModule({
  declarations: [
    AppComponent,
    PageDefaultComponent,
    InvoicesComponent,
    BuyOrdersComponent,
    BillItemsComponent,
    CommercialBillsComponent,
    CardDefaultComponent,
    LoadingOverlayDefaultComponent,
    SidebarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MenuModule,
    TableModule,
    ButtonModule,
    ProgressSpinnerModule,
    CalendarModule,
    InputTextModule,
    BadgeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
