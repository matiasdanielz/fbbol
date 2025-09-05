import { Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { firstValueFrom } from 'rxjs';
import { JsToAdvplService } from 'src/app/services/js-to-advpl.service';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.css']
})
export class InvoicesComponent implements OnInit {
  protected isLoading: boolean = false;

  protected invoices: any[] = [];
  protected invoicesFiltradas: any[] = [];
  protected filtro: string = '';

  constructor(
    private jsToAdvplService: JsToAdvplService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.isLoading = true;
      const invoices: any = await firstValueFrom(
        this.jsToAdvplService.getProtheusInfo({}, "GetEntryDocs")
      );

      if (invoices && invoices['items']) {
        this.invoices = invoices['items'];
        this.invoicesFiltradas = [...this.invoices];
      } else {
        this.invoices = [];
        this.invoicesFiltradas = [];
      }

      this.isLoading = false;
    } catch (err: any) {
      alert("❌ Erro em ngOnInit: " + JSON.stringify(err));
      this.isLoading = false;
    }
  }

  protected async baixarPdf(invoice: any) {
    let buyOrders: any = await firstValueFrom(
      this.jsToAdvplService.getProtheusInfo({"buyRequestId": invoice['codigo']}, "GetProducts")
    );
    
    buyOrders = buyOrders['items'];
    //const buyOrders: any = await this.jsToAdvplService.getInvoices('', invoice['codigo']);
    const doc = new jsPDF();
  
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Relatório de Notas Fiscais', 105, 10, { align: 'center' });
  
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
  
    const marginLeft = 14;
    const marginRight = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    const lineY = 25;
  
    // Nota Fiscal de Entrada
    doc.text(`Nota Fiscal de Entrada: ${invoice['codigo']}`, marginLeft, lineY);
  
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
    doc.setFontSize(10);
    doc.text(`Fornecedor: ${invoice['nomeFornecedor']}`, marginLeft, lineY + 6);
  
    let startY = lineY + 15;
    const body: any[] = [];
  
    // Criar linhas para todos os produtos
    buyOrders.forEach((produto: any) => {
      // Calcula o total de quantidades desse produto
      const totalQuantidade = produto.clientes.reduce(
        (acc: number, f: any) => acc + (Number(f.quantidade) || 0),
        0
      );
  
      // Linha de destaque do produto (duas colunas + total na última)
      body.push([
        {
          content: `${produto.descricao} (${produto.codigo})`,
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
          content: `Total: ${totalQuantidade}`,
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
      produto.clientes.forEach((f: any) => {
        body.push([f.nome, f.fatura, f.quantidade]);
      });
    });
  
    autoTable(doc, {
      startY,
      head: [['Cliente', 'Fatura', 'Quantidade']],
      body,
      theme: 'grid',
      headStyles: { fillColor: [0, 58, 121], halign: 'center', fontSize: 10 },
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: { 2: { halign: 'right' } },
      margin: { left: 14, right: 14 }
    });
  
    doc.save('relatorio-nota-fiscal.pdf');
  }

  getTipoLabel(tipo: string): string {
    switch (tipo) {
      case 'N': return 'Normal';
      case 'D': return 'Devolução';
      case 'C': return 'Compl. Preços/Qtde';
      case 'P': return 'Compl. IPI';
      case 'I': return 'Compl. ICMS';
      case 'B': return 'Apres. Fornec.';
      default: return 'Desconhecido';
    }
  }
  
  getTipoSeverity(tipo: string): any {
    switch (tipo) {
      case 'N': return 'success';   // verde
      case 'D': return 'danger';    // vermelho
      case 'C': return 'warning';   // amarelo
      case 'P': return 'info';      // azul claro
      case 'I': return 'secondary'; // cinza
      case 'B': return 'contrast';  // preto/branco
      default: return 'help';       // fallback
    }
  }

  filtrarNotas() {
    const termo = this.filtro.toLowerCase();
    this.invoicesFiltradas = this.invoices.filter(inv =>
      inv.codigo.toString().toLowerCase().includes(termo) ||
      inv.nomeFornecedor?.toLowerCase().includes(termo)
    );
  }
}
