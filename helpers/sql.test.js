const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {  
    test("Pass 1 item in", function () {
        const dataToUpdate = { "firstName": "value1" };
        const jsToSql = {
            firstName: "first_name",
        };
        const result = sqlForPartialUpdate(dataToUpdate, jsToSql)
        expect(result).toEqual({
            setCols: `"first_name"=$1`,
            values: ["value1"]
        });
    });
  
    test("Pass 2 items in", function () {
        const dataToUpdate = { "firstName": "value1", "lastName": "value2" };
        const jsToSql = {
            firstName: "first_name",
            lastName: "last_name"
        };
        const result = sqlForPartialUpdate(dataToUpdate, jsToSql)
        expect(result).toEqual({
            setCols: `"first_name"=$1, "last_name"=$2`,
            values: ["value1", "value2"]
        });
    });
  });