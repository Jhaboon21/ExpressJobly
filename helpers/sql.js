const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
/**
 * This helper function takes the params of dataToUpdate and jsToSql and turns them into into setCols and values that 
 * can be used in a SQL update statement/query
 * 
 * @param dataToUpdate 
 * @param jsToSql 
 * @returns {Object} {setCols, values}
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Jimmy', age: 28} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    // {"firstName"=$1, "age"=$2}
    setCols: cols.join(", "),
    // ["Jimmy", 28]
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
