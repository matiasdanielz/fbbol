import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProJsToAdvpl, ProJsToAdvplService } from '@totvs/protheus-lib-core';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JsToAdvplService {

  constructor(
    private proJsToAdvplService: ProJsToAdvplService,
    private http: HttpClient
  ) { }

  public async getBills(): Promise<any[]> {
    const url: string = `http://priority189155.protheus.cloudtotvs.com.br:10757/rest/fbbol/bills`;
  
    const username = 'admin';
    const password = 'totvs@2025';
    const auth = btoa(`${username}:${password}`); // codifica em Base64
  
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${auth}` // Basic Auth
    };
  
    // firstValueFrom é preferível ao toPromise()
    const response: any = await firstValueFrom(this.http.get(url, { headers }));
    
    return response['items'];
  }

  public async getBuyOrders(): Promise<any[]> {
    const url: string = `http://priority189155.protheus.cloudtotvs.com.br:10757/rest/fbbol/buyOrders`;
  
    const username = 'admin';
    const password = 'totvs@2025';
    const auth = btoa(`${username}:${password}`); // codifica em Base64
  
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${auth}` // Basic Auth
    };
  
    // firstValueFrom é preferível ao toPromise()
    const response: any = await firstValueFrom(this.http.get(url, { headers }));
    
    return response['items'];
  }

  
  public async getInvoices(entryDocId: string, buyOrderId: string, billId?: string): Promise<any[]> {
    const url: string = `http://priority189155.protheus.cloudtotvs.com.br:10757/rest/fbbol/invoices?ordemDeCompra=${entryDocId}&pedidoDeCompra=${buyOrderId}&fatura=${billId}`;
  
    const username = 'admin';
    const password = 'totvs@2025';
    const auth = btoa(`${username}:${password}`); // codifica em Base64
  
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${auth}` // Basic Auth
    };
  
    // firstValueFrom é preferível ao toPromise()
    const response: any = await firstValueFrom(this.http.get(url, { headers }));
    
    return response['items'];
  }
  public async getEntryDocs(): Promise<any[]> {
    try {
      const url: string = `http://priority189155.protheus.cloudtotvs.com.br:10757/rest/fbbol/entryDocs`;
  
      const username = 'admin';
      const password = 'totvs@2025';
      const auth = btoa(`${username}:${password}`); // codifica em Base64
  
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${auth}` // Basic Auth
      };
  
      const response: any = await firstValueFrom(this.http.get(url, { headers }));
  
      if (response && response['items']) {
        return response['items'];
      } else {
        return [];
      }
    } catch (err: any) {
      return [];
    }
  }
  

  public getProtheusInfo(requestJson: any, functionName: string): Observable<any> {
    const sendInfo: ProJsToAdvpl = {
      autoDestruct: false,
      receiveId: functionName,
      sendInfo: {
        type: functionName,
        content: JSON.stringify(requestJson),
      },
    };
  
    return new Observable((subscriber) => {
  
      this.proJsToAdvplService
        .buildObservable((response: { protheusResponse: any }) => {
  
          const { protheusResponse } = response;
  
          if (protheusResponse.length > 0) {
            subscriber.next(JSON.parse(protheusResponse));
          } else {
            subscriber.error({
              status: 400,
              description: `Error`,
            });
          }
  
          subscriber.complete();
        }, sendInfo)
        .subscribe((res) => {
        });
    });
  }
  
}
