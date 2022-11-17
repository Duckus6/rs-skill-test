import app, {readDatabase} from './app'
import supertest from 'supertest'
import fs from 'fs'
import {jest} from '@jest/globals'


jest.mock('fs', ()=> ({
	promises:{
		writeFileSync: jest.fn()
	} 
}))


const dummyProduct = {	"stock_number": "2",
	"name": "Pro Batteries",
	"description": "Batteries",
	"Price": "£1.99",
}
const dummyProduct2 = {	"stock_number": "2",
	"name": "Pro Batteries",
	"description": "Batteries",
	"Price": "£2.99",
}
const exampleError = {
	"text": "Something went wrong",
	"code": "ECONNREFUSED"
}

describe("Test Get method", () => {

	test("GET Get an existing product", async () => {
		jest.spyOn(fs, "readFileSync").mockReturnValueOnce(JSON.stringify({products: [dummyProduct]}))
		const response = await supertest(app).get("/products/2")
		expect(JSON.parse(response.text)).toEqual(dummyProduct)
	})
	test("GET Get a non existant product", async () => {
		jest.spyOn(fs, "readFileSync").mockReturnValueOnce(JSON.stringify({products: [dummyProduct]}))
		const response = await supertest(app).get("/products/3")
		expect(response.statusCode).toBe(404)
	})
	test("GET database failure", async () => {
		jest.spyOn(fs, "readFileSync").mockReturnValueOnce(JSON.stringify({}))
		const response = await supertest(app).get("/products/2")
		expect(response.statusCode).toBe(500)
	})


	test("POST create a new product", async () =>{
		jest.spyOn(fs, "readFileSync").mockReturnValueOnce(JSON.stringify({products: []}))
		jest.spyOn(fs, "writeFileSync").mockReturnValueOnce(null)
		const response = await supertest(app).post("/products/").send(dummyProduct)
		expect(response.status).toBe(200)
	})
	test("POST Create a new product with already existing entry", async () =>{
		jest.spyOn(fs, "readFileSync").mockReturnValueOnce(JSON.stringify({products: [{	"stock_number": "2",
		"name": "Pro Batteries",
		"description": "Batteries",
		"Price": "£1.99",
		}]}))
		const response = await supertest(app).post("/products/").send(dummyProduct)
		expect(response.status).toBe(403)
	})
	test("POST database failure", async () => {
		jest.spyOn(fs, "readFileSync").mockReturnValueOnce(JSON.stringify({}))
		const response = await supertest(app).post("/products/").send(dummyProduct)
		expect(response.statusCode).toBe(500)
	})
	

	test("DATABASE database creation", () =>{
		jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => {throw {code: "ENOENT"}})
		jest.spyOn(fs, "writeFileSync").mockReturnValueOnce(null)
		const resp = readDatabase()
		expect(resp).toEqual({"products":[]})
	})
	test("DATABASE failed database creation", () =>{
		jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => {throw {code: "ENOENT"}})
		jest.spyOn(fs, "writeFileSync").mockImplementationOnce(()=> {throw exampleError})
		const resp = readDatabase()
		expect(resp).toEqual(exampleError)
	})


	test("PUT edit an existing product", async () =>{
		jest.spyOn(fs, "readFileSync").mockReturnValueOnce(JSON.stringify({products: [dummyProduct]}))
		jest.spyOn(fs, "writeFileSync").mockReturnValueOnce(null)
		const response = await supertest(app).put("/products/2").send(dummyProduct2)
		expect(response.statusCode).toBe(200)
	})
	test("PUT edit a non existing product", async () =>{
		jest.spyOn(fs, "readFileSync").mockReturnValueOnce(JSON.stringify({products: [dummyProduct]}))
		jest.spyOn(fs, "writeFileSync").mockReturnValueOnce(null)
		const response = await supertest(app).put("/products/3").send(dummyProduct2)
		expect(response.statusCode).toBe(404)
	})
	test("PUT database failure", async () => {
		jest.spyOn(fs, "readFileSync").mockReturnValueOnce(JSON.stringify({}))
		const response = await supertest(app).put("/products/2").send(dummyProduct2)
		expect(response.statusCode).toBe(500)
	})
	// test("PUT error updating existing product", async () =>{
	// 	jest.spyOn(fs, "readFileSync").mockReturnValueOnce(JSON.stringify({products: [dummyProduct]}))
	// 	jest.spyOn(fs, "writeFileSync").mockImplementationOnce(() => {throw exampleError})
	// 	const response = await supertest(app).put("/products/2").send(dummyProduct2)
	// 	expect(response.statusCode).toBe(500)
	// })

})