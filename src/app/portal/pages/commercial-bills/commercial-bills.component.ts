import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { firstValueFrom } from 'rxjs';
import { JsToAdvplService } from 'src/app/services/js-to-advpl.service';

@Component({
  selector: 'app-commercial-bills',
  templateUrl: './commercial-bills.component.html',
  styleUrls: ['./commercial-bills.component.css']
})
export class CommercialBillsComponent {
  protected isLoading: boolean = false;
  protected buyOrders: any[] = [];
  protected buyOrdersFiltradas: any[] = [];
  protected filtro: string = '';

  constructor(
    private jsToAdvplService: JsToAdvplService
  ) { }

  async ngOnInit(): Promise<void> {
    this.isLoading = true;
  
    try {
      const invoices: any = await firstValueFrom(
        this.jsToAdvplService.getProtheusInfo({}, 'GetBills')
      );
  
      if (invoices && invoices['items']) {
        this.buyOrders = invoices['items'];
        this.buyOrdersFiltradas = [...this.buyOrders];
      } else {
        this.buyOrders = [];
        this.buyOrdersFiltradas = [];
      }
    } catch (error) {
      this.buyOrders = [];
      this.buyOrdersFiltradas = [];
    }
  
    this.isLoading = false;
  }
  

  protected filtrarFaturas() {
    const termo = this.filtro.toLowerCase();
    this.buyOrdersFiltradas = this.buyOrders.filter(b =>
      b.codigo.toString().toLowerCase().includes(termo) ||
      b.nomeCliente?.toLowerCase().includes(termo)
    );
  }

  protected async baixarPdf(invoice: any) {
    this.isLoading = true;

    //const buyOrders: any = await this.jsToAdvplService.getInvoices('', '', invoice['codigo']);
    let buyOrders: any = await firstValueFrom(
      this.jsToAdvplService.getProtheusInfo({ "billId": invoice['codigo'] }, "GetProducts")
    );
    buyOrders = buyOrders['items'];
  
    // Converte quantidades para número
    const produtosConvertidos = buyOrders.map((produto: any) => {
      produto.clientes?.forEach((f: any) => f.quantidade = f.quantidade ? Number(f.quantidade) : 0);
      produto.fornecedores?.forEach((f: any) => f.quantidade = f.quantidade ? Number(f.quantidade) : 0);
      return produto;
    });
  
    const doc = new jsPDF();
  
    // Cabeçalho
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Faturas Comerciais', 105, 10, { align: 'center' });
  
    const marginLeft = 10;
    const marginRight = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const lineY = 25;
  
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
  
    // Fatura
    doc.text(`Fatura Comercial: ${invoice['codigo']}`, marginLeft, lineY);
  
    // Linha do cliente
    const clienteNome = invoice['nomeCliente'];
    doc.text(`Cliente: ${clienteNome}`, marginLeft, lineY + 6);
  
    // Data/Hora
    const agora = new Date();
    const dataHora = agora.toLocaleString('pt-BR');
    const textWidth = doc.getTextWidth(`Data/Hora de Impressão: ${dataHora}`);
    doc.text(`Data/Hora de Impressão: ${dataHora}`, pageWidth - marginRight - textWidth, lineY);
  
    let startY = lineY + 15;
    const body: any[] = [];
  
    produtosConvertidos.forEach((produto: any) => {
      // Total de clientes e fornecedores
      const totalClientes = produto.clientes?.reduce((acc: number, f: any) => acc + f.quantidade, 0) || 0;
      const totalFornecedores = produto.fornecedores?.reduce((acc: number, f: any) => acc + f.quantidade, 0) || 0;
  
      // Linha de destaque do produto com total
      body.push([
        {
          content: `${produto.descricao || 'Sem descrição'} (${produto.codigo})`,
          colSpan: 2,
          styles: {
            halign: 'left',
            fontStyle: 'bold',
            fillColor: [240, 240, 240],
            textColor: [0, 0, 0],
            cellPadding: 2
          }
        },
        {
          content: `Total ${totalClientes + totalFornecedores}`,
          styles: {
            halign: 'right',
            fontStyle: 'bold',
            fillColor: [240, 240, 240],
            textColor: [0, 0, 0],
            cellPadding: 2
          }
        }
      ]);
  
      // Linhas de clientes
      produto.clientes?.forEach((f: any) => {
        body.push([f.nome, `OC: ${f.ordemDeCompra}`, f.quantidade]);
      });
  
      // Linhas de fornecedores
      produto.fornecedores?.forEach((f: any) => {
        body.push([f.nome, `Nota Fiscal: ${f.fatura}`, f.quantidade]);
      });
    });
  
    autoTable(doc, {
      startY,
      head: [['Fornecedor/Cliente', 'Documento', 'Quantidade']],
      body,
      theme: 'grid',
      headStyles: { fillColor: [0, 58, 121], halign: 'center', fontSize: 10 },
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 100, halign: 'left' },
        1: { cellWidth: 60, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' }
      },
      margin: { left: marginLeft, right: marginRight },
      didParseCell: (data) => {
        if (typeof data.cell.raw === 'object' && 'colSpan' in data.cell.raw! && data.cell.raw.colSpan === 2) {
          data.cell.styles.fillColor = [240, 240, 240];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.halign = 'left';
        }
      }
    });
  
    doc.save('relatorio-ordem-de-compra.pdf');
    this.isLoading = false;
  }
  
}
