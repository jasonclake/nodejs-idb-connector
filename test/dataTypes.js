const {expect} = require('chai');
const util = require('util');
const fs = require('fs');
const db2a = require('../lib/db2a');

const {
  BLOB, BINARY, IN, dbstmt, dbconn,
} = db2a;

describe('Data Type Test', () => {
  describe('select number types', () => {
    it('smallint', (done) => {
      const sql = 'select * from (values smallint( -32768 )) as x (smallint_val)';
      const dbConn = new dbconn();

      dbConn.conn('*LOCAL');

      const dbStmt = new dbstmt(dbConn);

      dbStmt.exec(sql, (result, error) => {
        expect(error).to.be.null;
        expect(result).to.be.an('array');
        expect(result.length).to.be.greaterThan(0);
        expect(Object.values(result[0])[0]).to.equal('-32768');
        done();
      });
    });


    it('int', (done) => {
      const sql = 'select * from (values int( -2147483648 )) as x (int_val)';
      const dbConn = new dbconn();

      dbConn.conn('*LOCAL');

      const dbStmt = new dbstmt(dbConn);

      dbStmt.exec(sql, (result, error) => {
        expect(error).to.be.null;
        expect(result).to.be.an('array');
        expect(result.length).to.be.greaterThan(0);
        expect(Object.values(result[0])[0]).to.equal('-2147483648');
        done();
      });
    });


    it('bigint', (done) => {
      const sql = 'select * from (values bigint( -9223372036854775808 )) as x (bigint_val)';
      const dbConn = new dbconn();

      dbConn.conn('*LOCAL');

      const dbStmt = new dbstmt(dbConn);

      dbStmt.exec(sql, (result, error) => {
        expect(error).to.be.null;
        expect(result).to.be.an('array');
        expect(result.length).to.be.greaterThan(0);
        expect(Object.values(result[0])[0]).to.equal('-9223372036854775808');
        done();
      });
    });

    /* Currently Does not pass real type not supported yet
    it('real', (done) => {
      let sql = 'select * from (values real( -12345.54321 )) as x (real_val)',
        dbConn = new dbconn();

      dbConn.conn('*LOCAL');

      let dbStmt = new dbstmt(dbConn);

      dbStmt.exec(sql, (result, error) => {
        expect(error).to.be.null;
        expect(result).to.be.an('array');
        expect(result.length).to.be.greaterThan(0);
        expect(Object.values(result[0])[0] ).to.equal("-12345.54321");
        done();
      });
    });
   */
  });


  describe('bind parameters blob/binary/varbinary', () => {
    before(() => {
      const user = (process.env.USER).toUpperCase();
      const sql = `CREATE SCHEMA ${user}`;
      const sql2 = `CREATE OR REPLACE TABLE ${user}.BLOBTEST(BLOB_COLUMN BLOB(512k))`;
      const sql3 = `CREATE OR REPLACE TABLE ${user}.BINARYTEST(BINARY_COLUMN BINARY(3000))`;
      const sql4 = `CREATE OR REPLACE TABLE ${user}.VARBINARYTEST(VARBINARY_COLUMN VARBINARY(3000))`;
      const dbConn = new dbconn();

      dbConn.conn('*LOCAL');
      const dbStmt = new dbstmt(dbConn);

      dbStmt.exec(sql, (result, error) => {
        // if Schema already exsists will error but ignore
        dbStmt.closeCursor();
        dbStmt.exec(sql2, (result, error) => {
          dbStmt.closeCursor();
          dbStmt.exec(sql3, (result, error) => {
            dbStmt.closeCursor();
            dbStmt.exec(sql4, (result, error) => {});
          });
        });
      });
    });


    it('runs SQLExecute and to bind blob', (done) => {
      const user = (process.env.USER).toUpperCase();
      // Table which only contains one BLOB(512k) Field
      const sql = `INSERT INTO ${user}.BLOBTEST(BLOB_COLUMN) VALUES(?)`;
      const dbConn = new dbconn();

      fs.readFile(`${__dirname}/../README.md`, (error, buffer) => {
        if (error) {
          throw error;
        }

        dbConn.conn('*LOCAL');
        const dbStmt = new dbstmt(dbConn);

        dbStmt.prepare(sql, (error) => {
          if (error) {
            throw error;
          }
          dbStmt.bindParam([[buffer, IN, BLOB]], (error) => {
            if (error) {
              throw error;
            }
            dbStmt.execute((result, error) => {
              if (error) {
                console.log(util.inspect(error));
                throw error;
              }
              expect(error).to.be.null;
              done();
            });
          });
        });
      });
    });


    it('runs SQLExecute and to bind binary', (done) => {
      const user = (process.env.USER).toUpperCase();
      // Table which only contains one BLOB(10) Field
      const sql = `INSERT INTO ${user}.BINARYTEST(BINARY_COLUMN) VALUES(?)`;
      const dbConn = new dbconn();

      fs.readFile(`${__dirname}/../README.md`, (error, buffer) => {
        if (error) {
          throw error;
        }

        dbConn.conn('*LOCAL');
        const dbStmt = new dbstmt(dbConn);

        dbStmt.prepare(sql, (error) => {
          if (error) {
            throw error;
          }
          dbStmt.bindParam([[buffer, IN, BINARY]], (error) => {
            if (error) {
              throw error;
            }
            dbStmt.execute((result, error) => {
              if (error) {
                throw error;
              }
              expect(error).to.be.null;
              done();
            });
          });
        });
      });
    });


    it('runs SQLExecute and to bind varbinary', (done) => {
      const user = (process.env.USER).toUpperCase();
      // Table which only contains one VARBINARY(10) Field
      const sql = `INSERT INTO ${user}.VARBINARYTEST(VARBINARY_COLUMN) VALUES(?)`;
      const dbConn = new dbconn();

      fs.readFile(`${__dirname}/../README.md`, (error, buffer) => {
        if (error) {
          throw error;
        }
        dbConn.conn('*LOCAL');
        const dbStmt = new dbstmt(dbConn);

        dbStmt.prepare(sql, (error) => {
          if (error) {
            throw error;
          }
          dbStmt.bindParam([[buffer, IN, BLOB]], (error) => {
            if (error) {
              throw error;
            }
            dbStmt.execute((result, error) => {
              if (error) {
                console.log(util.inspect(error));
                throw error;
              }
              expect(error).to.be.null;
              done();
            });
          });
        });
      });
    });
  });


  describe('exec read blob test', () => {
    it('performs action of given SQL String', (done) => {
      const sql = 'SELECT CAST(\'test\' AS BLOB(10k)) FROM SYSIBM.SYSDUMMY1';
      const dbConn = new dbconn();

      dbConn.conn('*LOCAL');

      const dbStmt = new dbstmt(dbConn);

      dbStmt.exec(sql, (result, error) => {
        if (error) {
          console.log(util.inspect(error));
          throw error;
        }
        expect(error).to.be.null;
        expect(result).to.be.an('array');
        expect(result.length).to.be.greaterThan(0);
        expect(Object.values(result[0])[0]).to.be.instanceOf(Buffer);
        done();
      });
    });
  });


  describe('exec read binary test', () => {
    it('performs action of given SQL String', (done) => {
      const sql = 'SELECT CAST(\'test\' AS BINARY(10)) FROM SYSIBM.SYSDUMMY1';
      const dbConn = new dbconn();

      dbConn.conn('*LOCAL');

      const dbStmt = new dbstmt(dbConn);

      dbStmt.exec(sql, (result, error) => {
        if (error) {
          console.log(util.inspect(error));
          throw error;
        }
        expect(error).to.be.null;
        expect(result).to.be.an('array');
        expect(result.length).to.be.greaterThan(0);
        expect(Object.values(result[0])[0]).to.be.instanceOf(Buffer);
        done();
      });
    });
  });


  describe('exec read varbinary test', () => {
    it('performs action of given SQL String', (done) => {
      const sql = 'SELECT CAST(\'test\' AS VARBINARY(10)) FROM SYSIBM.SYSDUMMY1';
      const dbConn = new dbconn();

      dbConn.conn('*LOCAL');

      const dbStmt = new dbstmt(dbConn);

      dbStmt.exec(sql, (result, error) => {
        if (error) {
          console.log(util.inspect(error));
          throw error;
        }
        expect(error).to.be.null;
        expect(result).to.be.an('array');
        expect(result.length).to.be.greaterThan(0);
        expect(Object.values(result[0])[0]).to.be.instanceOf(Buffer);
        done();
      });
    });
  });
});
