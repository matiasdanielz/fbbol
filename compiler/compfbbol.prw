#Include 'Protheus.ch'

User function CompFbbol(cType, cContent)
  FwCallApp("fbbol")
  
  return .t.

Static Function JsToAdvpl(oWebChannel,cType,cContent)
	local cResponse := " "
  local oAuxJson := JsonObject():New()

	oAuxJson:fromJson(cContent)

  if cType != "preLoad"
    Do Case
      Case cType == 'GetBuyOrders'
        cResponse = FBBOLController():getBuyOrders()

        cResponse := FWJsonSerialize(@cResponse, cResponse)

        oWebChannel:AdvplToJs(cType, cResponse)
      Case cType == 'GetEntryDocs'
        cResponse = FBBOLController():getEntryDocs()

        cResponse := FWJsonSerialize(@cResponse, cResponse)

        oWebChannel:AdvplToJs(cType, cResponse)
      Case cType == 'GetProducts'
        cResponse = FBBOLController():getInvoices(oAuxJson['buyOrderId'], oAuxJson['buyRequestId'], oAuxJson['billId'])

        cResponse := FWJsonSerialize(@cResponse, cResponse)

        oWebChannel:AdvplToJs(cType, cResponse)
      Case cType == 'GetBills'
        cResponse = FBBOLController():getBills()

        cResponse := FWJsonSerialize(@cResponse, cResponse)

        oWebChannel:AdvplToJs(cType, cResponse)
      End
  endif

  return .T.
