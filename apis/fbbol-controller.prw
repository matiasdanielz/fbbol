#include 'protheus.ch'
#include 'topconn.ch'
#Include "Totvs.ch"
#Include "parmtype.ch"
#Include "tbiconn.ch"

class FBBOLController from longclassname
    static method getEntryDocs()
    static method getBuyOrders()
    static method getBills()
    static method getInvoices()
endclass

static method getEntryDocs() class FBBOLController
    local oResponse := JsonObject():New()
    local oFBBOLModel := JsonObject():New()

    oFBBOLModel := FBBOLModel():New()

    oResponse['items'] := oFBBOLModel:getEntryDocs()

    return oResponse

static method getBuyOrders() class FBBOLController
    local oResponse := JsonObject():New()
    local oFBBOLModel := JsonObject():New()

    oFBBOLModel := FBBOLModel():New()

    oResponse['items'] := oFBBOLModel:getBuyOrders()

    return oResponse

static method getBills() class FBBOLController
    local oResponse := JsonObject():New()
    local oFBBOLModel := JsonObject():New()

    oFBBOLModel := FBBOLModel():New()

    oResponse['items'] := oFBBOLModel:getBills()

    return oResponse

static method getInvoices(cBuyOrderId, cBuyRequestId, cBillId) class FBBOLController
    local oResponse := JsonObject():New()
    local oFBBOLModel := JsonObject():New()

    oFBBOLModel := FBBOLModel():New()

    oResponse['items'] := oFBBOLModel:getProducts(cBuyOrderId, cBuyRequestId, cBillId)

    return oResponse
