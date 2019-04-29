const frisby = require('frisby');

const clone = require('clone');

const chalk = require('chalk');

const log = console.log;

/**
 * Request Body for SvcPayHalo/doInit
 */
function getSvcPayHaloDoInitRequestBody(){
    
    let requestBody = {
        "terminalId":1,
        "lang":"en",
        "productId":"FP00005"
    };

    return requestBody;
}
/**
 * Request body for doSubmitNoHp
 */
function getSvcPayHaloDoSubmitNoHp(){
    let requestBody = {
        "lang":"en"
    }
    return requestBody;
}

function getSvcPayHaloDoInitEdc(){
    let requestBody = {

    }
}
/**
 * Generate fake response of edc device response
 */
function generateEdcDeviceResponse(){
    return '\\u0006\\u0002BNI\\u000112001402000100012000014000007JCB PLATINUM   000032000030D000001260000000001260000356393******0167   JCB TEST TIK 1            190226203831      000000310000320000000000000000000000000000                   000000                                                                                        \\u0003r';
}

// test chainning method
it('should test payhalo interaction',()=>{
    // Test SvcPayHalo/doInit
    log()
    console.log('should call SvcPayHalo/doInit');
    return frisby.post('http://localhost:8080/SvcPayHalo/doInit',getSvcPayHaloDoInitRequestBody())
    .expect('status',200)
    .expect('json','responseCode','00')
    .then((doInitResponse)=>{
        console.log('should call SvcPayHalo/doSubmitNoHp');
        let nextUrl = doInitResponse.json.nextAct;
        // Init doSubmitNoHp requestBody
        let doSubmitNoHpRequest = getSvcPayHaloDoSubmitNoHp();
        doSubmitNoHpRequest.terminalId = doInitResponse.json.formBean.terminalId;
        doSubmitNoHpRequest.sessionId = doInitResponse.json.sessionId;
        doSubmitNoHpRequest.formBean = doInitResponse.json.formBean;

        return frisby.post('http://localhost:8080/'+nextUrl, doSubmitNoHpRequest)
        .expect('status',200)
        .then((doSubmitNoHpResponse)=>{
            console.log("should call SvcPayHalo/doInitEdc");
            // Init doInitEdc Request Body
            let doInitEdcRequest = clone(doSubmitNoHpRequest);
            doInitEdcRequest.formBean = doSubmitNoHpResponse.json.formBean;
            console.log(doInitEdcRequest);

            let urlEdc = doSubmitNoHpResponse.json.nextAct;
            return frisby.post('http://localhost:8080/'+urlEdc,doInitEdcRequest)
            .expect('status',200)
            .expect('json','responseCode','00')
            .then((doInitEdcResponse)=>{
               console.log('After init EDC response, should call SvcProcessEdc/doPaymentStatus');
               console.log(doInitEdcResponse);
               let doPaymentStatusRequest = {
                    'processId':doInitEdcResponse.json.sessionId,
                    'responseCode':0,
                    'edcRes':generateEdcDeviceResponse(),
               };
               return frisby.post('http://localhost:8080/SvcProcessEdc/doPaymentStatus',doPaymentStatusRequest)
               .expect('status',200)
               .expect('json','responseCode','00')
               .expect('json','formBean',{
                   state:'paymentSuccess'
               })
               .then((doPaymentStatusResponse)=>{
                    console.log(doPaymentStatusResponse);
                    console.log('Should call SvcPayHalo/doValPayment');
                    let doValPaymentRequest = {
                        'sessionId':doPaymentStatusResponse.json.sessionId,
                        'terminalId':doPaymentStatusResponse.json.formBean.terminalId,
                        'lang':doPaymentStatusResponse.json.lang,
                        'formBean':doPaymentStatusResponse.json.formBean
                    };
                    return frisby.post('http://localhost:8080/SvcPayHalo/doValPayment', doValPaymentRequest)
                    .expect('status',200)
                    .expect('json','responseCode','00')
                    .then((doValPaymentResponse)=>{
                        console.log(doValPaymentResponse);
                    });
                });
            });
        });
    });
});