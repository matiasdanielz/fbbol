import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoicesComponent } from './portal/pages/invoices/invoices.component';
import { BillItemsComponent } from './portal/pages/bill-items/bill-items.component';
import { CommercialBillsComponent } from './portal/pages/commercial-bills/commercial-bills.component';
import { BuyOrdersComponent } from './portal/pages/buy-orders/buy-orders.component';

const routes: Routes = [
  {
    path: 'notas-fiscais',
    component: InvoicesComponent
  },
  {
    path: 'itens-fatura',
    component: BillItemsComponent
  },
  {
    path: 'faturas-comerciais',
    component: CommercialBillsComponent
  },
  {
    path: 'ordens-de-compra',
    component: BuyOrdersComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
