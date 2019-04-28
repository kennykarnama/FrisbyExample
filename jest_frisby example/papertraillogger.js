const frisby = require('frisby');


it('should response with papertrail message', ()=>{
  return frisby.get('http://localhost:8082/papertrail_logger-0.0.1-SNAPSHOT/hello')
  .expect('status', 200)
  .expect('json','msg','Hello papertrail logging')
  .then((res)=>{
      let msgIncoming = res.json.msg;
      let newMessageOut = "This is replied back sir "+msgIncoming;
      return frisby.post('http://localhost:8082/papertrail_logger-0.0.1-SNAPSHOT/hello2',{
        msg:newMessageOut
      })
      .expect('status',200)
      .expect('json','msg',"You send "+newMessageOut)
  });
});