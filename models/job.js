"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
    /** Create a job from data, update db, and return new job data.
     * 
     * data should be { title, salary, equity, companyHandle }
     *
     * Returns { id, title, salary, equity, companyHandle }
     *
     * Throws BadRequestError if company already in database. 
     */

    static async create(data) {
        const result = await db.query(
            `INSERT INTO jobs (title, salary, equity, company_handle) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
            [ data.title, data.salary, data.equity, data.companyHandle ]
        );
        let job = result.rows[0];
        return job;
    }

    /** Find all jobs (optionally use filter on searchFilters).
     * 
     * searchFilters (all optional):
     *  - title (case-insensitive and matches any part of string)
     *  - minSalary
     *  - hasEquity (if true, provide a non zero amount of equity)
     * 
     * Returns [ { id, title, salary, equity, companyHandle, companyName }, ...]
     */

    static async findAll({title, minSalary, hasEquity} = {}) {
        let query = `SELECT j.id,
                            j.title, 
                            j.salary,
                            j.equity,
                            j.company_handle AS "companyHandle",
                            c.name AS "companyName" 
                    FROM jobs AS j 
                    LEFT JOIN companies AS c ON c.handle = j.company_handle`;
        let whereExpression = [];
        let search = [];

        // determine the filters
        if (minSalary !== undefined) {
            search.push(minSalary);
            whereExpression.push(`salary >= $${search.length}`);
        }

        if (hasEquity === true) {
            whereExpression.push(`equity > 0`);
        }

        if (title !== undefined) {
            search.push(`%${title}%`);
            whereExpression.push(`title ILIKE $${search.length}`);
        }

        if (whereExpression.length > 0) {
            query += " WHERE " + whereExpression.join(" AND ");
        }
        query += " ORDER BY title";
        const jobResult = await db.query(query, search);
        return jobResult.rows;
    }

    /** Given a job id, return data about the job.
     * 
     * Returns { id, title, salary, equity, companyHandle, company }
     *      where company: { handle, name, description, numEmployees, logoUrl }
     * 
     *  Throws NotFoundError if not found.
     */

    static async get(id) {
        const jobResult = await db.query(
                    `SELECT id, 
                            title,
                            salary, 
                            equity, 
                            company_handle AS "companyHandle" 
                    FROM jobs 
                    WHERE id = $1`, [id]
        );
        const job = jobResult.rows[0];

        if (!job) throw new NotFoundError(`Job Not Found: ${id}`);

        const companyResult = await db.query(
                    `SELECT handle, 
                            name, 
                            description, 
                            num_employees AS "numEmployees", 
                            logo_url AS "logoUrl" 
                    FROM companies 
                    WHERE handle = $1`, [job.companyHandle]
        );
        delete job.companyHandle;
        job.company = companyResult.rows[0];
        return job;
    }

    /** Update job data
     * 
     * Can update data of title, salary, and equity
     * 
     * Returns { id, title, salary, equity, companyHandle }
     * 
     * Throws NotFoundError if not found.
     */

    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate( data, {} );
        const idIndex = "$" + (values.length + 1);
        const query =  `UPDATE jobs 
                        SET ${setCols} 
                        WHERE id = ${idIndex} 
                        RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;

        const result = await db.query(query, [...values, id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`Job Not Found: ${id}`);

        return job;
    }

    /** Delete job 
     * 
     * Returns undefined
     * 
     * Throws NotFoundError if no job was found.
     */

    static async remove(id) {
        const result = await db.query(
            `DELETE FROM jobs 
            WHERE id = $1 
            RETURNING id`, [id]
        );
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`Job Not Found: ${id}`);
    }
}

module.exports = Job;