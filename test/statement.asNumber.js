const {expect} = require('chai');
const db2a = require('../lib/db2a');

const {dbstmt, dbconn} = db2a;


describe('dbstmt asNumber Flag', () => {
  it('should default to false', () => {
    const dbConn = new dbconn();

    dbConn.conn('*LOCAL');
    const dbStmt = new dbstmt(dbConn);
    let result = dbStmt.asNumber();
    expect(result).to.be.false;
  });


  it('when false should return numbers as strings', (done) => {
    const sql = `select 
      cast(-32768 as SMALLINT) MIN_SMALLINT,
      cast(+32767 as SMALLINT) MAX_SMALLINT
       from sysibm.sysdummy1`;
    const dbConn = new dbconn();
    dbConn.conn('*LOCAL');
    const dbStmt = new dbstmt(dbConn);
    
    dbStmt.asNumber(false);
    
    dbStmt.exec(sql, (result, error) => {
      expect(error).to.be.null;
      expect(result).to.be.an('array');
      expect(result.length).to.be.greaterThan(0);
      expect(result).to.eql([{"MIN_SMALLINT":"-32768",
                          "MAX_SMALLINT":"32767"}]);     
      done();
    });
  });

  it('when true should return numbers when safe to do so', (done) => {
    const sql = `select 
      cast(-32768 as SMALLINT) MIN_SMALLINT,
      cast(+32767 as SMALLINT) MAX_SMALLINT,
      cast(-2147483648 as INT) MIN_INT,
      cast(+2147483647 as INT) MAX_INT,
      cast(999999999999999 as DECIMAL(15,0)) as DEC_SAFE_15_0,
      cast(.999999999999999 as DECIMAL(15,15)) as DEC_SAFE_15_15,
      --these values do not fit in a javascript number datatype
      cast(-9223372036854775808 as BIGINT) MIN_BIGINT,
      cast(+9223372036854775807 as BIGINT) MAX_BIGINT,
      cast(9999999999999999 as DECIMAL(16,0)) as DEC_NOT_SAFE_16_0
       from sysibm.sysdummy1`;
    const dbConn = new dbconn();
    dbConn.conn('*LOCAL');
    const dbStmt = new dbstmt(dbConn);
    
    dbStmt.asNumber(true);

    dbStmt.exec(sql, (result, error) => {
      expect(error).to.be.null;
      expect(result).to.be.an('array');
      expect(result.length).to.be.greaterThan(0);
      expect(result).to.eql([{"MIN_SMALLINT":-32768,
                          "MAX_SMALLINT":32767,
                          "MIN_INT":-2147483648,
                          "MAX_INT":2147483647,
                          "DEC_SAFE_15_0": 999999999999999,
                          "DEC_SAFE_15_15":0.999999999999999,
                          "MIN_BIGINT": "-9223372036854775808",
                          "MAX_BIGINT": "9223372036854775807",
                          "DEC_NOT_SAFE_16_0":"9999999999999999"
                      }]);     
      done();
    });
  });
});