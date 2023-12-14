"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError.js");
const Job = require("./job.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterAll, 
    commonAfterEach,
    testJobIds
} = require("./_testCommon.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
    let newJob = {
        companyHandle: "c1", 
        title: "Test", 
        salary: 100, 
        equity: "0.1"
    };

    test("works", async function () {
        let job = await Job.create(newJob);
        expect(job).toEqual({
            ...newJob, 
            id: expect.any(Number)
        });
    });
});

/************************************** findAll */

describe("findAll", function () {
    test("find all with no filters", async function () {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                id: testJobIds[0],
                title: "job1",
                salary: 100,
                equity: "0.1",
                companyHandle: "c1",
                companyName: "C1"
            },
            {
                id: testJobIds[1],
                title: "job2",
                salary: 200,
                equity: "0.2",
                companyHandle: "c1",
                companyName: "C1",
            },
            {
                id: testJobIds[2],
                title: "job3",
                salary: 300,
                equity: "0",
                companyHandle: "c1",
                companyName: "C1",
            },
            {
                id: testJobIds[3],
                title: "job4",
                salary: null,
                equity: null,
                companyHandle: "c1",
                companyName: "C1",
            },
        ]);
    });

    test("find all using minSalary filter", async function () {
        let jobs = await Job.findAll({ minSalary: 299 });
        expect(jobs).toEqual([
            {
                id: testJobIds[2],
                title: "job3", 
                salary: 300,
                equity: "0", 
                companyHandle: "c1", 
                companyName: "C1"
            }
        ]);
    });

    test("find all using equity filter", async function () {
        let jobs = await Job.findAll({ hasEquity: true });
        expect(jobs).toEqual([
            {
                id: testJobIds[0], 
                title: "job1", 
                salary: 100, 
                equity: "0.1", 
                companyHandle: "c1", 
                companyName: "C1"
            },
            {
                id: testJobIds[1],
                title: "job2",
                salary: 200,
                equity: "0.2",
                companyHandle: "c1",
                companyName: "C1",
            }
        ]);
    });

    test("find all using both minSalary and equity filter", async function () {
        let jobs = await Job.findAll({ minSalary: 150, hasEquity: true });
        expect(jobs).toEqual([
            {
                id: testJobIds[1],
                title: "job2",
                salary: 200,
                equity: "0.2",
                companyHandle: "c1",
                companyName: "C1",
            }
        ]);
    });

    test("find all using name", async function () {
        let jobs = await Job.findAll({ title: "job1" });
        expect(jobs).toEqual([
            {
                id: testJobIds[0], 
                title: "job1", 
                salary: 100, 
                equity: "0.1", 
                companyHandle: "c1", 
                companyName: "C1"
            }
        ]);
    });
});

/************************************** get */

describe("GET", function () {
    test("get a single job", async function () {
        let job = await Job.get(testJobIds[0]);
        expect(job).toEqual({
            id: testJobIds[0], 
            title: "job1", 
            salary: 100, 
            equity: "0.1", 
            company: {
                handle: "c1", 
                name: "C1", 
                description: "Desc1", 
                numEmployees: 1, 
                logoUrl: "http://c1.img"
            }
            
        });
    });

    test("throw NotFoundError if no job was found", async function () {
        try {
            await Job.get(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************************** update */

describe("UPDATE", function () {
    let updateData = {
        title: "New", 
        salary: 1000, 
        equity: "0.9"
    };
    test("update job data", async function () {
        let job = await Job.update(testJobIds[0], updateData);
        expect(job).toEqual({
            id: testJobIds[0],
            companyHandle: "c1", 
            ...updateData
        });
    });

    test("throw NotFoundError if not found", async function () {
        try {
            await Job.update(999, {title: "fake"});
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("throw BadRequestError if missing data", async function () {
        try {
            await Job.update(testJobIds[0], {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** remove */

describe("REMOVE", function () {
    test("Delete job", async function () {
        await Job.remove(testJobIds[0]);
        const res = await db.query(
            "SELECT id FROM jobs WHERE id=$1", [testJobIds[0]]
        );
        expect(res.rows.length).toEqual(0);
    });

    test("throw NotFoundError if not found", async function () {
        try {
            await Job.remove(999);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});