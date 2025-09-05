import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { firstValueFrom } from 'rxjs';
import { JsToAdvplService } from 'src/app/services/js-to-advpl.service';

@Component({
  selector: 'app-buy-orders',
  templateUrl: './buy-orders.component.html',
  styleUrls: ['./buy-orders.component.css']
})
export class BuyOrdersComponent {
  protected isLoading: boolean = false;
  protected buyOrders = [];
  protected filtro: string = '';
  protected buyOrdersFiltradas: any[] = [];

  constructor(
    private jsToAdvplService: JsToAdvplService
  ) { }

  async ngOnInit(): Promise<void> {
    try {
      this.isLoading = true;
      const buyOrders: any = await firstValueFrom(
        this.jsToAdvplService.getProtheusInfo({}, "GetBuyOrders")
      );

      if (buyOrders && buyOrders['items']) {
        this.buyOrders = buyOrders['items'];
        this.buyOrdersFiltradas = [...this.buyOrders];
      } else {
        this.buyOrders = [];
        this.buyOrdersFiltradas = [];
      }

      this.isLoading = false;
    } catch (err: any) {
      alert("❌ Erro em ngOnInit: " + JSON.stringify(err));
      this.isLoading = false;
    }
  }

  protected async baixarPdf(invoice: any) {
    let buyOrders: any = await firstValueFrom(
      this.jsToAdvplService.getProtheusInfo({ "buyOrderId": invoice['codigo'] }, "GetProducts")
    );
    buyOrders = buyOrders['items'];
    //const buyOrders: any = await this.jsToAdvplService.getInvoices(invoice['codigo'], '');

    // Converte quantidades para número
    const produtosConvertidos = buyOrders.map((produto: any) => {
      produto.clientes?.forEach((f: any) => f.quantidade = f.quantidade ? Number(f.quantidade) : 0);
      return produto;
    });

    const doc = new jsPDF();

    // Cabeçalho
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Relatório de Ordem De Compra', 105, 10, { align: 'center' });

    const marginLeft = 14;
    const marginRight = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    const lineY = 25;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    // Ordem de Compra
    doc.text(`Ordem De Compra: ${invoice['codigo']}`, marginLeft, lineY);
    // Data e Hora separadas
    const agora = new Date();
    const data = agora.toLocaleDateString('pt-BR');
    const hora = agora.toLocaleTimeString('pt-BR');

    // largura do texto maior (data ou hora) para alinhar à direita
    const maxWidth = Math.max(
      doc.getTextWidth(data),
      doc.getTextWidth(hora)
    );

    // imprime data (linha de cima)
    doc.text(
      data,
      pageWidth - marginRight - maxWidth,
      lineY
    );

    // imprime hora (linha de baixo, 5px abaixo)
    doc.text(
      hora,
      pageWidth - marginRight - maxWidth,
      lineY + 5
    );

    // Fornecedor
    doc.setFontSize(12);
    doc.text(`Fornecedor: ${buyOrders.nomeFornecedor}`, marginLeft, lineY + 6);

    let startY = lineY + 15;
    const body: any[] = [];

    // Criar linhas para todos os produtos
    produtosConvertidos.forEach((produto: any) => {
      // Linha de destaque do produto
      body.push([{
        content: `${produto.descricao} (${produto.codigo})`,
        colSpan: 3,
        styles: {
          halign: 'left',
          fontStyle: 'bold',
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          cellPadding: 2
        }
      }]);

      // Linhas de clientes
      produto.clientes?.forEach((f: any) => {
        body.push([f.nome, f.quantidade, f.fatura]);
      });
    });

    autoTable(doc, {
      startY,
      head: [['Cliente', 'Quantidade', 'Fatura']], // Cabeçalho global
      body,
      theme: 'grid',
      headStyles: { fillColor: [0, 58, 121], halign: 'center', fontSize: 10 },
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: { 1: { halign: 'right' } },
      margin: { left: marginLeft, right: marginRight },
      didParseCell: (data) => {
        // Detecta linha de produto
        if (typeof data.cell.raw === 'object' && 'colSpan' in data.cell.raw! && data.cell.raw.colSpan === 3) {
          data.cell.styles.fillColor = [240, 240, 240];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.halign = 'left';
        }
      }
    });

    doc.save('relatorio-ordem-de-compra.pdf');
  }

  filtrarOrdens() {
    const termo = this.filtro.toLowerCase();
    this.buyOrdersFiltradas = this.buyOrders.filter((ord: any) =>
      ord.codigo?.toString().toLowerCase().includes(termo) ||
      ord.nomeFornecedor?.toLowerCase().includes(termo)
    );
  }
}
