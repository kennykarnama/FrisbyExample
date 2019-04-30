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
it('should test get external server exception',()=>{
    // Test SvcPayHalo/doInit
    log()
    console.log('should call SvcPayHalo/doInit');
    return frisby.post('http://localhost:8080/SvcPayHalo/doInit',getSvcPayHaloDoInitRequestBody())
    .expect('status',200)
    .expect('json','rcKeyUi','TLGSE01');
});