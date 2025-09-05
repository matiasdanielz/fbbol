import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProAppConfigService } from '@totvs/protheus-lib-core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  protected menuItems: MenuItem[] = [
    { label: 'Notas De Entrada', icon: 'pi pi-file', routerLink: 'notas-fiscais' },
    { label: 'Itens De Fatura', icon: 'pi pi-list', routerLink: 'itens-fatura' },
    { label: 'Faturas Comerciais', icon: 'pi pi-money-bill', routerLink: 'faturas-comerciais' },
    { label: 'Ordens De Compra', icon: 'pi pi-shopping-cart', routerLink: 'ordens-de-compra' },
  ];

  protected activeItem: MenuItem | null = null;

  constructor(
    private proAppConfigService: ProAppConfigService,
    private router: Router
  ) {}

  public closeScreen() {
    this.proAppConfigService.callAppClose();
  }

  public onMenuItemClick(item: MenuItem) {
    this.activeItem = item;

    // Navega manualmente para a rota definida no item
    if (item.routerLink) {
      this.router.navigate([item.routerLink]);
    }
  }
}
