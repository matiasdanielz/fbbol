#include 'Totvs.ch'
#include 'RestFul.ch'

WSRESTFUL fbbol Description "Chatbot"
    WSDATA ordemDeCompra as string
    WSDATA pedidoDeCompra as string
    WSDATA fatura as string

    WSMETHOD GET buyOrders Description "Returns list of all sales order" WSSYNTAX "/buyOrders" PATH "/buyOrders"
    WSMETHOD GET invoices Description "Returns list of all invoices" WSSYNTAX "/invoices" PATH "/invoices"
    WSMETHOD GET entryDocs Description "Returns list of all entryDocs" WSSYNTAX "/entryDocs" PATH "/entryDocs"
    WSMETHOD GET bills Description "Returns list of all bills" WSSYNTAX "/bills" PATH "/bills"
END WSRESTFUL

WSMETHOD GET invoices WSRECEIVE ordemDeCompra, pedidoDeCompra, fatura WSSERVICE fbbol
    local jResponse := JsonObject():New()
    local cBuyOrderId := ::ordemDeCompra
    local cBuyRequestId := ::pedidoDeCompra
    local cBill := ::fatura

    self:SetContentType('application/json')

    jResponse := FBBOLController():getInvoices(cBuyOrderId, cBuyRequestId, cBill)

    self:setresponse(jResponse)
    return .t.

WSMETHOD GET buyOrders WSSERVICE fbbol
    local jResponse := JsonObject():New()

    self:SetContentType('application/json')

    jResponse := FBBOLController():getBuyOrders()['items']

    self:setresponse(jResponse)
    return .t.

WSMETHOD GET entryDocs WSSERVICE fbbol
    local jResponse := JsonObject():New()

    self:SetContentType('application/json')

    jResponse := FBBOLController():getEntryDocs()

    self:setresponse(jResponse)
    return .t.

WSMETHOD GET bills WSSERVICE fbbol
    local jResponse := JsonObject():New()

    self:SetContentType('application/json')

    jResponse := FBBOLController():getBills()

    self:setresponse(jResponse)
    return .t.
