#include 'protheus.ch'
#include 'topconn.ch'
#Include "Totvs.ch"
#Include "parmtype.ch"
#Include "tbiconn.ch"

class FBBOLModel from longclassname
    method new() CONSTRUCTOR
    method getEntryDocs()
    method getBuyOrders()
    method getBills()
    method getProducts()
    method getBuyOrdByProduct()
    method getInvoicesByProduct()
endclass

method New() class FBBOLModel
    return self

method getBills() class FBBOLModel
    local aBills            := {}
    local oBill             := JsonObject():New()
    local nIndex            := 1
    local nJndex            := 1
    local nAmountOfProducts := 0

    BeginSql alias "SQL_BILLS"
        SELECT
            C5_PEDEXP,
            A1_NOME
        FROM
            SC5010 SC5
        LEFT JOIN 
            SA1010 SA1 ON SA1.A1_COD = SC5.C5_CLIENTE AND SA1.A1_LOJA = SC5.C5_LOJACLI
        WHERE
            SC5.D_E_L_E_T_ = ''
            AND C5_PEDEXP != ''
        ORDER BY
            C5_NUM DESC
    EndSql

    While !SQL_BILLS->(EoF())
        aProducts := ::getProducts('', '', SQL_BILLS->C5_PEDEXP)
        For nIndex := 1 to len(aProducts)
            For nJndex := 1 to len(aProducts[nIndex]['fornecedores'])
                nAmountOfProducts += aProducts[nIndex]['fornecedores'][nJndex]['quantidade']
            Next
        Next

        For nIndex := 1 to len(aProducts)
            For nJndex := 1 to len(aProducts[nIndex]['clientes'])
                nAmountOfProducts += aProducts[nIndex]['clientes'][nJndex]['quantidade']
            Next
        Next

        oBill[ 'codigo' ] := ALLTRIM(SQL_BILLS->C5_PEDEXP)
        oBill[ 'nomeCliente' ] := ALLTRIM(SQL_BILLS->A1_NOME)
        oBill[ 'produtosVendidos' ] := nAmountOfProducts

        nAmountOfProducts := 0

        aadd(aBills, oBill)
        oBill := JsonObject():New()

        SQL_BILLS->(DbSkip())
    EndDo
    SQL_BILLS->(DbCloseArea())

    return aBills


method getBuyOrders() class FBBOLModel
    local aBuyOrders        := {}
    local oBuyOrder         := JsonObject():New()
    local nIndex            := 1
    local nJndex            := 1
    local nAmountOfProducts := 0

    BeginSql alias "SQL_BUY_ORDERS"
        SELECT
            C7_NUM,
            MAX(A2_NOME) A2_NOME
        FROM
            SC7010 SC7
        LEFT JOIN
            SA2010 SA2 ON SA2.A2_COD = C7_FORNECE AND SA2.D_E_L_E_T_ = ''
        WHERE
            SC7.D_E_L_E_T_ = ''
        AND 
            SC7.C7_NUMSC != ''
        GROUP BY
            C7_NUM
        ORDER BY
            C7_NUM DESC
    EndSql

    While !SQL_BUY_ORDERS->(EoF())
        aProducts := ::getProducts(SQL_BUY_ORDERS->C7_NUM, '')
        For nIndex := 1 to len(aProducts)
            For nJndex := 1 to len(aProducts[nIndex]['clientes'])
                nAmountOfProducts += aProducts[nIndex]['clientes'][nJndex]['quantidade']
            Next
        Next

        oBuyOrder[ 'codigo' ]           := ALLTRIM(SQL_BUY_ORDERS->C7_NUM)
        oBuyOrder[ 'nomeFornecedor' ]   := ALLTRIM(SQL_BUY_ORDERS->A2_NOME)
        oBuyOrder[ 'produtosVendidos' ] := nAmountOfProducts

        nAmountOfProducts := 0

        aadd(aBuyOrders, oBuyOrder)
        oBuyOrder := JsonObject():New()

        SQL_BUY_ORDERS->(DbSkip())
    EndDo
    SQL_BUY_ORDERS->(DbCloseArea())

    return aBuyOrders

method getEntryDocs() class FBBOLModel
    local aEntryDocs        := {}
    local oEntryDoc         := JsonObject():New()
    local nIndex            := 1
    local nJndex            := 1
    local nAmountOfProducts := 0

    BeginSql alias "SQL_ENTRY_DOCS"
        SELECT
            C5_NUM,
            Max(A2_NOME) A2_NOME,
            Max(C5_TIPO) C5_TIPO
        FROM
            SF1010
            LEFT JOIN SD1010 SD1 ON SD1.D1_DOC = F1_DOC
            AND D1_SERIE = F1_SERIE
            AND D1_FORNECE = F1_FORNECE
            AND D1_LOJA = F1_LOJA
            LEFT JOIN SC5010 SC5 ON SC5.C5_NUM = D1_PEDIDO
            LEFT JOIN SA2010 SA2 ON SA2.A2_COD = F1_FORNECE
        GROUP BY
            C5_NUM
        ORDER BY
            C5_NUM DESC 
    EndSql

    While !SQL_ENTRY_DOCS->(EoF())
        aProducts := ::getProducts('', SQL_ENTRY_DOCS->C5_NUM)
        For nIndex := 1 to len(aProducts)
            For nJndex := 1 to len(aProducts[nIndex]['clientes'])
                nAmountOfProducts += aProducts[nIndex]['clientes'][nJndex]['quantidade']
            Next
        Next

        oEntryDoc[ 'codigo' ]           := ALLTRIM(SQL_ENTRY_DOCS->C5_NUM)
        oEntryDoc[ 'nomeFornecedor' ]   := ALLTRIM(SQL_ENTRY_DOCS->A2_NOME)
        oEntryDoc[ 'tipo' ]             := ALLTRIM(SQL_ENTRY_DOCS->C5_TIPO)
        oEntryDoc[ 'produtosVendidos' ] := nAmountOfProducts

        nAmountOfProducts := 0

        aadd(aEntryDocs, oEntryDoc)
        oEntryDoc := JsonObject():New()

        SQL_ENTRY_DOCS->(DbSkip())
    EndDo
    SQL_ENTRY_DOCS->(DbCloseArea())

    return aEntryDocs

method getProducts(cBuyOrderId, cEntryDocId, cBillId) class FBBOLModel
    local aProducts := {}
    local oProduct := JsonObject():New()
    local cWhere := ""
    Default cEntryDocId := ""
    Default cBuyOrderId := ""
    Default cBillId := ""

    If Alltrim(cBuyOrderId) != ''
        cWhere := "C7_NUMSC = '" + cBuyOrderId + "'"
    Elseif Alltrim(cEntryDocId) != ''
        cWhere := "C7_NUM = '" + cEntryDocId + "'"
    Else
        cWhere := "C5_PEDEXP = '" + cBillId + "'"
    EndIf

    cWhere := "%" + cWhere + "%"

    BeginSql alias "SQL_PRODUCTS"
        SELECT
            MAX(C7_PRODUTO) CODIGO,
            MAX(B1_DESC) DESCRICAO,
            MAX(C7_NUM) C7_NUM,
            MAX(C5_PEDEXP) C5_PEDEXP
        FROM
            SC7010 SC7
            LEFT JOIN SC6010 SC6 ON SC6.C6_FILIAL = '0101' AND C6_NUMSC = C7_NUMSC AND SC6.D_E_L_E_T_ = ''
            LEFT JOIN SC5010 SC5 ON SC5.C5_FILIAL = '0101' AND C5_NUM = C6_NUM AND SC5.D_E_L_E_T_ = ''
            LEFT JOIN SB1010 SB1 ON SB1.B1_COD = SC7.C7_PRODUTO AND SB1.D_E_L_E_T_ = ''
        WHERE
            %Exp:cWhere%
            AND SC7.D_E_L_E_T_ = ''
        GROUP BY
            C5_PEDEXP,
            C7_PRODUTO
    EndSql

    While !SQL_PRODUCTS->(EoF())
        oProduct[ 'codigo' ]         := ALLTRIM(SQL_PRODUCTS->CODIGO)
        oProduct[ 'descricao' ]      := ALLTRIM(SQL_PRODUCTS->DESCRICAO)
        oProduct[ 'fornecedores' ]   := ::getBuyOrdByProduct(SQL_PRODUCTS->CODIGO, cBillId)
        oProduct[ 'clientes' ]       := ::getInvoicesByProduct(SQL_PRODUCTS->CODIGO, cBuyOrderId, cEntryDocId, cBillId)

        aadd(aProducts, oProduct)
        oProduct := JsonObject():New()

        SQL_PRODUCTS->(DbSkip())
    EndDo
    SQL_PRODUCTS->(DbCloseArea())

    return aProducts

method getBuyOrdByProduct(cProductId, cFatura) class FBBOLModel
    local aBuyOrders := {}
    local oBuyOrder := JsonObject():New()
    default cFatura := ""

    BeginSql alias "SQL_BUYORDERS"
        SELECT
            D1_DOC,
            C7_NUM,
            C5_PEDEXP,
            MAX(A1_NOME) CLIENTE,
            SUM(C7_QUANT) QUANTIDADE,
            MAX(C7_PRODUTO) PRODUTO
        FROM
            SD1010 SD1
            LEFT JOIN SC7010 SC7 ON SC7.C7_NUM = D1_PEDIDO
            LEFT JOIN SC6010 SC6 ON C6_NUMSC = C7_NUMSC
            LEFT JOIN SC5010 SC5 ON C5_NUM = C6_NUM
            LEFT JOIN SA1010 SA1 ON SA1.A1_COD = SC5.C5_CLIENTE AND SA1.A1_LOJA = SC5.C5_LOJACLI
            LEFT JOIN SB1010 SB1 ON SB1.B1_COD = SC7.C7_PRODUTO
        WHERE
            (
                %Exp:cFatura% = ''
                OR C5_PEDEXP = %Exp:cFatura%
            )
            AND C5_PEDEXP != ''
            AND SC7.D_E_L_E_T_ = ''
        GROUP BY
            D1_DOC,
            C7_NUM,
            C5_PEDEXP,
            C7_PRODUTO
    EndSql

    While !SQL_BUYORDERS->(EoF())
        oBuyOrder[ 'nome' ]          := ALLTRIM(SQL_BUYORDERS->CLIENTE)
        oBuyOrder[ 'quantidade' ]    := SQL_BUYORDERS->QUANTIDADE
        oBuyOrder[ 'fatura' ]        := ALLTRIM(SQL_BUYORDERS->C5_PEDEXP)
        oBuyOrder[ 'ordemDeCompra' ] := ALLTRIM(SQL_BUYORDERS->C7_NUM)

        aadd(aBuyOrders, oBuyOrder)
        oBuyOrder := JsonObject():New()

        SQL_BUYORDERS->(DbSkip())
    EndDo
    SQL_BUYORDERS->(DbCloseArea())

    return aBuyOrders


method getInvoicesByProduct(cProductId, cBuyOrderId, cEntryDocId, cFatura) class FBBOLModel
    local aInvoices := {}
    local oInvoice  := JsonObject():New()
    local cWhere    := ""

    If Alltrim(cBuyOrderId) != ''
        cWhere := "C7_NUMSC = '" + cBuyOrderId + "'"
    Elseif Alltrim(cEntryDocId) != ''
        cWhere := "C7_NUM = '" + cEntryDocId + "'"
    Else
        cWhere := "C5_PEDEXP = '" + cEntryDocId + "'"
    EndIf

    cWhere := "%" + cWhere + "%"

    BeginSql alias "SQL_INVOICES"
        SELECT
            C5_PEDEXP,
            C7_NUM,
            MAX(A1_NOME) CLIENTE,
            SUM(C7_QUANT) QUANTIDADE,
            MAX(C7_PRODUTO) PRODUTO
        FROM
            SC7010 SC7
            LEFT JOIN SC6010 SC6 ON C6_NUMSC = C7_NUMSC AND SC6.D_E_L_E_T_ = ''
            LEFT JOIN SC5010 SC5 ON C5_NUM = C6_NUM AND SC5.D_E_L_E_T_ = ''
            LEFT JOIN SA1010 SA1 ON SA1.A1_COD = SC5.C5_CLIENTE AND SA1.A1_LOJA = SC5.C5_LOJACLI AND SA1.D_E_L_E_T_ = ''
            LEFT JOIN SB1010 SB1 ON SB1.B1_COD = SC7.C7_PRODUTO AND SB1.D_E_L_E_T_ = ''
        WHERE
            %Exp:cWhere%
            AND C7_PRODUTO = %Exp:cProductId%
            AND C5_PEDEXP != ''
            AND SC7.D_E_L_E_T_ = ''
        GROUP BY
            C5_PEDEXP,
            C7_PRODUTO,
            C7_NUM
    EndSql

    While !SQL_INVOICES->(EoF())
        oInvoice[ 'nome' ]           := ALLTRIM(SQL_INVOICES->CLIENTE)
        oInvoice[ 'quantidade' ]     := SQL_INVOICES->QUANTIDADE
        oInvoice[ 'fatura' ]         := ALLTRIM(SQL_INVOICES->C5_PEDEXP)
        oInvoice[ 'notaFiscal' ]     := ALLTRIM(SQL_INVOICES->C7_NUM)

        aadd(aInvoices, oInvoice)
        oInvoice := JsonObject():New()

        SQL_INVOICES->(DbSkip())
    EndDo
    SQL_INVOICES->(DbCloseArea())

    return aInvoices
